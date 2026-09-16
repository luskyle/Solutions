# 条码与图形

!!! note "状态"
    已定稿（2026-09-16）。

产品追踪离不开条码，报表界面离不开图形绘制。这条线从"条码到底是什么"讲到"代码怎么写"：原理、两种编码、字体方案、现成源码，最后是截屏和坐标网格两个图形小工具。

## 一、条码的原理：粗细与间隙在编码

条形码的外形本质是**一条条粗细不同、间隔不同的线段**，正是"粗细+间隙"这两个变量在表示字符。原笔记的总结很到位：

- **Code39**：基本 39 码只表示 44 种字符（数字 + 大写字母 + 少数字符）。信息全是数字时够用。
- **扩展 Code39**：编码规则扩展后能表示 128 种字符。
- **Code128**：也能表示 128 种字符，但编码规则和 Code39 不同，所以**线宽和间隙的分布不一样**——这就是为什么同一个值用不同码制的条码，看起来完全不同。

选码制的经验：纯数字/序列号用 Code128C（密度最高）；字母数字混合用 Code128B；必须兼容老设备时用 Code39。

### 识别原理也分两种（原笔记）

- **扫码枪**：发光 → 黑色线条吸收光波 → 未被吸收的光返回感应器 → 芯片按解码规则解析。**扫码枪与条码编码不对应（加密解密规则不一致）就无法识别**——这就是打印端乱换码制的代价。
- **手机扫码**（微信等）：摄像头本身不发光，是标准的图像识别——捕获条码 → 增大色差 → 检测线宽与间隙的像素 → 解读含义。

## 二、最快落地：条码字体

如果只是"界面显示一条条码"，装个条码字体（如 Code39 字体）就行：

1. 电脑安装条码字体文件；
2. 把显示内容字体设成该字体——**字符串直接渲染成条码线图**，编码工作甩给操作系统。

好处是开发量几乎为零；部分字体还自带"条码线下方显示可读字符"的能力。**坑**：字体方案和扫描枪的码制必须一致，否则扫出来是乱码或扫不动。

## 三、Code128：现成源码（仓库里有完整实现）

`Code128条码C#源码+带下方文字.md` 是完整的 Code128 实现，核心结构：

- 一张**编码表 DataTable**：ID / Code128A / Code128B / Code128C / **BandCode**（每字符对应的条纹编码，如 `212222`），128 个字符全表；
- 对外属性：`Height`（高度）、`ValueFont`（是否显示下方可读号码，null 则不显示）、`Magnify`（放大倍数）、`Encode` 枚举（Code128A/B/C、EAN128）；
- 绘制逻辑按 BandCode 逐段画黑白条，支持 A/B/C 子集切换。

用法一句话：**初始化编码表 → 按字符查 BandCode → 逐段绘制并可选叠加 ValueFont 文字**。完整源码见素材（343 行，此处不整段复刻）。

## 四、Code39（含扩展）：现成打印窗体

`Code39码和扩展的Code39码C#源码.md`（1000+ 行）是一整个**条码打印窗体**：条码生成 + 打印配置（份数、宽高、自动打印）+ 打印预览。核心要素：

- `Barcode` 生成器 + `PrinterSettings/PageSettings` 打印设置；
- 窗体字段设计成"病历号/姓名 → 条码"的医院场景（门诊条码打印）；
- 支持打印份数、自动打印开关。

这个窗体稍作改造（去掉医疗字段、接上自己的数据源）就是一套现成的**标签打印模块**。抄之前先明确两件事：**打印到的打印机型号**和**条码扫描枪支持的码制**。

## 五、截屏：CopyFromScreen

```csharp
private void GetScreen()
{
    // 截整个工作区（不含任务栏）
    Image myImage = new Bitmap(Screen.PrimaryScreen.WorkingArea.Right,
                               Screen.PrimaryScreen.WorkingArea.Bottom);
    Graphics g = Graphics.FromImage(myImage);
    g.CopyFromScreen(new Point(0, 0), new Point(0, 0),
                     new Size(Screen.PrimaryScreen.Bounds.Width,
                              Screen.PrimaryScreen.Bounds.Height));
    g.ReleaseHdc(g.GetHdc());
    myImage.Save(@"D:\screenshot.jpg");
}
```

**坑**：
1. 截"整个屏幕"用 `Bounds.Width/Height`，截"工作区"（不含任务栏）用 `WorkingArea`——两套尺寸别混，混了会黑边或截不全；
2. `Bitmap` 要 `Dispose()`，连续截图不释放会内存疯涨；
3. 多显示器环境要先明确"截哪块屏"，`PrimaryScreen` 只管主屏。

## 六、WPF 坐标网格：LineGeometry 铺网格

```csharp
class XySys
{
    public Canvas CreateSys(int wh, int numCell)   // 边长 + 网格阶数
    {
        Canvas canvas = new Canvas();
        for (int j = 0; j <= numCell; j++)                       // 横线
        {
            DrawLine(canvas, new Point(0, j * wh / numCell),
                             new Point(wh, j * wh / numCell));
        }
        for (int j = 0; j <= numCell; j++)                       // 纵线
        {
            DrawLine(canvas, new Point(j * wh / numCell, 0),
                             new Point(j * wh / numCell, wh));
        }
        return canvas;
    }

    void DrawLine(Canvas canvas, Point start, Point end)
    {
        LineGeometry geom = new LineGeometry { StartPoint = start, EndPoint = end };
        Path path = new Path { Stroke = Brushes.Black, StrokeThickness = 1, Data = geom };
        canvas.Children.Add(path);
    }
}
```

配合缩放：原笔记用"单元格个数缩放法"——`num -= (int)(num * r)` 缩小格数 = 放大格子，锁下限（`num < 2` 时锁定）。想平滑缩放还是用 01 专题的 `MatrixTransform.ScaleAt`。

## 结语

条码四件事：**码制选对**（纯数字选 Code128C）、**字体或源码二选一**（能抄源码就别从头写）、**扫码枪码制要和打印一致**、**打印前先确认设备**。图形这块，截屏三行、网格一个类，够用。

## 参考资料（本站素材）

- [所谓条形码](../Micro.NET/所谓条形码.md)
- [Code128条码C#源码+带下方文字](../Micro.NET/Code128条码C%23源码%2B带下方文字.md)
- [Code39码和扩展的Code39码C#源码](../Micro.NET/Code39码和扩展的Code39码C%23源码.md)
- [C#截屏操作](../Micro.NET/C%23截屏操作.md)
- [生成坐标系（网格）](../Micro.NET/生成坐标系（网格）.md)
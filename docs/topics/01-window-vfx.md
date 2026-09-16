# 无边框窗体与视觉细节

!!! note "状态"
    已定稿（2026-09-16）。

产线客户端给客户的第一印象来自窗体本身。无边框、圆角、阴影、可拖动、可缩放、弹出层定位——每一处细节都是当年逐个调出来的。这篇把 WPF/Winform 两代桌面的窗体玩法整理清楚，坑都标出来。

## 一、无边框与透明：AllowsTransparency

```xaml
<!-- False：窗体四周有系统边框（即使背景透明也有） -->
AllowsTransparency="False"

<!-- True + 背景透明：真正的全身无边框 -->
AllowsTransparency="True"
Background="Transparent"
```

**坑**：`AllowsTransparency=True` 本质是让 DWM 用分层窗口渲染，代价是：
1. 不能和部分硬件加速效果同时用（老显卡/远程桌面下表现差）；
2. `WindowStyle=None + AllowsTransparency=True` 组合下，某些附属能力（如 Aero Snap）会失效。
能不用透明就别用：用 `WindowStyle=None` + 不透明背景 + 自绘圆角，大部分"无边框"需求就够了。

## 二、阴影：不要自己画，用系统的

```xaml
<Grid.Effect>
    <DropShadowEffect ShadowDepth="-4" BlurRadius="5" Color="LightGray"/>
</Grid.Effect>
```

`DropShadowEffect` 挂在 `Effect` 上就行，`ShadowDepth` 负值让阴影向上（原笔记里就是这么用的）。比自绘半透明位图省一百倍事。

## 三、自绘标题栏：最小化 / 关闭

用一个自定义 Button 样式，两个 Click 搞定：

```csharp
private void FormMinimize(object sender, RoutedEventArgs e)
{
    WindowState = WindowState.Minimized;
}

private void FormClose(object sender, RoutedEventArgs e)
{
    Close();
}
```

配套的窗体属性：`WindowStyle="None"`、`ResizeMode`、`WindowStartupLocation="CenterScreen"`。留意 `×` 按钮的语义是"最小化到托盘"还是"退出程序"，产线软件退出前往往要先问一句。

## 四、拖动与缩放：两条路线

### 路线一：Winform 借 user32（无边框窗体的正统做法）

```csharp
private void Form1_MouseDown(object sender, MouseEventArgs e)
{
    if (e.Button == MouseButtons.Left)
    {
        ReleaseCapture();
        SendMessage(base.Handle, 0x112, 0xf012, 0);   // 0x112=WM_SYSCOMMAND, 0xf012=SC_MOVE
    }
}

[DllImport("user32.dll")]
public static extern bool ReleaseCapture();

[DllImport("user32.dll")]
public static extern bool SendMessage(IntPtr hwnd, int wMsg, int wParam, int lParam);
```

### 路线二：四角缩放监听 WM_NCHITTEST

无边框窗体连缩放都没了，需要在 `WndProc` 里拦截 `WM_NCHITTEST`，把边缘区域谎报成系统缩放热点：

```csharp
const int WM_NCHITTEST = 0x0084;
const int HTLEFT = 10, HTRIGHT = 11, HTTOP = 12;
const int HTTOPLEFT = 13, HTTOPRIGHT = 14, HTBOTTOM = 15;
const int HTBOTTOMLEFT = 0x10, HTBOTTOMRIGHT = 17;

protected override void WndProc(ref Message m)
{
    base.WndProc(ref m);
    if (m.Msg != WM_NCHITTEST || this.WindowState == FormWindowState.Maximized) return;

    Point vPoint = new Point((int)m.LParam & 0xFFFF, (int)m.LParam >> 16 & 0xFFFF);
    vPoint = PointToClient(vPoint);
    int near = 5;

    if (vPoint.X <= near)
        m.Result = (IntPtr)(vPoint.Y <= near ? HTTOPLEFT
                   : vPoint.Y >= ClientSize.Height - near ? HTBOTTOMLEFT : HTLEFT);
    else if (vPoint.X >= ClientSize.Width - near)
        m.Result = (IntPtr)(vPoint.Y <= near ? HTTOPRIGHT
                   : vPoint.Y >= ClientSize.Height - near ? HTBOTTOMRIGHT : HTRIGHT);
    else if (vPoint.Y <= near)
        m.Result = (IntPtr)HTTOP;
    else if (vPoint.Y >= ClientSize.Height - near)
        m.Result = (IntPtr)HTBOTTOM;
}
```

（WPF 下拖动用 `DragMove()` 即可，缩放仍然要靠 `WM_NCHITTEST`。）

## 五、缩放画布：矩阵变换

绘制坐标系/图纸类界面，滚轮缩放用 `MatrixTransform.ScaleAt`，以鼠标位置为中心缩放：

```csharp
private void CanvasListPnl_MouseWheel(object sender, MouseWheelEventArgs e)
{
    var center = getPosition(sender, e);
    var scale = (e.Delta > 0 ? 1.2 : 1 / 1.2);

    var matrix = transForm.Matrix;
    matrix.ScaleAt(scale, scale, center.X, center.Y);
    transForm.Matrix = matrix;

    DrawXYAxis(28, 34);   // 缩放后重绘内容
}

Point getPosition(object sender, MouseEventArgs e)
{
    return e.GetPosition(sender as UIElement) * transForm.Matrix;   // 关键：坐标要乘矩阵
}
```

**坑**：缩放中心是"鼠标所在位置"，计算 `getPosition` 时**必须乘上当前矩阵**，否则缩放点会漂。

## 六、Popup 定位：绑定目标后要手动偏

Popup 做按钮的弹出菜单，`PlacementTarget` 绑定按钮后，它默认取按钮的某个角做起点，往往不是你要的位置：

```xaml
<Popup PlacementTarget="{Binding ElementName=btnMenu}"
       HorizontalOffset="-10" VerticalOffset="-5">
</Popup>
```

**坑**：要让 Popup 出现在按钮**正上方**，`HorizontalOffset` 一般取负值（原笔记原话）；值要靠调，别指望默认值。

## 七、跨窗体共享资源的坑

多个窗体引用同一个样式资源，前一个窗体里"样式中定义的形状不显示"。这是资源作用域问题——**资源放在定义方，引用方要用 `DynamicResource` 而不是 `StaticResource`**：

```xaml
<!-- 引用窗体的 Window.Resources 里声明，引用处用 DynamicResource -->
<Window.Resources>
    <controls:MyShapeStyle x:Key="ShapeStyle"/>
</Window.Resources>
<Ellipse Style="{DynamicResource ShapeStyle}"/>
```

（原笔记的解法就是：放 `<Window.Resources>` + 用 `DynamicResource`。）

## 八、不规则窗体：Region 大法

不规则窗体（异形、圆形按钮）用 `Region` 做裁剪。原笔记的做法：拿位图的左上角颜色当透明色，逐行扫描不透明像素生成 `GraphicsPath`：

```csharp
GraphicsPath graphicsPath = new GraphicsPath();
Color colorTransparent = bitmap.GetPixel(0, 0);      // 左上角颜色 = 透明色

for (int row = 0; row < bitmap.Height - 1; row++)
{
    for (int col = 0; col < bitmap.Width - 1; col++)
    {
        if (bitmap.GetPixel(col, row) != colorTransparent)
        {
            int colStart = col;
            while (col < bitmap.Width && bitmap.GetPixel(col, row) != colorTransparent)
                col++;                                  // 找连续不透明段
            graphicsPath.AddRectangle(new Rectangle(colStart, row, col - colStart, 1));
        }
    }
}
form.Region = new Region(graphicsPath);
```

配套：`FormBorderStyle.None`、背景图 = 位图、`TransparencyKey` 兜底。**坑**：`GetPixel` 逐像素很慢，只适合小图；不规则窗体的拖动还是要靠第四节那条 user32 路线。

## 九、淡出窗体

关窗前的体面收尾：Timer 逐步降 `Opacity`，降到阈值再真的 `Close()`：

```csharp
Timer timer = new Timer();
timer.Interval = 50;
timer.Tick += (s, e) =>
{
    form.Opacity -= 0.05;
    if (form.Opacity <= 0.2)
    {
        timer.Stop();
        form.Close();
    }
};
timer.Start();
```

## 结语

无边框窗体的坑高度集中：**透明与性能**（AllowsTransparency 慎开）、**缩放坐标**（必须乘矩阵）、**资源作用域**（DynamicResource）、**拖动缩放**（借 user32）。窗体细节做得好不好，就是产线操作员第一眼"这软件专不专业"的判断依据。

## 参考资料（本站素材）

- [WPF AllowsTransparency 的作用](../Micro.NET/WPF%20AllowsTransparency%20的作用.md)
- [WPF为控件四周添加淡淡的阴影效果](../Micro.NET/WPF为控件四周添加淡淡的阴影效果.md)
- [wpf最小化关闭窗体](../Micro.NET/wpf最小化关闭窗体.md)
- [利用user32.dll拖动窗体](../Micro.NET/利用user32.dll拖动窗体.md)
- [发送windows命令用于拖动四角更改窗体大小.cs](../Micro.NET/发送windows命令用于拖动四角更改窗体大小.cs)
- [WPF缩放-矩阵变换](../Micro.NET/WPF缩放-矩阵变换.md)
- [Popup控件的位置问题](../Micro.NET/Popup控件的位置问题.md)
- [WPF不同窗体引用同个资源导致前一个窗体资源在窗体中不显示的问题](../Micro.NET/WPF不同窗体引用同个资源导致前一个窗体资源在窗体中不显示的问题.md)
- [不规则窗体demo](../Micro.NET/不规则窗体demo.md)
- [淡出窗体](../Micro.NET/淡出窗体.md)
- [重载Paint画圆角窗体.cs](../Micro.NET/重载Paint画圆角窗体.cs)
- [WPF样例大全](../Micro.NET/WPF样例大全.md)
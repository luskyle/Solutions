# 1. Attribute+反射代码示例

```csharp
using System;
using System.Reflection;

// An enumeration of animals. Start at 1 (0 = uninitialized).
public enum Animal {
    // Pets.
    Dog = 1,
    Cat,
    Bird,
}

// A custom attribute to allow a target to have a pet.
public class AnimalTypeAttribute : Attribute {
    // The constructor is called when the attribute is set.
    public AnimalTypeAttribute(Animal pet) {
        thePet = pet;
    }

    // Keep a variable internally ...
    protected Animal thePet;

    // .. and show a copy to the outside world.
    public Animal Pet {
        get { return thePet; }
        set { thePet = value; }
    }
}

// A test class where each method has its own pet.
class AnimalTypeTestClass {
    [AnimalType(Animal.Dog)]
    public void DogMethod() {}

    [AnimalType(Animal.Cat)]
    public void CatMethod() {}

    [AnimalType(Animal.Bird)]
    public void BirdMethod() {}
}

class DemoClass {
    static void Main(string[] args) {
        AnimalTypeTestClass testClass = new AnimalTypeTestClass();
        Type type = testClass.GetType();
        // Iterate through all the methods of the class.
        foreach(MethodInfo mInfo in type.GetMethods()) {
            // Iterate through all the Attributes for each method.
            foreach (Attribute attr in
                Attribute.GetCustomAttributes(mInfo)) {
                // Check for the AnimalType attribute.
                if (attr.GetType() == typeof(AnimalTypeAttribute))
                    Console.WriteLine(
                        "Method {0} has a pet {1} attribute.",
                        mInfo.Name, ((AnimalTypeAttribute)attr).Pet);
            }

        }
    }
}
/*
 * Output:
 * Method DogMethod has a pet Dog attribute.
 * Method CatMethod has a pet Cat attribute.
 * Method BirdMethod has a pet Bird attribute.
 */
```


# 2. Bitmap拼接-传统方法

```csharp
 #region 自定义方法，直接操作 Bitmap 合并，会有性能问题

        [Obsolete]
        public static Drawing.Bitmap CombineBitmap_H(string[] paths)
        {
            if (paths.Length <= 1)
            {
                throw new ArgumentException("Combining operation need two images at least.");
            }

            var img0 = new Drawing.Bitmap(paths[0]);
            Drawing.Bitmap imgNext, tmpImg = img0;

            for (int i = 1; i < paths.Length; i++)
            {
                imgNext = new Drawing.Bitmap(paths[i]);
                tmpImg = Merge_H(tmpImg, imgNext, PixelFormat.Format24bppRgb);
            }

            return tmpImg;
        }

        [Obsolete]
        public static Drawing.Bitmap CombineBitmap_V(string[] paths)
        {
            if (paths.Length <= 1)
            {
                throw new ArgumentException("Combining operation need two images at least.");
            }

            var img0 = new Drawing.Bitmap(paths[0]);
            Drawing.Bitmap imgNext, tmpImg = img0;

            for (int i = 1; i < paths.Length; i++)
            {
                imgNext = new Drawing.Bitmap(paths[i]);
                tmpImg = Merge_V(tmpImg, imgNext, PixelFormat.Format24bppRgb);
            }

            return tmpImg;
        }

        /// <summary>
        /// 将源图像灰度化，并转化为8位灰度图像。
        /// </summary>
        /// <param name="original"> 源图像。 </param>
        /// <returns> 8位灰度图像。 </returns>
        private Bitmap RgbToGrayScale(Bitmap original)
        {
            if (original != null)
            {
                // 将源图像内存区域锁定
                Rectangle rect = new Rectangle(0, 0, original.Width, original.Height);
                BitmapData bmpData = original.LockBits(rect, ImageLockMode.ReadOnly,
                        PixelFormat.Format24bppRgb);

                // 获取图像参数
                int width = bmpData.Width;
                int height = bmpData.Height;
                int stride = bmpData.Stride;  // 扫描线的宽度,比实际图片要大
                int offset = stride - width * 3;  // 显示宽度与扫描线宽度的间隙
                IntPtr ptr = bmpData.Scan0;   // 获取bmpData的内存起始位置的指针
                int scanBytesLength = stride * height;  // 用stride宽度，表示这是内存区域的大小

                // 分别设置两个位置指针，指向源数组和目标数组
                int posScan = 0, posDst = 0;
                byte[] rgbValues = new byte[scanBytesLength];  // 为目标数组分配内存
                Marshal.Copy(ptr, rgbValues, 0, scanBytesLength);  // 将图像数据拷贝到rgbValues中
                // 分配灰度数组
                byte[] grayValues = new byte[width * height]; // 不含未用空间。
                // 计算灰度数组

                byte blue, green, red;
                for (int i = 0; i < height; i++)
                {
                    for (int j = 0; j < width; j++)
                    {

                        blue = rgbValues[posScan];
                        green = rgbValues[posScan + 1];
                        red = rgbValues[posScan + 2];
                        grayValues[posDst] = (byte)((blue + green + red) / 3);
                        posScan += 3;
                        posDst++;

                    }
                    // 跳过图像数据每行未用空间的字节，length = stride - width * bytePerPixel
                    posScan += offset;
                }

                // 内存解锁
                Marshal.Copy(rgbValues, 0, ptr, scanBytesLength);
                original.UnlockBits(bmpData);  // 解锁内存区域

                // 构建8位灰度位图
                Bitmap retBitmap = BuiltGrayBitmap(grayValues, width, height);
                return retBitmap;
            }
            else
            {
                return null;
            }
        }

        /// <summary>
        /// 用灰度数组新建一个8位灰度图像。
        /// </summary>
        /// <param name="rawValues"> 灰度数组(length = width * height)。 </param>
        /// <param name="width"> 图像宽度。 </param>
        /// <param name="height"> 图像高度。 </param>
        /// <returns> 新建的8位灰度位图。 </returns>
        private Bitmap BuiltGrayBitmap(byte[] rawValues, int width, int height)
        {
            // 新建一个8位灰度位图，并锁定内存区域操作
            Bitmap bitmap = new Bitmap(width, height, PixelFormat.Format8bppIndexed);
            BitmapData bmpData = bitmap.LockBits(new Rectangle(0, 0, width, height),
                 ImageLockMode.WriteOnly, PixelFormat.Format8bppIndexed);

            // 计算图像参数
            int offset = bmpData.Stride - bmpData.Width;        // 计算每行未用空间字节数
            IntPtr ptr = bmpData.Scan0;                         // 获取首地址
            int scanBytes = bmpData.Stride * bmpData.Height;    // 图像字节数 = 扫描字节数 * 高度
            byte[] grayValues = new byte[scanBytes];            // 为图像数据分配内存

            // 为图像数据赋值
            int posSrc = 0, posScan = 0;                        // rawValues和grayValues的索引
            for (int i = 0; i < height; i++)
            {
                for (int j = 0; j < width; j++)
                {
                    grayValues[posScan++] = rawValues[posSrc++];
                }
                // 跳过图像数据每行未用空间的字节，length = stride - width * bytePerPixel
                posScan += offset;
            }

            // 内存解锁
            Marshal.Copy(grayValues, 0, ptr, scanBytes);
            bitmap.UnlockBits(bmpData);  // 解锁内存区域

            // 修改生成位图的索引表，从伪彩修改为灰度
            ColorPalette palette;
            // 获取一个Format8bppIndexed格式图像的Palette对象
            using (Bitmap bmp = new Bitmap(1, 1, PixelFormat.Format8bppIndexed))
            {
                palette = bmp.Palette;
            }
            for (int i = 0; i < 256; i++)
            {
                palette.Entries[i] = Color.FromArgb(i, i, i);
            }
            // 修改生成位图的索引表
            bitmap.Palette = palette;

            return bitmap;
        }

        private static Bitmap Merge_H(Bitmap left, Bitmap right, PixelFormat format)
        {
            if (!(format == PixelFormat.Format8bppIndexed || format == PixelFormat.Format24bppRgb))
            {
                throw new ArgumentException("Only 8 bit or 24 bit deep bmp image can be merge");
            }

            int n = 1;
            if (format == PixelFormat.Format24bppRgb)
            {
                n = 3;
            }

            Bitmap bmpOut = new Bitmap(left.Width + right.Width, left.Height);
            unsafe
            {
                BitmapData leftData = left.LockBits(new Rectangle(0, 0, left.Width, left.Height), ImageLockMode.ReadOnly, format);
                byte* leftPtr = (byte*)(void*)leftData.Scan0;

                BitmapData rightData = right.LockBits(new Rectangle(0, 0, right.Width, left.Height), ImageLockMode.ReadOnly, format);
                byte* rightPtr = (byte*)(void*)rightData.Scan0;

                BitmapData outData = bmpOut.LockBits(new Rectangle(0, 0, bmpOut.Width, bmpOut.Height), ImageLockMode.ReadWrite, format);
                byte* outPtr = (byte*)(void*)outData.Scan0;

                int outStride = outData.Stride;
                int offL = leftData.Stride - n * left.Width;
                int offR = rightData.Stride - n * right.Width;
                for (int y = 0; y < left.Height; ++y)
                {
                    for (int x = 0; x < leftData.Width * n; ++x)
                    {
                        outPtr[outStride * y + x] = leftPtr[0];
                        ++leftPtr;
                    }
                    leftPtr += offL;

                    for (int x = 0; x < rightData.Width * n; ++x)
                    {
                        outPtr[outStride * y + n * left.Width + x] = rightPtr[0];
                        ++rightPtr;
                    }
                    rightPtr += offR;
                }

                left.UnlockBits(leftData);
                right.UnlockBits(rightData);
                bmpOut.UnlockBits(outData);
                return bmpOut;
            }
        }

        private static Bitmap Merge_V(Bitmap bottom, Bitmap top, PixelFormat format)
        {
            if (!(format == PixelFormat.Format8bppIndexed || format == PixelFormat.Format24bppRgb))
            {
                throw new ArgumentException("Only 8 bit or 24 bit deep bmp image can be merge");
            }

            int n = 1;
            if (format == PixelFormat.Format24bppRgb)
            {
                n = 3;
            }

            Bitmap bmpOut = new Bitmap(bottom.Width, bottom.Height + top.Height);
            unsafe
            {
                BitmapData bottomData = bottom.LockBits(new Rectangle(0, 0, bottom.Width, bottom.Height), ImageLockMode.ReadOnly, format);
                byte* bottomPtr = (byte*)(void*)bottomData.Scan0;

                BitmapData topData = top.LockBits(new Rectangle(0, 0, top.Width, top.Height), ImageLockMode.ReadOnly, format);
                byte* topPtr = (byte*)(void*)topData.Scan0;

                BitmapData outData = bmpOut.LockBits(new Rectangle(0, 0, bmpOut.Width, bmpOut.Height), ImageLockMode.ReadWrite, format);
                byte* outPtr = (byte*)(void*)outData.Scan0;

                int outStride = outData.Stride;
                int offB = bottomData.Stride - n * bottom.Width;
                int offT = topData.Stride - n * top.Width;

                for (int y = 0; y < top.Height; ++y)
                {
                    for (int x = 0; x < topData.Width * n; ++x)
                    {
                        outPtr[outStride * y + x] = topPtr[0];
                        ++topPtr;
                    }
                    topPtr += offT;
                }

                for (int y = 0; y < bottom.Height; y++)
                {
                    for (int x = 0; x < bottomData.Width * n; ++x)
                    {
                        outPtr[outStride * y + n * top.Width * top.Height + x] = bottomPtr[0];
                        ++bottomPtr;
                    }
                    bottomPtr += offB;
                }

                bottom.UnlockBits(bottomData);
                top.UnlockBits(topData);
                bmpOut.UnlockBits(outData);
                return bmpOut;
            }
        }

        private Drawing.Bitmap CombineBitmap_H(Drawing.Bitmap first, Drawing.Bitmap second)
        {
            int width = first.Width + second.Width;
            int height = Math.Max(first.Height, second.Height);
            var newBitmap = new Drawing.Bitmap(first.Width + second.Width, height);
            for (var i = 0; i <= first.Width - 1; i++)
            {
                for (var j = 0; j <= first.Height - 1; j++)
                {
                    var c = first.GetPixel(i, j);
                    newBitmap.SetPixel(i, j, c);
                }
            }

            for (var i = 0; i <= second.Width - 1; i++)
            {
                for (var j = 0; j <= second.Height - 1; j++)
                {
                    var c = second.GetPixel(i, j);
                    newBitmap.SetPixel(i + first.Width, j, c);
                }
            }

            first?.Dispose();
            second?.Dispose();
            return newBitmap;
        }

        private Drawing.Bitmap CombineBitmap_V(Drawing.Bitmap first, Drawing.Bitmap second)
        {
            int height = first.Height + second.Height;
            int width = Math.Max(first.Width, second.Width);
            var newBitmap = new Drawing.Bitmap(width, height);
            for (var i = 0; i <= first.Width - 1; i++)
            {
                for (var j = 0; j <= first.Height - 1; j++)
                {
                    var c = first.GetPixel(i, j);
                    newBitmap.SetPixel(i, j, c);
                }
            }

            for (var i = 0; i <= second.Width - 1; i++)
            {
                for (var j = 0; j <= second.Height - 1; j++)
                {
                    var c = second.GetPixel(i, j);
                    newBitmap.SetPixel(i, j + first.Height, c);
                }
            }

            first?.Dispose();
            second?.Dispose();
            return newBitmap;
        }

        #endregion

          
                    #region Emgu.CV 方法

        public static Image<Bgr, byte> ConcatHV(string[][] paths)
        {
            var images = new List<Image<Bgr, byte>>();
            foreach (var hpath in paths)
            {
                images.Add(ConcatH(hpath));
            }

            Image<Bgr, byte> imgNext, tmpImg = images[0];
            for (int i = 1; i < images.Count; i++)
            {
                imgNext = images[i];
                CvInvoke.VConcat(imgNext.Mat, tmpImg.Mat, tmpImg.Mat);
            }

            return tmpImg;
        }

        public static Image<Bgr, byte> ConcatH(string[] paths)
        {
            if (paths.Length <= 1)
            {
                throw new ArgumentException("concatenating operation need two images at least.");
            }

            var img0 = new Image<Bgr, byte>(paths[0]);
            Image<Bgr, byte> imgNext, tmpImg = img0;

            for (int i = 1; i < paths.Length; i++)
            {
                imgNext = new Image<Bgr, byte>(paths[i]);
                CvInvoke.HConcat(tmpImg.Mat, imgNext.Mat, tmpImg.Mat);
            }

            return tmpImg;
        }

        public static Image<Bgr, byte> ConcatV(string[] paths)
        {
            if (paths.Length <= 1)
            {
                throw new ArgumentException("concatenating operation need two images at least.");
            }

            var img0 = new Image<Bgr, byte>(paths[0]);
            Image<Bgr, byte> imgNext, tmpImg = img0;

            for (int i = 1; i < paths.Length; i++)
            {
                imgNext = new Image<Bgr, byte>(paths[i]);
                CvInvoke.VConcat(imgNext.Mat, tmpImg.Mat, tmpImg.Mat);
            }

            return tmpImg;
        }

        #endregion

```


# 3. C# 5s一做任务


```csharp
System.Timers.Timer _timer5s = new System.Timers.Timer();   //5s
private bool PrinterServerStatus;

_timer5s.Interval = 5000;

#region 每5s 触发的事件
_timer5s.Elapsed += (oo, ee) => {
string host = "192.168.10.10";

Ping p1 = new Ping();
PingReply reply = p1.Send(host); //发送主机名或Ip地址

if (reply.Status == IPStatus.Success)
PrinterServerStatus = true;
else if (reply.Status == IPStatus.TimedOut)
PrinterServerStatus = false;
};
#endregion

_timer5s.Start();
```


# 4. C#，Framework与visual studio比较


本文参考CSDN博文 `Visual Studio各版本区别`,`https://blog.csdn.net/MYsce/article/details/70879943?locationNum=16&fps=1`，与 `C#本质论 第4版 C#5.0`写成。感谢博主转载，感谢作者原创。

到2018年，C#已经到了6.0，framework为4.7，Visual Studio为2018，windows为10。

##### 一、vs2005，C#2.0，framework2.0

vs2005对应 `C#2.0`，`framework 2.0`。05版的 `visual studio`支持 `winform`开发，`ASP.NET`网站开发，支持 `C#`，`C++`，`Visual Basic`，`Visual J#` 等开发语言，但不支持换行转义；如sql语句

```c#
string sqlStr=@"select t.diagnosis_code
  				from pat_diagnosis t
 				where t.diagnosis_code = '97.26'";
```

这么写在vs2005中就是非法（执行报错）的，而在更高版本的vs中是合法（不报错）的。

2.0的 `framework`不支持 `linq`查询，不支持 `WPF`开发。

##### 二、vs2008，C#3.0，framework3.5

`framework3.0`让开发者可以开发WPF应用程序，真正与IDE工具集成是在vs2008版本中。08版本的vs是功能相对全面完整的IDE工具，不仅支持WPF开发，还支持 `LINQ`查询，`AJAX`交互。`framework3.5`兼容 `framework2.0`、`framework3.0`。vs2008取消支持 `J#`。

##### 三、vs2010，C#4.0，framework4.0

10版本的vs是非常经典的一个版本。最大的特点是支持 `三屏一云`开发，即 `PC屏，平板屏，手机屏，Windows Azure`。引入了新语言 `F#`。最佳搭配系统是 `win7`。这个版本的 `c#`添加了对动态类型的支持，对多线程编程API进行了大幅改进。

##### 四、vs2012，c#5.0，framework4.5

vs2012中可以开发windows8应用。这个版本的c#支持调用异步方法，不需要显示注册委托回调。4.5的framework支持对WinRT(Windows Runtime)的互操作性。

##### 五、后续版本的vs，framework

vs2012后又陆续推出了vs2013，vs2015，vs2017，vs2018。framework也逐渐升级：framework4.5.1，framework4.5.2，framework4.5.3，framework4.6，framework4.6.1，framework4.6.2。而visual studio功能则更为全面:支持Git，支持Unity，支持跨平台移动开发 ，支持web 和云开发 ；交互性也更为良好。


# C# WPF实现鼠标拖动的代码片


```csharp
///可表示实时拖动
void xxx_PreviewMouseLeftButtonUp(System.Object sender, System.Windows.Input.MouseButtonEventArgs e)
{
    IsMouseLeftBtnDown = false;
    IsMouseLeftBtnUp = true;
}

/// <summary>
/// 是否按下鼠标左键
/// </summary>
private bool IsMouseLeftBtnDown = false;
/// <summary>
/// 是否松开鼠标左键
/// </summary>
private bool IsMouseLeftBtnUp = true;
/// <summary>
/// 鼠标拖动期间 x轴偏移量
/// </summary>
private double xOffset = 0;
/// <summary>
/// 鼠标按下点在X轴的位置
/// </summary>
private double xDown = 0;
/// <summary>
/// 鼠标松开点在X轴的位置
/// </summary>
private double xUp = 0;

void xxx_PreviewMouseLeftButtonDown(System.Object sender, System.Windows.Input.MouseButtonEventArgs e)
{
    IsMouseLeftBtnDown = true;
    IsMouseLeftBtnUp = false;

	xDown = e.GetPosition(this).X;
}

void xxx_PreviewMouseMove(System.Object sender, System.Windows.Input.MouseEventArgs e)
{
    if (IsMouseLeftBtnDown && !IsMouseLeftBtnUp)
    {
        xUp = e.GetPosition(this).X;
        xOffset = xDown - xUp;
        xDown = xMove;//改变当前鼠标按下位置，这样曲线就可以随着鼠标移动方向而准确移动

        txTagName8.Text = xOffset.ToString();
    }
}


///鼠标弹起时发生操作，这样就不是实时的了
void CurvePnl_PreviewMouseLeftButtonUp(System.Object sender, System.Windows.Input.MouseButtonEventArgs e)
{
    IsMouseLeftBtnDown = false;
    IsMouseLeftBtnUp = true;
  
    xUp = e.GetPosition(this).X;
    xOffset = xDown - xUp;
    xDown = xMove;//改变当前鼠标按下位置，这样曲线就可以随着鼠标移动方向而准确移动

    txTagName8.Text = xOffset.ToString();
}

/// <summary>
/// 是否按下鼠标左键
/// </summary>
private bool IsMouseLeftBtnDown = false;
/// <summary>
/// 是否松开鼠标左键
/// </summary>
private bool IsMouseLeftBtnUp = true;
/// <summary>
/// 鼠标拖动期间 x轴偏移量
/// </summary>
private double xOffset = 0;
/// <summary>
/// 鼠标按下点在X轴的位置
/// </summary>
private double xDown = 0;
/// <summary>
/// 鼠标松开点在X轴的位置
/// </summary>
private double xUp = 0;

void CurvePnl_PreviewMouseLeftButtonDown(System.Object sender, System.Windows.Input.MouseButtonEventArgs e)
{
    IsMouseLeftBtnDown = true;
    IsMouseLeftBtnUp = false;

    xDown = e.GetPosition(this).X;
}

void CurvePnl_PreviewMouseMove(System.Object sender, System.Windows.Input.MouseEventArgs e)
{
    if (IsMouseLeftBtnDown && !IsMouseLeftBtnUp)
    {
        //这里没有操作
    }
}

```

以上就是鼠标拖动的两种刷新策略。


#### C# 如何得到XML文件中指定的节点属性值

xml文档如下：

```xml
<?xml version="1.0" encoding="utf-8" ?>
<Root>
  <FuncList type="Circle">
    <Item>中点画圆算法</Item>
    <Item>中点椭圆算法</Item>
  </FuncList>
  <FuncList type="Square">
    <Item>正方形生成算法</Item>
    <Item>长方形生成算法</Item>
  </FuncList>
  <FuncList type="StraitLine">
    <Item>直线生成算法</Item>
  </FuncList>
  <FuncList type="Curve">
    <Item>曲线生成算法</Item>
  </FuncList>
  <FuncList type="Character">
    <Item>英文字符生成算法</Item>
    <Item>汉字生成算法</Item>
    <Item>特殊字符生成算法</Item>
  </FuncList>
  <FuncList type="Transform">
    <Item>平移算法</Item>
    <Item>旋转算法</Item>
  </FuncList>
  <FuncList type="Setting">
    <Item>线宽设置</Item>
    <Item>线型设置</Item>
    <Item>线颜色设置</Item>
  </FuncList>
</Root>
```

这样获取

```c#
var x=n.Attributes["type"].Value;
```


## C# 中字符串转换成日期

我们在处理字符串日期格式常用DateTime.Pares() 但是这个形式的转换是相当有限的，有些C#是会不懂你写入的日期格式的如20031231。那么类似 "20100101" 或者其它形式的字符串如何转换成日期型呢?

**一、拼接字符串的形式**

```csharp
DateTime dt=Convert.ToDateTime("20100101".Substring(0,4)+"-"+"20100101".Substring(4,2)+"-"+"20071107".Substring(6,2));  
```

**二、Convert.ToDateTime(string)**

string格式有要求，必须是yyyy-MM-dd hh:mm:ss

**三、Convert.ToDateTime(string, IFormatProvider)**

```csharp
DateTime dt;
```

```
DateTimeFormatInfo dtFormat = new System.GlobalizationDateTimeFormatInfo();
```

```csharp
dtFormat.ShortDatePattern = "yyyy/MM/dd";
```

```csharp
dt = Convert.ToDateTime("2011/05/26", dtFormat);
```

**四、DateTime.ParseExact()**

```csharp
string dateString = "20110526";
```

```csharp
DateTime dt = DateTime.ParseExact(dateString, "yyyyMMdd", System.Globalization.CultureInfo.CurrentCulture);
```

```csharp
//或者
```

```csharp
DateTime dt = DateTime.ParseExact(dateString, "yyyyMMdd", System.Globalization.CultureInfo.InvariantCulture);
```

**五、DateTime.TryParse(string,out datetime)**

1、更多时候，会采用DateTime.TryParse(string,out datetime)方法，因为此方法有安全机制，当string内容不正确时，可以返回日期的最小值MinValue。并且可以通过返回的bool值判断转化是否成功。而DateTime.ParseExact()需要按特定的格式来转换，对格式的要求比较严，如果string中不是日期内容，而量类似“asdfasd”的字符串，则会出错。

2、用DateTime.TryParse(string,out datetime)转换后，得到的datetime可以用 datetime.ToString("ddd, MMM. dd")来转换为特殊需求的格式，比较灵活方便。



#### C#`dataGridView` `Remove()`不会清除 `dataGridView`行

想要清除 `dataGridView`？循环移除行是不行的：

```c#
foreach (DataGridViewRow row in dataGridView.Rows)
{
	dataGridView.Rows.Remove(row);
}
或
for (int i = 0; i < dataGridView.Rows.Count; i++)
{
    dataGridView.Rows.RemoveAt(i);
}
```

已有项的 `dataGridView`不会删除这些项，执行到最后项仍存在，即使 `dataGridView`的Row Count数的确在减小。这算是Bug吧?

完全清除需要这么做：

```csharp
dataGridView.Rows.Clear();
```


#### C#Drawing.Color转Media.Color

需如此转换

```csharp
SolidColorBrush sldColor = new SolidColorBrush(System.Windows.Media.Color.FromArgb(dcolor.A,dcolor.R, dcolor.G, dcolor.B));
```


#### C#ping命令

```c#
string host = "192.168.10.10";

Ping p1 = new Ping();
PingReply reply = p1.Send(host); //发送主机名或Ip地址

StringBuilder sbuilder;
if (reply.Status == IPStatus.Success)
{
    sbuilder = new StringBuilder();
    sbuilder.AppendLine(string.Format("Address: {0} ", reply.Address.ToString()));
    sbuilder.AppendLine(string.Format("RoundTrip time: {0} ", reply.RoundtripTime));
    sbuilder.AppendLine(string.Format("Time to live: {0} ", reply.Options.Ttl));
    sbuilder.AppendLine(string.Format("Don't fragment: {0} ", reply.Options.DontFragment));
    sbuilder.AppendLine(string.Format("Buffer size: {0} ", reply.Buffer.Length));
    MessageBox.Show(sbuilder.ToString());
}

else if (reply.Status == IPStatus.TimedOut)
{
	MessageBox.Show("超时");
}
else
{
	MessageBox.Show("失败");
}
```



#### C#`using`语句用例一则

开发中想要能够多次打开相同资源而不报错，这就需要每次用完这个资源后立即释放。于是就是用了 `using`语句。这样用：

```csharp
BinaryReader br = new BinaryReader(File.Open(vFileName, FileMode.Open));

string faultPointLocation = br.ReadByte().ToString();//故障点位置
string temp = br.ReadByte().ToString();
string cyCleNum = br.ReadByte().ToString();//循环次数

using (br) {/*用来释放文件对象,这样就可以重复打开相同文件 */}
```

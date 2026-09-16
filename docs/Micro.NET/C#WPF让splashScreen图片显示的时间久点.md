#### C#WPF让`splashScreen`图片显示的时间久点

为WPF添加一个主窗体启动前的图片，可以这样做：

右击项目 => 添加图片 => 右击图片 => 属性，将生成属性改成 `SplashScreen`。

或者，打开`.csproj`文件，添加

```csharp
<ItemGroup>
    <SplashScreen Include="图名.图片格式" />
</ItemGroup>

```

添加完运行时，一定要先右击项目`重新生成`，否则就会出现`具有相同的key`的错误，从而导致主窗体上引用的图片，一些样式失效。

运行成功后，主窗体启动前将显示这个图片。但是问题是该图片一闪而过。

网上流传的版本是`把图片做成嵌入的资源，然后声明一个splashScreen对象，之后Show,考虑Close(new TimeSpan())`什么的。事实上，这个方案完全不可行。

`Close(new TimeSpan(0,0,10))`这种方法并不会按照想象的那样等10s关闭。事实上，这个方法也不是那个意思。反之效果仍然是一闪而过。解决问题的关键是让主线程休眠一段时间。原因是，`SplashScreen`或者说这个要先显示的图片的显示时间是主线程（主窗体）完全起来前的那段时间。这段时间的长短不取决于这个图片何时关闭。也就是说，并不是设定了这个图片何时关闭，主窗体就在它关闭后才出现的。相反，让主窗体晚显示t段时间，那张图片就多显示t段时间。而让主窗体晚显示的方法就是让主线程休眠。所以，可以在App类中如此控制：

```csharp
/// <summary>
/// App.xaml 的交互逻辑
/// </summary>
public partial class App : Application
{
    App()
    {
        //让线程休眠2s
        System.Threading.Thread.Sleep(2000);
    }
}
```


#### wpf给自定义控件定义事件

首先项目中添加`UserControl.xaml`，名称改为`MyUserButton.xaml`。

修改`xaml`文件如下：

```xml
Button x:Class="UserButtonTest.MyUserButton"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" 
             xmlns:d="http://schemas.microsoft.com/expression/blend/2008" 
             xmlns:local="clr-namespace:UserButtonTest"
             mc:Ignorable="d" 
             d:DesignHeight="300" d:DesignWidth="300"
             Background="Transparent" BorderThickness="0" x:Name="dd">

    <Button.Template>
        <ControlTemplate>
            <Grid>
                <Border Name="border" BorderThickness="3" CornerRadius ="5" Background="#FFFFCC" BorderBrush="#FF6633">
                    <Border BorderThickness="0" Height="20">
                        <Viewbox VerticalAlignment="Center" HorizontalAlignment="Center">
                            <TextBlock Name="tb" Text="{Binding RelativeSource={x:Static RelativeSource.Self},Path=Text}">ee</TextBlock>
                        </Viewbox>
                    </Border>
                </Border>
            </Grid>
        </ControlTemplate>
    </Button.Template>
    
</Button>
```

修改对应的`.cs`文件如下：

```csharp
namespace UserButtonTest
{
    /// <summary>
    /// MyUserButton.xaml 的交互逻辑
    /// </summary>
    public partial class MyUserButton : Button
    {
        public MyUserButton()
        {
            InitializeComponent();            
        }
    }
 }
```

对应的`.cs`文件中添加Click事件

```csharp
 public static readonly RoutedEvent clickEvent =
             EventManager.RegisterRoutedEvent("ClickF", RoutingStrategy.Bubble, typeof(RoutedEventHandler), typeof(MyUserButton));

        public event RoutedEventHandler ClickF
        {
            add
            {
                AddHandler(clickEvent,value);
            }

            remove
            {
                RemoveHandler(clickEvent, value);
            }
        }
         
        protected override void OnClick()
        {
            RoutedEventArgs args = new RoutedEventArgs(clickEvent, this);
            RaiseEvent(args);
        }
```

然后在`MainWindow.xaml`中引用这个控件

```xml
<Window x:Class="UserButtonTest.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
        xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
        xmlns:local="clr-namespace:UserButtonTest"////////关键是引入这句
        mc:Ignorable="d"
        Title="MainWindow" Height="350" Width="525">
    
    <Grid>
        <local:MyUserButton Width="90" Height="50" ClickF="MyUserButton_ClickF">
            
        </local:MyUserButton>
    </Grid>
</Window>

```

之后在`MainWindow.cs`文件中定义`MyUserButton_ClickF`事件

```csharp
 private void MyUserButton_ClickF(object sender, RoutedEventArgs e)
 {
   MessageBox.Show("hi");
 }
```

效果如下：

![2018-02-24_122112](C:\Users\Administrator\Desktop\MyBlogs-ING\WPF\images\2018-02-24_122112.png)
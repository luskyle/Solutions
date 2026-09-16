#### wpf为自定义控件添加属性

首先，创建`UserControl.xaml`文件，命名为`MyUserButton`，之后改成这种样式

```xml
<Button x:Class="UserButtonTest.MyUserButton"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" 
             xmlns:d="http://schemas.microsoft.com/expression/blend/2008" 
             xmlns:local="clr-namespace:UserButtonTest"
             mc:Ignorable="d" 
             d:DesignHeight="300" d:DesignWidth="300"
             Background="Transparent" BorderThickness="0">

    <Grid>
        <Border Height="50" BorderThickness="3" CornerRadius ="5" Background="#FFFFCC" BorderBrush="#FF6633">
            <Border BorderThickness="0">
                <Viewbox VerticalAlignment="Center" HorizontalAlignment="Center">
                    <TextBlock Name="tb" Text="Default Text"></TextBlock>
                </Viewbox>
            </Border>
        </Border>
    </Grid>
</Button>
```

打开对应的`.cs`文件，做如下修改

```csharp

public static readonly DependencyProperty TextProperty =
	DependencyProperty.Register("Text", typeof(string), typeof(MyUserButton), new 			PropertyMetadata("TextBox", new PropertyChangedCallback(OnTextChanged)));

public string Text
{
  get { return (string)GetValue(TextProperty); }
  set { SetValue(TextProperty, value); }
}

static void OnTextChanged(DependencyObject sender, DependencyPropertyChangedEventArgs args)
{
	((MyUserButton)sender).OnValueChanged(args);
}
protected void OnValueChanged(DependencyPropertyChangedEventArgs e)
{
	this.tb.Text = e.NewValue.ToString();
}
```

然后在`MainWindow.xaml`中引用这个控件

```xml
<local:MyUserButton Text="ddd" Width="200" Height="100" ClickF="MyUserButton_ClickF"></local:MyUserButton>
```

运行，效果如下

![2018-02-24_172134](C:\Users\Administrator\Desktop\MyBlogs-ING\WPF\images\2018-02-24_172134.png)



但是这样做有问题：Button周围有一大片作用区域，是模板定义得有问题，但如果不这样做的话，`MyUserButton.cs`中无法找到对应的`tb`控件。试了好久也不得法。如果你把问题解决了，Please @me。

![problemWPF](C:\Users\Administrator\Desktop\MyBlogs-ING\WPF\images\problemWPF.gif)




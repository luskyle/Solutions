### wpf如何最小化关闭窗体？

如下：

1、自定义的Button里添加click事件

```xml
<Button Style="{StaticResource FormButtonStyle}" Click="FormMinimize">-</Button>
<Button Style="{StaticResource FormButtonStyle}" Click="FormClose">×</Button>
```

2、对应xaml.cs文件内添加事件

```c#
private void FormMinimize(object sender, RoutedEventArgs e)
{
	WindowState = WindowState.Minimized;//最小化
}

private void FormClose(object sender, RoutedEventArgs e)
{
	Close();//关闭
}
```


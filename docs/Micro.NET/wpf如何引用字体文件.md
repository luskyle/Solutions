#### wpf如何引用字体文件？

如下：

1、下载合适的字体文件并添加到项目文件夹中。如新建的文件夹Resource。

2、App.xaml文件中添加字体资源。

```xml
<Application.Resources>
	<FontFamily x:Key="HandWrite">
      pack://application:,,,/Resources/FontFamily/#apple cider daydreams
  </FontFamily> <!--#加字体名，不是字体文件名。字体名打开字体文件可得-->
</Application.Resources>    
```

3、在需要改变字体样式的地方引用。

```xml
<TextBlock Foreground="White" FontFamily="{StaticResource HandWrite}" Text="GegSYS" />
```


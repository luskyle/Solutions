#### wpf静态资源与动态资源的区别

我的理解：一句话：静态资源是在解释器解释`MainWindow.xaml`前通过`App.xaml`链接起来的定义在各个文件内的资源；动态资源是解释器解释`MainWindow.xaml`时查找并加载到内存中的资源。

比如：

```xml
<Window x:Class="GraphElementGenerationSYS.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
        xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
        xmlns:local="clr-namespace:GraphElementGenerationSYS"
        mc:Ignorable="d"
        WindowStyle="None"
        AllowsTransparency="True"
        ResizeMode="CanMinimize"
        WindowStartupLocation="CenterScreen"              
        Title="MainWindow" Height="600" Width="900"
        Style="{DynamicResource MainWindowStyle}">////这里用的是 DynamicResource关键字

    <WindowChrome.WindowChrome>
        <WindowChrome CaptionHeight="0"/>
    </WindowChrome.WindowChrome>

    <Window.Resources>
        <Style TargetType="{x:Type local:MainWindow}" x:Key="MainWindowStyle">
            <Setter Property="Template">
                <Setter.Value>
                    <ControlTemplate TargetType="local:MainWindow">
                        <Border BorderThickness="1" BorderBrush="{StaticResource DarkBlue}">
                            <Grid Background="White">
                                <Grid.RowDefinitions>
                                    <RowDefinition Height="30"></RowDefinition>
                                    <RowDefinition Height="*"></RowDefinition>
                                </Grid.RowDefinitions>

                                <!--Title Bar-->
                                <Grid x:Name="ddd" Grid.Row="0" MouseDown="Window_MouseDown" Background="{StaticResource DarkBlack}">
                                    <Grid.ColumnDefinitions>
                                        <ColumnDefinition Width="auto"></ColumnDefinition>
                                        <ColumnDefinition Width="*"></ColumnDefinition>
                                        <ColumnDefinition Width="auto"></ColumnDefinition>
                                    </Grid.ColumnDefinitions>

                                    <!--Menu Button-Icon-->
                                    <Border Grid.Column="0" Margin="5 0 0 0 ">
                                        <Button Style="{StaticResource MenuButtonStyle}" Click="WindowMenu">
                                            <TextBlock Foreground="White" FontFamily="{StaticResource HandWrite}" Text="GegSYS" />
                                        </Button>
                                    </Border>

                                    <!--App Name-->
                                    <Viewbox Grid.Column="1">
                                        <TextBlock  Foreground="White" FontFamily="{StaticResource HandWrite}" Text="Graph Element Generation System" />
                                    </Viewbox>

                                    <!--Window Button-->
                                    <StackPanel Orientation="Horizontal" Grid.Column="2" HorizontalAlignment="Right">
                                        <Button Style="{StaticResource WindowButtonStyle}" Click="FormMinimize">-</Button>
                                        <Button Style="{StaticResource WindowButtonStyle}" Click="FormClose">×</Button>
                                    </StackPanel>
                                </Grid>

                                <!--Menu List-->
                                <Grid Grid.Row="1">
                                    <Grid.ColumnDefinitions>
                                        <ColumnDefinition Width="auto"></ColumnDefinition>
                                        <ColumnDefinition Width="*"></ColumnDefinition>
                                    </Grid.ColumnDefinitions>

                                    <ListBox Style="{StaticResource MenuListStyle}">
                                        <ListBoxItem>ggg</ListBoxItem>
                                        <ListBoxItem>dddd</ListBoxItem>
                                        <ListBoxItem>dddd</ListBoxItem>
                                        <ListBoxItem>dddd</ListBoxItem>
                                    </ListBox>
                                </Grid>

                            </Grid>
                        </Border>
                    </ControlTemplate>
                </Setter.Value>
            </Setter>
        </Style>

    </Window.Resources>
</Window>

```

这段程序中用到了`MainWindowStyle`，`DarkBlue`，`DarkBlack`，`MenuButtonStyle`，`HandWrite`，`WindowButtonStyle`，`MenuListStyle`等7个资源。他们分别定义在若干个`.xaml`文件中。不同的是，`MainWindowStyle`定义在`MainWindow.xaml`中，另外的那些都定义在其它文件中。



所以，调用这些资源的方式也不同。调用`MainWindowStyle`时只能用`DynamicResource`关键字，其余的既可以用`StaticResource`关键字也可用`DynamicResource`关键字访问（但推荐这种情况下还是用`StaticResource`）。
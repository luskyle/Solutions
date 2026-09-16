#### WPF控件叠加绘制图形

```xaml
<UserControl x:Class="RyChart.StaticCurve"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" 
             xmlns:d="http://schemas.microsoft.com/expression/blend/2008" 
             xmlns:local="clr-namespace:RyChart"
             mc:Ignorable="d" 
             d:DesignHeight="300" d:DesignWidth="300">
    <Grid>
        <Canvas Background="Transparent" Panel.ZIndex="0">
            <Rectangle Fill="Green" Width="30" Height="30" />
        </Canvas>
        <Canvas Background="Transparent" Panel.ZIndex="1">
            <Rectangle Fill="Blue" Width="30" Margin="35" Height="30" />
        </Canvas>
    </Grid>
</UserControl>

```

效果如下

![2018-10-12_103109](images\2018-10-12_103109.png)
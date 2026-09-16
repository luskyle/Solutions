#### 让UserControl内的元素与主调Window等高

关键是Binding的逻辑。

调用逻辑如下：

`Window->UsrCtrl1->UsrCtrl2`。现在想设置UsrCtrl2内元素与Window等高，就需要这样做

```xaml
//////UsrCtrl2
<UserControl x:Class="RyChart.Y"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" 
             xmlns:d="http://schemas.microsoft.com/expression/blend/2008" 
             xmlns:local="clr-namespace:RyChart"
             mc:Ignorable="d" 
             d:DesignHeight="300" d:DesignWidth="300" x:Name="YPnl">
    <Grid>
        <Canvas Width="25">
            <Rectangle HorizontalAlignment="Center" Width="10" 
                       Height="{Binding Path=Height,ElementName=YPnl}" 
                       Fill="Blue"></Rectangle>
        </Canvas>
    </Grid>
</UserControl>

```

```xaml
/////UsrCtrl1
<UserControl x:Class="RyChart.CurvePanel"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" 
             xmlns:d="http://schemas.microsoft.com/expression/blend/2008" 
             xmlns:local="clr-namespace:RyChart"
             mc:Ignorable="d" 
             d:DesignHeight="300" d:DesignWidth="500" x:Name="CurvePnl">
    <Grid>
        <Grid.ColumnDefinitions>
            <ColumnDefinition Width="auto"></ColumnDefinition>
            <ColumnDefinition Width="7*"></ColumnDefinition>
        </Grid.ColumnDefinitions>

        <StackPanel Orientation="Horizontal" Grid.Column="0">
            <local:Y Background="Red" Height="{Binding ElementName=CurvePnl,Path=Height}"></local:Y>
        </StackPanel>
        
        <Grid Grid.Column="1">
            <Canvas Background="Transparent" Panel.ZIndex="0">
                <Rectangle Fill="Green" Width="30" Height="30" />
            </Canvas>
            <Canvas Background="Transparent" Panel.ZIndex="1">
                <Rectangle Fill="Blue" Width="30" Margin="35" Height="30" />
            </Canvas>
        </Grid>

    </Grid>
</UserControl>

```

```xaml
/////Window
<Window x:Class="WpfApplication1.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
        xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
        xmlns:local="clr-namespace:WpfApplication1"
        mc:Ignorable="d"
        Title="MainWindow" Height="350" Width="525"
        xmlns:usrCtrl="clr-namespace:RyChart;assembly=RyChart">
    <Grid>
        <!--<usrCtrl:CurvePanel Height="{Binding RelativeSource={RelativeSource Mode=FindAncestor,AncestorType=Window},Path=Height}"></usrCtrl:CurvePanel>-->
        <usrCtrl:CurvePanel Height="50"></usrCtrl:CurvePanel>
    </Grid>
</Window>
```

这样通过Binding，仅需在最外层设置UsrCtrl的高，就能控制内部元素的高了。
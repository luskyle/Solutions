#### wpf基样式和继承样式如何写？

如下：

1、定义基样式：

```xml
<Style x:Key="FormButtonStyle" TargetType="{x:Type Button}" BasedOn="{x:Null}"><!--这里是关键-->
  <Setter Property="Width" Value="40" />
  <Setter Property="Height" Value="40" />
  <Setter Property="Background" Value="#2F3243" />
  <Setter Property="Foreground" Value="White" />
  <Setter Property="BorderThickness" Value="0" />
  <Setter Property="Template">
    <Setter.Value>
    <ControlTemplate TargetType="{x:Type Button}">
      <Border x:Name="border" BorderBrush="{TemplateBinding BorderBrush}" BorderThickness="{TemplateBinding BorderThickness}" Background="{TemplateBinding Background}" 
      SnapsToDevicePixels="true">
      <ContentPresenter x:Name="contentPresenter" HorizontalAlignment="Center" VerticalAlignment="Center" />
      </Border>
      <ControlTemplate.Triggers>
        <Trigger Property="IsMouseOver" Value="True">
            <Setter Property="Background" Value="#3F3F46" />
        </Trigger>
        <Trigger Property="IsPressed" Value="True">
            <Setter Property="Background" Value="#007ACC" />
        </Trigger>
      </ControlTemplate.Triggers>
    </ControlTemplate>
  </Setter.Value>
  </Setter>
</Style>

```

基于基样式设定新样式时候这样写：

```xml
<style x:key="CloseButtonStyle" TargetType="{x:Type Button}" BasedOn="FormButtonStyle"><!--这里是关键-->
	 <Setter Property="Template">
    <Setter.Value>
    <ControlTemplate TargetType="{x:Type Button}">
      <Border x:Name="border" BorderBrush="{TemplateBinding BorderBrush}" BorderThickness="{TemplateBinding BorderThickness}" Background="{TemplateBinding Background}" 
      SnapsToDevicePixels="true">
      <ContentPresenter x:Name="contentPresenter" HorizontalAlignment="Center" VerticalAlignment="Center" />
      </Border>
      <ControlTemplate.Triggers>
        <Trigger Property="IsMouseOver" Value="True">
            <Setter Property="Background" Value="Red" /><!--这里做了新改变-->
        </Trigger>
        <Trigger Property="IsPressed" Value="True">
            <Setter Property="Background" Value="#007ACC" />
        </Trigger>
      </ControlTemplate.Triggers>
    </ControlTemplate>
  </Setter.Value>
  </Setter>
</style>
```


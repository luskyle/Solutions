#### wpf定义ListBox样式

首先创建`ListBox`

```xml
<ListBox Style="{StaticResource MenuListStyle}">
  <ListBoxItem>ggg</ListBoxItem>
  <ListBoxItem>dddd</ListBoxItem>
  <ListBoxItem>dddd</ListBoxItem>
  <ListBoxItem>dddd</ListBoxItem>
</ListBox>

```

之后添加样式文件`MenuList.xaml`

```xml
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
                    xmlns:local="clr-namespace:GraphElementGenerationSYS.Resources">
    <Style TargetType="{x:Type ListBox}" x:Key="MenuListStyle">
        <Setter Property="Width" Value="250"/>
        <!--<Setter Property="BorderThickness" Value="1"/>
        <Setter Property="BorderBrush" Value="Red"/>-->
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate>
                    <Border BorderBrush="Red" BorderThickness="1">
                        <ItemsPresenter></ItemsPresenter>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>

    <Style TargetType="{x:Type ListBoxItem}">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="ListBoxItem">
                    <Border Background="{TemplateBinding Background}">
                        <ContentPresenter HorizontalAlignment="{TemplateBinding HorizontalContentAlignment}"
                                                 VerticalAlignment="{TemplateBinding VerticalContentAlignment}"
                                                 TextBlock.Foreground="{TemplateBinding Foreground}"/>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
        
        <!-- 设置触发器 -->
        <Style.Triggers>
            <Trigger Property="IsSelected" Value="true">
                <Setter Property="Background" Value="Black"/>
                <Setter Property="Foreground" Value="White"/>
            </Trigger>
            <Trigger Property="IsMouseOver" Value="true">
                <Setter Property="Background" Value="LightGreen"/>
                <Setter Property="Foreground" Value="Red"/>
            </Trigger>
        </Style.Triggers>
    </Style>
</ResourceDictionary>
```

最后在`App.xaml`中拼接起来就OK了

```xml
    <Application.Resources>
        <ResourceDictionary>
            <ResourceDictionary.MergedDictionaries>
                <ResourceDictionary  Source="Resources/MenuList.xaml"/>
            </ResourceDictionary.MergedDictionaries>
        </ResourceDictionary>
        
    </Application.Resources>
```


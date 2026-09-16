#### WPF自定义Button样式标准写法

```xaml
<Style x:Key="SysButton" TargetType="{x:Type Button}">
    <Setter Property="Background" Value="Transparent"/>
    <Setter Property="FontSize" Value="20"/>
    <Setter Property="BorderThickness" Value="0"/>
    <Setter Property="Width" Value="40"/>
    <Setter Property="Template">
        <Setter.Value>
            <ControlTemplate TargetType="Button">
                <Border Background="{TemplateBinding Background}">
                    <ContentPresenter HorizontalAlignment="Center" VerticalAlignment="Center"/>
                </Border>

                <ControlTemplate.Triggers>
                    <Trigger Property="IsMouseOver" Value="true">
                        <Setter Property="Background" Value="White" />
                    </Trigger>
                </ControlTemplate.Triggers>
            </ControlTemplate>
        </Setter.Value>
    </Setter>
                  
</Style>
```
需要注意的是，若要在模板中通过行为改变按钮的样式，则需要指定`TemplateBinding`到需要改变的属性。此法还要为要改变的属性设置初值。
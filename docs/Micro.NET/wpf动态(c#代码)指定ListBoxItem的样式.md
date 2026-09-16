#### `wpf`动态(c#代码)指定`ListBoxItem`的样式

我在资源字典`ListBox.xaml`中设定了`ListBoxItem`的样式，如下所示：

```xml
    <!--List Box Item Style-->
    <Style TargetType="{x:Type ListBoxItem}" x:Key="ListItemStyle">
        <Setter Property="Height" Value="45"/>
        <Setter Property="Foreground" Value="{StaticResource LightWhite}"/>
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="{x:Type ListBoxItem}">
                    <Grid x:Name="Item">
                        <Grid.ColumnDefinitions>
                            <ColumnDefinition Width="225" />
                            <ColumnDefinition Width="*"/>
                        </Grid.ColumnDefinitions>

                        <!--Medicine Name-->
                        <Grid Grid.Column="0">
                            <ContentPresenter Margin="2 0 0 0" VerticalAlignment="Center"/>
                        </Grid>
                    </Grid>

                    <ControlTemplate.Triggers>
                        <Trigger Property="IsMouseOver" Value="true">
                            <Setter Property="Background" TargetName="Item" Value="#2D2D30"/>
                        </Trigger>
                    </ControlTemplate.Triggers>
                    
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>

```

其中`MainWindow.xaml`中`ListBox`是这样写的：

```xml
<Grid Grid.Row="0">
	<ListBox Style="{StaticResource SearchResultBoxStyle}" x:Name="FunctionList"/>
</Grid>

```

之后我在对应的`Click`事件中动态生成`ListBox`的`item`项并设定其样式为我们定义好样式，这样做：

```csharp
        private void RadioButton_Click(object sender, RoutedEventArgs e)
        {
            var win =(ListBox)this.GetTemplateChild("FunctionList");//找到列表框    
            win.Items.Clear();//清空所有项

            ListBoxItem item = new ListBoxItem();//新建一列表项
            item.Content = "中点画圆算法";//设定列表项的文本值
            item.Style=FindResource("ListItemStyle") as Style;//设定样式为定义好的样式 ListItemStyle

            win.Items.Add(item);//把项添加到列表框中

            ListBoxItem item1 = new ListBoxItem();//新建一列表项
            item1.Content = "中点椭圆算法";//设定列表项的文本值
            item1.Style = FindResource("ListItemStyle") as Style;//设定样式为定义好的样式 ListItemStyle

            win.Items.Add(item1);//把项添加到列表框中
        }

```


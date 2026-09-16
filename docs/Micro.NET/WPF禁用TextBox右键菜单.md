#### WPF禁用TextBox右键菜单

如此做

```xaml
<TextBox Grid.Row="1" HorizontalAlignment="Right"
    VerticalAlignment="Bottom" 
    Padding="0 0 5 5" FontSize="12" x:Name="txtBoxHerbName"
    Style="{DynamicResource txtBoxStyle}" ContextMenu="{x:Null}"/>

```

关键是`ContextMenu="{x:Null}"`
#### C#添加`listBox`右键菜单

这样做：

```c#
/// <summary>
/// listBox右键菜单
/// </summary>
private void chklbxItem_MouseUp(object sender, MouseEventArgs e)
{
    ContextMenuStrip strip = new ContextMenuStrip();
    strip.Items.Add("item1");
    strip.Items.Add("item2");
    if (e.Button == MouseButtons.Right)
    {
    	strip.Show(this.chklbxItem, e.Location);//鼠标右键按下弹出菜单
    }

}

```

写在`MouseClick`事件中无效
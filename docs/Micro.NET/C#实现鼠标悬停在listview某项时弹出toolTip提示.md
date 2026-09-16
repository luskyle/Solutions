#### C#实现鼠标悬停在`listview`某项时弹出`toolTip`提示

找到`listview`的`MouseHover`事件，然后这样做：

```c#
/// <summary>
/// listView item鼠标悬停事件
/// </summary>
private void listView1_ItemMouseHover(object sender, ListViewItemMouseHoverEventArgs e)
{
    ToolTip toolTip = new ToolTip();

    string itemInfor =
    "编\t号：" + e.Item.SubItems[0].Text + "\n" +
    "接地时间：" + e.Item.SubItems[1].Text + "\n" +
    "持续时间：" + e.Item.SubItems[2].Text + "\n" +
    "主选线路：" + e.Item.SubItems[5].Text + "\n" +
    "备选线路1：" + e.Item.SubItems[6].Text + "\n" +
    "备选线路2" + e.Item.SubItems[7].Text;

    toolTip.SetToolTip((e.Item).ListView, itemInfor);

}

```


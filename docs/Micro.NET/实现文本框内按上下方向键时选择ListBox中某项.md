#### 实现文本框内按上下方向键时选择ListBox中某项

实际开发中往往需要在文本框内按键后查找一些东西，然后把这些东西列成项放在ListBox中。而又常常需要选中ListBox中的某项。用鼠标选择降低了效率。

所以，就需要配合上下方向键来选择我们需要的项。其实不难实现，只需为`TextBox`设置`PreviewKeyDown`事件，在按下上下方向键时将焦点设到ListBox即可。

```c#
private void TextBox_PreviewKeyDown(object sender, KeyEventArgs e)
{
    if (e.Key == Key.Up || e.Key == Key.Down)
    {
    	listBox.Focus();
    }
}
```

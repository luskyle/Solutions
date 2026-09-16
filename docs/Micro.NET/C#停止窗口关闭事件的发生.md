#### C#停止窗口关闭事件的发生

十分简单。比如窗体`FormClosing`事件。

```c#
private void button4_Click(object sender, EventArgs e)
{
	e.Cancel = true;
}

```


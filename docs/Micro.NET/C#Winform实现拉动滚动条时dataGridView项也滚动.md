#### C#`Winform`实现拉动滚动条时`dataGridView`项也滚动

这样做：

```csharp
/// <summary>
/// 滚动条滚动事件
/// </summary>
private void scrollBar_Scroll(object sender, ScrollEventArgs e)
{
    if (e.NewValue>=rowNo)//若当前值不小于行号，则不执行后面代码
    {
    	return;
    }
    dataGridView.FirstDisplayedScrollingRowIndex = e.NewValue;            
}


```


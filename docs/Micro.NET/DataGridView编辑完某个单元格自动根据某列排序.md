#### DataGridView编辑完某个单元格自动根据某列排序

其实，Microsoft已经做好了这个功能，只需要执行`dgv.Sort(列，升序/降序)`就行了。

```csharp
/// <summary>
/// 列排序
/// </summary>
private void toolStripButton6_Click(object sender, EventArgs e)
{
    if (dtCopy == null)
    {
    	return;
	}

    int selcol = dataGridView1.CurrentCell.ColumnIndex;
    dataGridView1.Sort(dataGridView1.Columns[selcol], ListSortDirection.Ascending);
}

```


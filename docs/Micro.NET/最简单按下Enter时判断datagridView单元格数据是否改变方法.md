#### 最简单按下Enter时判断datagridView单元格数据是否改变方法

核心思想就是`在开始编辑时记录下当前值，在结束编辑时比较这两个值是否相等`。利用datagridView的`CellBeginEndit`，和`CellEndEdit`事件就行了。

```csharp
object oldValue = null;
private void DataGridView1_CellBeginEdit(object sender, DataGridViewCellCancelEventArgs e)
{
	oldValue = dataGridView1.CurrentCell.Value;
}

private void DataGridView1_CellEndEdit(object sender, DataGridViewCellEventArgs e)
{
    if (oldValue != dataGridView1.CurrentCell.Value)
    {
    	dataGridView1.CurrentCell.Style.BackColor = Color.Pink;
    }
}

```


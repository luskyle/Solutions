# Datagridview只允许编辑CheckBox列

```c#
grid.CellBeginEdit += Grid_CellBeginEdit;

private void Grid_CellBeginEdit(object sender, DataGridViewCellCancelEventArgs e)
{
    if((sender as MetroGrid).Columns[e.ColumnIndex].CellType != typeof(DataGridViewCheckBoxCell))
    {
    	e.Cancel = true;
    }
}
```


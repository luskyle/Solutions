#### LINQ查询`DataGridView`选定列重复出现的值

```c#
int selcol = dataGridView1.CurrentCell.ColumnIndex;
var dr = from item in dtCopy.Columns[selcol].Table.Select()
        group item by item.ItemArray[selcol].ToString() into g
        where g.Count() > 1
	select g;

string str = "";
foreach (var item in dr)
{
    str += item.Key.ToString() + "\n";
}

MessageBox.Show(str);
```


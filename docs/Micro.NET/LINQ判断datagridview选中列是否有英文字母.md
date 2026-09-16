#### LINQ判断datagridview选中列是否有英文字母

```csharp
            int selcol = dataGridView1.CurrentCell.ColumnIndex;

            var dr = from item in dtCopy.Columns[selcol].Table.Select()
                     where Regex.IsMatch(item.ItemArray[selcol].ToString(), @"[A-Za-z]")
                     select item;

            if (dr.Count() == 0)//表示没有
            {
                
            }

```


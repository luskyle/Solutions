## LINQ找出datatable某列所有出现过的值（不包含重复数据）

```csharp
            //找出选定列重复的数据值
            var dr = from item in dtCopy.Columns[selcol].Table.Select()
                     group item by item.ItemArray[selcol].ToString() into g
                     where g.Count() >= 1
                     select g;

```


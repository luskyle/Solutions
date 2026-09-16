#### LINQ按数字值排序DataTable

```csharp
                var result = from item in dtCopy.Select()
                             orderby int.Parse(item[selcol].ToString()) ascending
                             select item;

                DataTable dt = new DataTable();

                //创建列
                foreach (DataColumn item in dtCopy.Columns)
                    dt.Columns.Add(item.ColumnName);

                //添加行
                foreach (DataRow item in result)
                {
                    DataRow drNew = dt.NewRow();

                    for (int i = 0; i < item.Table.Columns.Count; i++)
                        drNew[i] = item[i];

                    dt.Rows.Add(drNew);
                }

                dataGridView1.DataSource = dt;

```


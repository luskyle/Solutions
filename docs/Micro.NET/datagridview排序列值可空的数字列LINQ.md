#### datagridview排序列值可空的数字列LINQ

```csharp
            int selcol = dataGridView1.CurrentCell.ColumnIndex;

            var dr = from item in dtCopy.Columns[selcol].Table.Select()
                     where Regex.IsMatch(item.ItemArray[selcol].ToString(), @"[A-Za-z]")
                     select item;

            #region 排序数字列
            if (dr.Count() == 0)
            {
                DataTable dt = new DataTable();

                //创建列
                foreach (DataColumn item in dtCopy.Columns)
                    dt.Columns.Add(item.ColumnName);

                //所有空行
                var reslut0 = from item in dtCopy.Select()
                              where item[selcol].ToString() == ""
                              select item;

                //所有非空行
                var result = from item in dtCopy.Select()                             
                             where item[selcol].ToString() != ""
                             orderby int.Parse(item[selcol].ToString()) ascending                                                                                        
                             select item;

                //添加空行到新表
                foreach (DataRow item in reslut0)
                {
                    DataRow drNew = dt.NewRow();

                    for (int i = 0; i < item.Table.Columns.Count; i++)
                        drNew[i] = item[i];

                    dt.Rows.Add(drNew);
                }

                //添加非空行到新表
                foreach (DataRow item in result)
                {
                    DataRow drNew = dt.NewRow();

                    for (int i = 0; i < item.Table.Columns.Count; i++)
                        drNew[i] = item[i];

                    dt.Rows.Add(drNew);
                }

                dataGridView1.DataSource = dt;
            }

            #endregion


```


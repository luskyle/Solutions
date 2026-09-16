#### datagridview数据转DataTable标准写法

```csharp
        /// <summary>
        /// datagridview数据转 DataTable
        /// </summary>
        private DataTable SaveData(DataGridView dgv)
        {
            DataTable dt = new DataTable();

            //创建列
            foreach (DataGridViewColumn item in dataGridView1.Columns)
                dt.Columns.Add(item.Name);

            foreach (DataGridViewRow item in dataGridView1.Rows)
            {
                DataRow dr = dt.NewRow();

                foreach (DataGridViewCell cell in item.Cells)
                {
                    dr[cell.ColumnIndex] = cell.Value;
                }

                dt.Rows.Add(dr);
            }

            return dt;
        }

```


#### 复制datagridview最后一行数据并设置颜色标出

```csharp
        /// <summary>
        /// 新增行
        /// </summary>
        private void bindingNavigatorAddNewItem_Click(object sender, EventArgs e)
        {
            int lstRow = dataGridView1.Rows.Count - 1;

            //复制最后一行数据并设置颜色
            for (int i = 0; i < dataGridView1.Columns.Count; i++)
            {
                dataGridView1.Rows[lstRow].Cells[i].Value = dataGridView1.Rows[lstRow - 1].Cells[i].Value;
                dataGridView1.Rows[lstRow].Cells[i].Style.BackColor = Color.YellowGreen;
            }

            dataGridView1.CurrentCell = dataGridView1.Rows[lstRow].Cells[0];//设定当前行
        }

```


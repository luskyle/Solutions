#### 连续移动datagridview某行

```csharp
        /// <summary>
        /// 下移
        /// </summary>
        private void btnDown_Click(object sender, EventArgs e)
        {
            if (dtCopy == null)
                return;

            int currentRow = dataGridView1.CurrentCell.RowIndex;
            if (currentRow == dtCopy.Rows.Count - 1 || currentRow == -1)
            {
                return;
            }

            //复制选中行到新行中
            DataRow tempRow = dtCopy.NewRow();
            for (int i = 0; i < dtCopy.Columns.Count; i++)
            {
                tempRow[i] = dtCopy.Rows[currentRow][i];
            }

            dtCopy.Rows.InsertAt(tempRow, currentRow + 2);
            dtCopy.Rows.RemoveAt(currentRow);
            dataGridView1.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
            dataGridView1.Rows[currentRow + 1].Selected = true;

            dataGridView1.CurrentCell = dataGridView1.Rows[currentRow + 1].Cells[0];//设定当前行
        }

```

```csharp
        /// <summary>
        /// 上移
        /// </summary>
        private void btnUp_Click(object sender, EventArgs e)
        {
            if (dtCopy == null)
                return;

            int currentRow = dataGridView1.CurrentCell.RowIndex;
            if (dataGridView1.CurrentRow.Index <= 0)
            {
                return;
            }

            //复制选中行到新行中
            DataRow tempRow = dtCopy.NewRow();
            for (int i = 0; i < dtCopy.Columns.Count; i++)
            {
                tempRow[i] = dtCopy.Rows[currentRow][i];
            }

            dtCopy.Rows.InsertAt(tempRow, currentRow - 1);
            dtCopy.Rows.RemoveAt(currentRow + 1);
            dataGridView1.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
            dataGridView1.Rows[currentRow - 1].Selected = true;

            dataGridView1.CurrentCell = dataGridView1.Rows[currentRow - 1].Cells[0];//设定当前行

        }
```

#### 点击DataGridView列头立刻选中此列

```csharp

        /// <summary>
        /// 鼠标点击 dataGridView 单元格
        /// </summary>
        private void DataGridView1_CellClick(object sender, DataGridViewCellEventArgs e)
        {
            //点击列头选中整列
            if (e.RowIndex == -1)
            {
                dataGridView1.SelectionMode = DataGridViewSelectionMode.ColumnHeaderSelect;
                dataGridView1.Columns[e.ColumnIndex].Selected = true;//让此列立刻被选中

                selectedColumn = e.ColumnIndex;//记录被选中的列
            }
            else
                dataGridView1.SelectionMode = DataGridViewSelectionMode.CellSelect;//单选某个单元格

            dataGridView1.BeginEdit(false);
        }

```


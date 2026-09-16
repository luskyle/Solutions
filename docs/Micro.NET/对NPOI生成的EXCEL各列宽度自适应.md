# 对 NPOI 生成的 Excel 各列宽度自适应调整

``` c#
    private void AutoFit(ISheet sheet, DataGridView dgv)
    {
        /* 自适应的关键思想是快速计算出某列字符最大值
        *  同时保证 Excel 列宽不能低于列标题的宽
        */
        var rows = dgv.Rows.Cast<DataGridViewRow>();

        for (int i = 0; i < dgv.ColumnCount; i++)
        {
            // 使用 linq 以快速对集合进行操作
            var max = (from row in rows
                        select row.Cells[i].Value.ToString().Length).Max();

            int strLength = max + dgv.Columns[i].HeaderText.Length;
            sheet.SetColumnWidth(i, strLength * 256);
        }
    }
```
#### 移动DataGridView选中行

```c#
//向上移动
private void button4_Click(object sender, EventArgs e)
{
    //未选中
    if (dataGridView1.SelectedRows.Count==0)
    {
    	return;
    }

    //首行
    if (dataGridView1.SelectedRows[0].Index==0)
    {
    	return;
    }

    int selectedItemIndex = dataGridView1.SelectedRows[0].Index;

    //选中行的上一行的 空白副本
    DataGridViewRow dgvRow0 = (DataGridViewRow)dataGridView1.SelectedRows[0].Clone();

    //选中行的上一行的值存在对应副本里
    dgvRow0.Cells[0].Value = dataGridView1.Rows[selectedItemIndex - 1].Cells[0].Value;
    dgvRow0.Cells[1].Value = dataGridView1.Rows[selectedItemIndex - 1].Cells[1].Value;
    dgvRow0.Cells[2].Value = dataGridView1.Rows[selectedItemIndex - 1].Cells[2].Value;
    dgvRow0.Cells[3].Value = dataGridView1.Rows[selectedItemIndex - 1].Cells[3].Value;

    //用选中行覆盖掉上一行
    dataGridView1.Rows[selectedItemIndex - 1].Cells[0].Value = dataGridView1.Rows[selectedItemIndex].Cells[0].Value;
    dataGridView1.Rows[selectedItemIndex - 1].Cells[1].Value = dataGridView1.Rows[selectedItemIndex].Cells[1].Value;
    dataGridView1.Rows[selectedItemIndex - 1].Cells[2].Value = dataGridView1.Rows[selectedItemIndex].Cells[2].Value;
    dataGridView1.Rows[selectedItemIndex - 1].Cells[3].Value = dataGridView1.Rows[selectedItemIndex].Cells[3].Value;

    //用上一行的副本覆盖掉选中行
    dataGridView1.Rows[selectedItemIndex].Cells[0].Value = dgvRow0.Cells[0].Value;
    dataGridView1.Rows[selectedItemIndex].Cells[1].Value = dgvRow0.Cells[1].Value;
    dataGridView1.Rows[selectedItemIndex].Cells[2].Value = dgvRow0.Cells[2].Value;
    dataGridView1.Rows[selectedItemIndex].Cells[3].Value = dgvRow0.Cells[3].Value;

    //将移动后的行设为选中行
    dataGridView1.Rows[selectedItemIndex - 1].Selected = true;
}

```

```c#
//向下移动
private void button5_Click(object sender, EventArgs e)
{
    //未选中
    if (dataGridView1.SelectedRows.Count == 0)
    {
    	return;
    }

    //最后一行
    if (dataGridView1.SelectedRows[0].Index == dataGridView1.RowCount-1)
    {
    	return;
    }

    int selectedItemIndex = dataGridView1.SelectedRows[0].Index;

    //选中行的下一行的 空白副本
    DataGridViewRow dgvRow0 = (DataGridViewRow)dataGridView1.SelectedRows[0].Clone();

    //选中行的下一行的值存在对应副本里
    dgvRow0.Cells[0].Value = dataGridView1.Rows[selectedItemIndex + 1].Cells[0].Value;
    dgvRow0.Cells[1].Value = dataGridView1.Rows[selectedItemIndex + 1].Cells[1].Value;
    dgvRow0.Cells[2].Value = dataGridView1.Rows[selectedItemIndex + 1].Cells[2].Value;
    dgvRow0.Cells[3].Value = dataGridView1.Rows[selectedItemIndex + 1].Cells[3].Value;

    //用选中行覆盖掉下一行
    dataGridView1.Rows[selectedItemIndex + 1].Cells[0].Value = dataGridView1.Rows[selectedItemIndex].Cells[0].Value;
    dataGridView1.Rows[selectedItemIndex + 1].Cells[1].Value = dataGridView1.Rows[selectedItemIndex].Cells[1].Value;
    dataGridView1.Rows[selectedItemIndex + 1].Cells[2].Value = dataGridView1.Rows[selectedItemIndex].Cells[2].Value;
    dataGridView1.Rows[selectedItemIndex + 1].Cells[3].Value = dataGridView1.Rows[selectedItemIndex].Cells[3].Value;

    //用下一行的副本覆盖掉选中行
    dataGridView1.Rows[selectedItemIndex].Cells[0].Value = dgvRow0.Cells[0].Value;
    dataGridView1.Rows[selectedItemIndex].Cells[1].Value = dgvRow0.Cells[1].Value;
    dataGridView1.Rows[selectedItemIndex].Cells[2].Value = dgvRow0.Cells[2].Value;
    dataGridView1.Rows[selectedItemIndex].Cells[3].Value = dgvRow0.Cells[3].Value;

    //将移动后的行设为选中行
    dataGridView1.Rows[selectedItemIndex + 1].Selected = true;

}

```

效果如下：

![AA](images\AA.gif)
#### 循环遍历DataGridView各行某列数据

如此做

```c#
foreach (DataGridViewRow dgr in dataGridView1.Rows)
{
    if (dgr.Cells["Column1"].Value == null)
    {
    	break;
    }
    label1.Text += dgr.Cells["Column1"].Value.ToString() + " ";
}           
```
若某行某列无值，`dgr.Cells["Column1"].Value.ToString()`获取值就会异常。
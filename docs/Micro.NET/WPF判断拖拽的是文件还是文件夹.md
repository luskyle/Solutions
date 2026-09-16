#### WPF判断拖拽的是文件还是文件夹

```c#
string filePath = ((System.Array)e.Data.GetData(DataFormats.FileDrop)).GetValue(0).ToString();

FileInfo fInfor = new FileInfo(filePath);
if (fInfor.Attributes == FileAttributes.Directory)//文件夹
{
	MessageBox.Show("是文件夹");
}
else//文件
{
	MessageBox.Show(fInfor.Name.Split('.')[0]);                
}

```


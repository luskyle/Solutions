#### C#调用NPOI自动创建Excel文档（一）

最终要实现的效果是这样的：

![2018-03-20_082654](C:\Users\Administrator\Desktop\MyBlogs-ING\杂项\images\2018-03-20_082654.png)

以我的项目为例。我的数据库是这样设计的：

![2018-03-20_093515](C:\Users\Administrator\Desktop\MyBlogs-ING\杂项\images\2018-03-20_093515.png)

所以，要实现的效果是：读取数据库所有记录，记录中有几个高端类就让Excel列宽等于其数量值，其它类别同理。除了控制循环读取的次数外，最为关键的就是准确得出每个要合并的类别单元格在Excel中的起始位置和结束位置。核心算法如下：

```csharp
try
{
  string sql1 = "SELECT DISTINCT ProductType FROM ProductInfor";
  OleDbCommand mycom1 = new OleDbCommand(sql1, mycon);
  myReader1 = mycom1.ExecuteReader();

  int loopCount = 0;//-----------这里是关键点
  int lastMergedCellWidth = 0;//记录上一个合并了的单元格的宽度-----------这里是关键点
  IRow row1 = sheet.CreateRow(1);    //创建行对象-行2  

  int startLoc = 0;//-----------这里是关键点
  int endLoc = 0;//-----------这里是关键点
  while (myReader1.Read())
  {
    string productType = myReader1.GetString(0);

    string sql2 = //得到ProductType对应的PinType个数
    "SELECT COUNT(*) FROM ProductInfor WHERE ProductType='"+productType+"'";
    OleDbCommand mycom2 = new OleDbCommand(sql2, mycon);
    OleDbDataReader myReader2 = mycom2.ExecuteReader();
    int result = 0;
    while (myReader2.Read())
    {
      result=myReader2.GetInt32(0);
    }

    startLoc += lastMergedCellWidth;//-----------这里是关键点
    endLoc += result;//-----------这里是关键点
    lastMergedCellWidth = result;//-----------这里是关键点

    #region 合并单元格
      sheet.AddMergedRegion(new NPOI.SS.Util.CellRangeAddress(0, 0, 0, (loopCount + 1) * result));//合并第一行-----------这里是关键点
      sheet.AddMergedRegion(new NPOI.SS.Util.CellRangeAddress(1, 1, startLoc+1, endLoc));//合并第二行-产品类型行-----------这里是关键点
    #endregion

    #region 填充产品类型行
      row1.CreateCell(0).SetCellValue("产品类型");//-----------这里是关键点
      row1.CreateCell(startLoc+1).SetCellValue(productType);//填充第二行合并后的单元格-----------这里是关键点
    #endregion

      loopCount++;//-----------这里是关键点
  }

}
finally
{
	mycon.Close();
}

```


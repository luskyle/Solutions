#### C#调用NPOI创建Excel文档单元格写入问题一则

想从数据库里读数据并写入到Excel文件中，C#代码是这样写的。

```csharp
private void SetContent(HSSFWorkbook hssfworkbook)
{
  ISheet sheet = hssfworkbook.CreateSheet("Sheet1");
  hssfworkbook.CreateSheet("Sheet2");

  OleDbConnection mycon = null;
  OleDbDataReader myReader = null;
  try
  {
    string strcon = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=../../Product.mdb;";
    mycon = new OleDbConnection(strcon);
    mycon.Open();
    string sql = "SELECT DISTINCT ProductType FROM ProductInfor";
    OleDbCommand mycom = new OleDbCommand(sql, mycon);
    myReader = mycom.ExecuteReader();

    int loopCount = 0;   
    while (myReader.Read())
    {
      IRow row = sheet.CreateRow(1);    //创建行对象  --注意这点
      string productType = myReader.GetString(0);
      //ICell cell = row.CreateCell(loopCount);   //创建单元格对象  
      //cell.SetCellValue(productType);         //设置单元格内容  

   	 row.CreateCell(loopCount).SetCellValue(productType);

    loopCount++;
 	}

  }
  finally
  {
  	mycon.Close();
  }
}
```

这样做之后发现最后生成的Excel文件只有第二行的一个单元格内有数据。比如查到的数据记录有5条，那么只有这一行的第五个单元格内有数据，前面四个单元格内都没有。

问题出在NPOI的`CreateRow()`方法。这个方法创建行的时候默认会先把这行数据全部清空。所以上述代码在创建完成的Excel文件中就只有一个单元格内有数据。解决方法是：`在逐个读取数据库记录前先创建行`。所以，调整`IRow row = sheet.CreateRow(1);    //创建行对象  --注意这点`的位置就行了。如此调整。

```c#
private void SetContent(HSSFWorkbook hssfworkbook)
{
  ISheet sheet = hssfworkbook.CreateSheet("Sheet1");
  hssfworkbook.CreateSheet("Sheet2");

  OleDbConnection mycon = null;
  OleDbDataReader myReader = null;
  try
  {
    string strcon = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=../../Product.mdb;";
    mycon = new OleDbConnection(strcon);
    mycon.Open();
    string sql = "SELECT DISTINCT ProductType FROM ProductInfor";
    OleDbCommand mycom = new OleDbCommand(sql, mycon);
    myReader = mycom.ExecuteReader();

    IRow row = sheet.CreateRow(1);    //创建行对象  --调整到这里
    int loopCount = 0;   
    while (myReader.Read())
    {
      string productType = myReader.GetString(0);
      //ICell cell = row.CreateCell(loopCount);   //创建单元格对象  
      //cell.SetCellValue(productType);         //设置单元格内容  

   	 row.CreateCell(loopCount).SetCellValue(productType);

    loopCount++;
 	}

  }
  finally
  {
  	mycon.Close();
  }
}
```


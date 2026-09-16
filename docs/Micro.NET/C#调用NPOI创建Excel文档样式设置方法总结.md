#### C#调用NPOI创建Excel文档样式设置方法总结

##### 一、描边与居中

```c#
#region 描边与居中-style
  ICellStyle style1 = hssfworkbook.CreateCellStyle();
  style1.BorderBottom = NPOI.SS.UserModel.BorderStyle.Thin;
  style1.BorderLeft = NPOI.SS.UserModel.BorderStyle.Thin;
  style1.BorderRight = NPOI.SS.UserModel.BorderStyle.Thin;
  style1.BorderTop = NPOI.SS.UserModel.BorderStyle.Thin;
  style1.Alignment = NPOI.SS.UserModel.HorizontalAlignment.Center;
  style1.VerticalAlignment = NPOI.SS.UserModel.VerticalAlignment.Center;
#endregion

```

##### 二、描边，居中，加粗

```csharp
#region 描边，居中，加粗-style
  ICellStyle style2//Style2为继承了Style1的新样式
  = hssfworkbook.CreateCellStyle();
  style2.BorderBottom = NPOI.SS.UserModel.BorderStyle.Thin;//Style1的样式
  style2.BorderLeft = NPOI.SS.UserModel.BorderStyle.Thin;
  style2.BorderRight = NPOI.SS.UserModel.BorderStyle.Thin;
  style2.BorderTop = NPOI.SS.UserModel.BorderStyle.Thin;
  style2.Alignment = NPOI.SS.UserModel.HorizontalAlignment.Center;
  style2.VerticalAlignment = NPOI.SS.UserModel.VerticalAlignment.Center;
  IFont font1 = hssfworkbook.CreateFont();
  font1.Boldweight = (short)FontBoldWeight.Bold;
  style2.SetFont(font1);
#endregion

```

##### 三、描边，居中，加粗，设字体大小

```csharp
#region 描边，居中，加粗，设字体大小-style
  ICellStyle style3//Style3为继承了Style2的新样式
  = hssfworkbook.CreateCellStyle();
  style3.BorderBottom = NPOI.SS.UserModel.BorderStyle.Thin;//Style1的样式
  style3.BorderLeft = NPOI.SS.UserModel.BorderStyle.Thin;
  style3.BorderRight = NPOI.SS.UserModel.BorderStyle.Thin;
  style3.BorderTop = NPOI.SS.UserModel.BorderStyle.Thin;
  style3.Alignment = NPOI.SS.UserModel.HorizontalAlignment.Center;
  style3.VerticalAlignment = NPOI.SS.UserModel.VerticalAlignment.Center;
  IFont font2 = hssfworkbook.CreateFont();
  font2.Boldweight = (short)FontBoldWeight.Bold;
  font2.FontHeightInPoints = 14;
  style3.SetFont(font2);
#endregion

```

##### 四、给单元格描边

```c#
#region 描边与居中
  CellRangeAddress regionAll = new CellRangeAddress(0, sheet.LastRowNum, 0, endLoc);//从第一行第一列到最后一行最后一列
  for (int i = regionAll.FirstRow; i <= regionAll.LastRow; i++)
  {
    IRow row = HSSFCellUtil.GetRow(i, (HSSFSheet)sheet);
    for (int j = regionAll.FirstColumn; j <= regionAll.LastColumn; j++)
    {
      ICell singleCell = HSSFCellUtil.GetCell(row, j);

      if (i == regionAll.FirstRow)//第一行单元格用style3
      {
      	singleCell.CellStyle = style3;
      }
      else if (i == regionAll.FirstRow + 1 || j == regionAll.FirstColumn)//第二行用style2;第一列用style2
      {
      	singleCell.CellStyle = style2;
      }
      else//其它行列用style1
      {
      	singleCell.CellStyle = style1;
      }
    }
  }
#endregion

```

实际应用需要给创建好的表格描边。只需先确定好整个表格的区域，然后根据这个区域的行列值循环为每个单元格描边即可。
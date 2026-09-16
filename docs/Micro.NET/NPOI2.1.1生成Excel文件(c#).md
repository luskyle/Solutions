#### NPOI2.1.1生成Excel文件（C#）

几经周折，总结如下：

首先，下载`NPOI2.1.1 `。

```t
链接：https://pan.baidu.com/s/1IeMYQ-ipVTdMscqWTJocNw
密码：8wu9
```

之后解压，VS项目中`右击引用，然后选中所有dll文件引入到项目中即可`。

再之后创建`xls`文件，这样做：

```csharp
public void create()
{
  HSSFWorkbook hssfworkbook = new HSSFWorkbook();
  ISheet sheet = hssfworkbook.CreateSheet("Sheet1");
  hssfworkbook.CreateSheet("Sheet2");
  hssfworkbook.CreateSheet("Sheet3");

  //Title  
  IRow row = sheet.CreateRow(0);    //创建行对象  
  ICell cell = row.CreateCell(0);   //创建单元格对象  
  cell.SetCellValue("ddddd");         //设置单元格内容  

  // 设置单元格字体  
  ICellStyle style = hssfworkbook.CreateCellStyle();
  style.Alignment = NPOI.SS.UserModel.HorizontalAlignment.Center;
  IFont font = hssfworkbook.CreateFont();
  font.FontHeight = 20 * 20;
  style.SetFont(font);
  cell.CellStyle = style;

  // 合并第0列到第4列的内容  
  sheet.AddMergedRegion(new NPOI.SS.Util.CellRangeAddress(0, 0, 0, 4));

  string filePath = @"C:\Users\Administrator\Desktop\Hello.xls";

  FileStream file = new FileStream(filePath, FileMode.Create);
  hssfworkbook.Write(file);
  file.Close();
}
```

运行程序即可看到桌面上有了`Hello.xls`文件。



再附上几个有用的链接：

NPOI 1.2 中文指南.pdf：http://www.open-open.com/doc/view/7da7557db22b4078a022384c1bfd846b

NPOI2.1.1简单使用：http://blog.csdn.net/yao_guet/article/details/45277687


#### C#调用NPOI创建Excel文档合并后的单元格写入数据问题一则

C#调用NPOI创建Excel文档。第二行设定了3个单元格，每个单元格列宽为3（跨3列）。现在想向这三个单元格内填充数据。C#代码如下：

```csharp
#region 合并单元格
  pinTypeNumForLastLoop = result; 
  sheet.AddMergedRegion(new NPOI.SS.Util.CellRangeAddress(0, 0, 0, (loopCount + 1) * result - 1));
  sheet.AddMergedRegion(new NPOI.SS.Util.CellRangeAddress(1, 1, loopCount*pinTypeNumForLastLoop, (loopCount+1)*result-1));
  sheet.AddMergedRegion(new NPOI.SS.Util.CellRangeAddress(2, 2, loopCount * pinTypeNumForLastLoop, (loopCount + 1) * result - 1));
#endregion

#region 往单元格填充值
	row1.CreateCell(loopCount * pinTypeNumForLastLoop).SetCellValue(productType);
#endregion
loopCount++；
```

其中，`loopCount`代表读到的数据个数，有多少个数据，上述代码就循环几次。`pinTypeNumForLastLoop`是上个单元格的列宽。

需要注意的是：NPOI给合并后的单元格填充数据，单元格的位置仍然按照原列标计算。合并单元格后列表并未改变。意思是说：假如第一行有3个单元格，合并后每个单元格跨度为3，那么第一个单元格的位置是（0，0），第二个单元格的位置是（0，3），第三个单元格的位置是（0，6）。而不是（0，0），（0，1），（0，2）。（下标从0开始）
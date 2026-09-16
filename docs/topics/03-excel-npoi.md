# Excel 导出（NPOI）

!!! note "状态"
    已定稿（2026-09-16）。

产线报表导出 Excel 是刚需：日报、汇总、记录明细，导出格式还经常要"和领导手头的模板一模一样"。NPOI 是 .NET 上最顺手的方案，这几篇笔记正好覆盖了从"能生成"到"能排版"再到"能自动化"的全过程。

## 一、三行起步：工作簿 → 表 → 行 → 单元格

```csharp
HSSFWorkbook hssfworkbook = new HSSFWorkbook();        // .xls 用 HSSF；.xlsx 用 XSSF
ISheet sheet = hssfworkbook.CreateSheet("Sheet1");     // 创建工作表

IRow row = sheet.CreateRow(0);                          // 0 起：第 1 行
ICell cell = row.CreateCell(0);                         // 第 A 列
cell.SetCellValue("内容");

// 字体与合并
ICellStyle style = hssfworkbook.CreateCellStyle();
style.Alignment = HorizontalAlignment.Center;
IFont font = hssfworkbook.CreateFont();
font.FontHeight = 20 * 20;                              // 字号：单位是 1/20 磅
style.SetFont(font);
cell.CellStyle = style;

sheet.AddMergedRegion(new CellRangeAddress(0, 0, 0, 4)); // 合并第 1 行第 A~E 列

FileStream file = new FileStream(path, FileMode.Create);
hssfworkbook.Write(file);
file.Close();                                            // 或 using 包住
```

**坑**：`HSSF` 写 `.xls`、`XSSF` 写 `.xlsx`，选错后缀打开会提示文件损坏。

## 二、样式三件套：描边、居中、加粗

原笔记把样式做成"继承式"：style1（描边居中）→ style2（+加粗）→ style3（+字号）。落到代码就是三组属性：

```csharp
// style1：描边 + 居中
ICellStyle style1 = hssfworkbook.CreateCellStyle();
style1.BorderBottom = style1.BorderLeft = style1.BorderRight = style1.BorderTop = BorderStyle.Thin;
style1.Alignment = HorizontalAlignment.Center;
style1.VerticalAlignment = VerticalAlignment.Center;

// style2：再挂加粗字体
IFont font1 = hssfworkbook.CreateFont();
font1.Boldweight = (short)FontBoldWeight.Bold;   // 新版本用 font1.IsBold = true
style2.SetFont(font1);

// style3：再加字号
IFont font2 = hssfworkbook.CreateFont();
font2.Boldweight = (short)FontBoldWeight.Bold;
font2.FontHeightInPoints = 14;
style3.SetFont(font2);
```

给整张表描边的通用手法：先圈定区域，再按"首行用标题样式、首列用次样式、其余用基础样式"循环赋值：

```csharp
CellRangeAddress regionAll = new CellRangeAddress(0, sheet.LastRowNum, 0, endLoc);
for (int i = regionAll.FirstRow; i <= regionAll.LastRow; i++)
{
    IRow row = HSSFCellUtil.GetRow(i, (HSSFSheet)sheet);
    for (int j = regionAll.FirstColumn; j <= regionAll.LastColumn; j++)
    {
        ICell singleCell = HSSFCellUtil.GetCell(row, j);
        if (i == regionAll.FirstRow) singleCell.CellStyle = style3;         // 首行
        else if (i == regionAll.FirstRow + 1 || j == regionAll.FirstColumn)
            singleCell.CellStyle = style2;                                  // 次行/首列
        else singleCell.CellStyle = style1;
    }
}
```

## 三、最大的坑：CreateRow 会清空整行

从数据库读数据写 Excel，第一版只写进了最后一个单元格。原因：**`CreateRow()` 在创建行时会先把这行清空**——把 `CreateRow` 放在循环里，等于每读一条记录就重开一行。

```csharp
// 错：CreateRow 在循环里，后一条覆盖前一条
while (myReader.Read())
{
    IRow row = sheet.CreateRow(1);      // 每次重建行，前面写的全没了
    row.CreateCell(loopCount).SetCellValue(myReader.GetString(0));
    loopCount++;
}

// 对：先建行，再循环写单元格
IRow row = sheet.CreateRow(1);
while (myReader.Read())
{
    row.CreateCell(loopCount).SetCellValue(myReader.GetString(0));
    loopCount++;
}
```

这个坑原笔记踩得很实，值得记住：**行先建好，循环只动单元格**。

## 四、合并单元格：动态起止位置的算法

"按产品类型分组、每组表头合并"是报表的常见形态。手动算合并位置容易错，原笔记给了一套好算法：用两个游标 `startLoc / endLoc` 递推每个合并区间的起止列，`lastMergedCellWidth` 记住上一个分组的宽度：

```csharp
int startLoc = 0;           // 本次合并起点
int endLoc = 0;             // 本次合并终点
int lastMergedCellWidth = 0;// 上一个分组占了几列
int loopCount = 0;

while (myReader1.Read())
{
    int count = GetCountByType(productType);          // 该类型有几条记录

    startLoc += lastMergedCellWidth;                  // 起点 = 上一个组终点 + 1
    endLoc += count;                                  // 终点累加
    lastMergedCellWidth = count;

    // 表头行合并 + 分类行合并
    sheet.AddMergedRegion(new CellRangeAddress(0, 0, 0, (loopCount + 1) * count));
    sheet.AddMergedRegion(new CellRangeAddress(1, 1, startLoc + 1, endLoc));

    row1.CreateCell(startLoc + 1).SetCellValue(productType);
    loopCount++;
}
```

要点就一句：**用"上组宽度"递推起点，用"本组数量"累加终点**，合并区间就不会重叠错位。

## 五、列宽自适应

```csharp
private void AutoFit(ISheet sheet, DataGridView dgv)
{
    var rows = dgv.Rows.Cast<DataGridViewRow>();
    for (int i = 0; i < dgv.ColumnCount; i++)
    {
        // 该列内容的最大长度（+列标题长度兜底）
        int max = (from row in rows select row.Cells[i].Value.ToString().Length).Max();
        int strLength = max + dgv.Columns[i].HeaderText.Length;
        sheet.SetColumnWidth(i, strLength * 256);     // Excel 列宽单位是字符宽度的 1/256
    }
}
```

**坑**：`SetColumnWidth` 的最小单位是字符宽度——中文按 2 个字符算，导出中文列要 ×2 或乘系数，否则"自适应"后还是被截断。

## 六、列名转列号（"K" 是第几列？）

```csharp
int ColumnIndex(string name)
{
    int result = 0;
    foreach (char c in name.ToUpper())
        result = result * 26 + (c - 'A' + 1);   // 支持任意位数：A→1, Z→26, AA→27
    return result;
}
```

原笔记只算了两位列号（`vArr[0]*26 + vArr[1]`），上面的循环版对任意位数通用。

## 七、参考实现：带时间戳 + 自动起号的导出器

`NPOI导Excel参考.cs` 里有个值得抄的骨架：文件名带日期时间（`导出数据(20181220-14时30分00秒)`），同一天重复导出自动加序号 `-1`/`-2`；保存目录不存在就自动创建。这个"文件名约定 + 递增"的模式在做"保留历次导出"时很实用，完整代码见素材。

## 结语

NPOI 系列的四个关键点：**行先建再写格**（CreateRow 清行）、**合并用游标递推**（startLoc/endLoc）、**列宽按 1/256 字符算**（中文 ×2）、**xls/xlsx 别混**（HSSF/XSSF）。报表导出的九九八十一难，这四关过了就顺了。

## 参考资料（本站素材）

- [NPOI2.1.1生成Excel文件(c#)](<../Micro.NET/NPOI2.1.1生成Excel文件(c%23).md>)
- [C#调用NPOI创建Excel文档样式设置方法总结](../Micro.NET/C%23调用NPOI创建Excel文档样式设置方法总结.md)
- [C#调用NPOI创建Excel文档单元格写入问题一则](../Micro.NET/C%23调用NPOI创建Excel文档单元格写入问题一则.md)
- [C#调用NPOI自动创建Excel文档（一）](../Micro.NET/C%23调用NPOI自动创建Excel文档%EF%BC%88%E4%B8%80%EF%BC%89.md)
- [对NPOI生成的EXCEL各列宽度自适应](../Micro.NET/对NPOI生成的EXCEL各列宽度自适应.md)
- [计算Excel某列是第几列](../Micro.NET/计算Excel某列是第几列.md)
- [NPOI导Excel参考.cs](../Micro.NET/NPOI导Excel参考.cs)
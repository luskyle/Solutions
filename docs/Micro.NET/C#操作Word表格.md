# C#操作Word表格

添加所有NPOI动态库。`NPOI`、`NPOI.OOXML`、`NPOI.OpenXml4Net`、`NPOI.OpenXmlFormats`、`ICSharpCode.SharpZipLib`。

### 1、读取Word表格生成字符串

```c#
XWPFDocument docx = new XWPFDocument(stream);

var list = new List<XWPFTableCell>();
string result = "";
foreach (var row in docx.Tables[0].Rows)
{
    foreach (var cell in row.GetTableCells())
    {
        if (!list.Contains(cell))
        {
            list.Add(cell);
            result += cell.GetText() + "#";
        }
    }

    result += "\n";
}
```

### 2、读取Word表格生成XML

```c#
public XmlDocument GetTable(string wordFile)
{
    using (FileStream stream = File.OpenRead(wordFile))
    {
        XWPFDocument docx = new XWPFDocument(stream);
        var list = new List<XWPFTableCell>();

        var xml = new XmlDocument();
        var node = xml.CreateNode(XmlNodeType.XmlDeclaration, "", "");
        xml.AppendChild(node);

        var root = xml.CreateNode(XmlNodeType.Element, "Root", "");
        xml.AppendChild(root);

        var title = xml.CreateNode(XmlNodeType.Element, "Title", "");
        var year = xml.CreateNode(XmlNodeType.Element, "Year", "");
        var type = xml.CreateNode(XmlNodeType.Element, "Type", "");
        var text = xml.CreateNode(XmlNodeType.Element, "Text", "");
        root.AppendChild(title);
        title.AppendChild(year);
        title.AppendChild(type);
        title.AppendChild(text);

        var header = xml.CreateNode(XmlNodeType.Element, "Header", "");
        var totalOrder = xml.CreateNode(XmlNodeType.Element, "TotalOrder", "");
        var secondOrder = xml.CreateNode(XmlNodeType.Element, "SecondOrder", "");
        var date = xml.CreateNode(XmlNodeType.Element, "Date", "");
        var companyName = xml.CreateNode(XmlNodeType.Element, "CompanyName", "");
        var scope = xml.CreateNode(XmlNodeType.Element, "Scope", "");
        var whyUse = xml.CreateNode(XmlNodeType.Element, "WhyUse", "");
        var linkMan = xml.CreateNode(XmlNodeType.Element, "LinkMan", "");
        var phoneNum = xml.CreateNode(XmlNodeType.Element, "PhoneNum", "");
        var address = xml.CreateNode(XmlNodeType.Element, "Address", "");
        header.AppendChild(totalOrder);
        header.AppendChild(secondOrder);
        header.AppendChild(date);
        header.AppendChild(companyName);
        header.AppendChild(scope);
        header.AppendChild(whyUse);
        header.AppendChild(linkMan);
        header.AppendChild(phoneNum);
        header.AppendChild(address);
        root.AppendChild(header);

        var body = xml.CreateNode(XmlNodeType.Element, "Body", "");
        root.AppendChild(body);

        foreach (var table in docx.Tables)
        {
            #region
                for (int i = 0; i < table.Rows.Count; i++)
                {
                    var row = table.Rows[i];
                    for (int j = 0; j < row.GetTableCells().Count; j++)
                    {
                        var cell = row.GetCell(j);
                        if (!list.Contains(cell))
                        {
                            list.Add(cell);

                            if (i == 0)
                            {
                                var titleText = cell.GetText().Split(' ');
                                year.InnerText = titleText[0];
                                type.InnerText = titleText[1];
                                text.InnerText = titleText[2];
                            }
                            else if (i == 1)
                            {
                                switch (j)
                                {
                                    case 0:
                                        totalOrder.InnerText = cell.GetText();
                                        break;
                                    case 1:
                                        secondOrder.InnerText = cell.GetText();
                                        break;
                                    case 2:
                                        date.InnerText = cell.GetText();
                                        break;
                                    case 3:
                                        companyName.InnerText = cell.GetText();
                                        break;
                                    case 4:
                                        scope.InnerText = cell.GetText();
                                        break;
                                    case 5:
                                        whyUse.InnerText = cell.GetText();
                                        break;
                                    case 6:
                                        linkMan.InnerText = cell.GetText();
                                        break;
                                    case 7:
                                        phoneNum.InnerText = cell.GetText();
                                        break;
                                    case 8:
                                        address.InnerText = cell.GetText();
                                        break;

                                    default:
                                        break;
                                }
                            }
                            else
                            {
                                switch (j)
                                {
                                    case 0:
                                        var totalOrder1 = xml.CreateNode(XmlNodeType.Element, "TotalOrder", "");
                                        totalOrder1.InnerText = cell.GetText();
                                        body.AppendChild(totalOrder1);
                                        break;
                                    case 1:
                                        var secondOrder1 = xml.CreateNode(XmlNodeType.Element, "SecondOrder", "");
                                        secondOrder1.InnerText = cell.GetText();
                                        body.AppendChild(secondOrder1);
                                        break;
                                    case 2:
                                        var date1 = xml.CreateNode(XmlNodeType.Element, "Date", "");
                                        date1.InnerText = cell.GetText();
                                        body.AppendChild(date1);
                                        break;
                                    case 3:
                                        var companyName1 = xml.CreateNode(XmlNodeType.Element, "CompanyName", "");
                                        companyName1.InnerText = cell.GetText();
                                        body.AppendChild(companyName1);
                                        break;
                                    case 4:
                                        var scope1 = xml.CreateNode(XmlNodeType.Element, "Scope", "");
                                        scope1.InnerText = cell.GetText();
                                        body.AppendChild(scope1);
                                        break;
                                    case 5:
                                        var whyUse1 = xml.CreateNode(XmlNodeType.Element, "WhyUse", "");
                                        whyUse1.InnerText = cell.GetText();
                                        body.AppendChild(whyUse1);
                                        break;
                                    case 6:
                                        var linkMan1 = xml.CreateNode(XmlNodeType.Element, "LinkMan", "");
                                        linkMan1.InnerText = cell.GetText();
                                        body.AppendChild(linkMan1);
                                        break;
                                    case 7:
                                        var phoneNum1 = xml.CreateNode(XmlNodeType.Element, "PhoneNum", "");
                                        phoneNum1.InnerText = cell.GetText();
                                        body.AppendChild(phoneNum1);
                                        break;
                                    case 8:
                                        var address1 = xml.CreateNode(XmlNodeType.Element, "Address", "");
                                        address1.InnerText = cell.GetText();
                                        body.AppendChild(address1);
                                        break;

                                    default:
                                        break;
                                }
                            }
                        }
                    }
                }
            #endregion            
        }

        return xml;
    }
}

```


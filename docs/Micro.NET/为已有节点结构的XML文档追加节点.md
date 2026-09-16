#### 为已有节点结构的XML文档追加节点

```c#
XDocument xDocument = XDocument.Load(filePath);
XmlDocument xmlDocument = new XmlDocument();

XmlNode nRECORD = xmlDocument.CreateNode("element", "RECORD", "");
XmlNode nName = xmlDocument.CreateNode("element", "NAME", "");//姓名
XmlNode nSex = xmlDocument.CreateNode("element", "SEX", "");//性别
XmlNode nAge = xmlDocument.CreateNode("element", "AGE", "");//年龄
XmlNode nDiagnosis_desc = xmlDocument.CreateNode("element", "DIAGNOSIS_DESC", "");//诊断名称
XmlNode nUsage = xmlDocument.CreateNode("element", "USAGE", "");//用药
XmlNode nCount = xmlDocument.CreateNode("element", "COUNT", "");//药数
XmlNode nCosts = xmlDocument.CreateNode("element", "COSTS", "");//总费用
XmlNode nDoctorName = xmlDocument.CreateNode("element", "DOCTOR_NAME", "");//医师姓名
XmlNode nDateTime = xmlDocument.CreateNode("element", "DATETIME", "");//开方日期
XmlNode nPreciseTime = xmlDocument.CreateNode("element", "PRECISE_TIME", "");//精确时间

nName.InnerText = ucName.Text.Trim();
nSex.InnerText = cmbSex.Text.Trim();
nAge.InnerText = ucAge.Text.Trim();
nDiagnosis_desc.InnerText = ucDiagnosis_desc.Text.Trim();

nCount.InnerText = totalInfor.Count;
nCosts.InnerText = totalInfor.Costs;
nDoctorName.InnerText = txtDoctorName.Text.Trim();
nDateTime.InnerText = txtDateTime.Text.Trim();
nPreciseTime.InnerText = DateTime.Parse(DateTime.Now.ToLongDateString()).ToString("yyyy-MM-dd HH:Mi:ss");

nRECORD.AppendChild(nName);
nRECORD.AppendChild(nSex);
nRECORD.AppendChild(nAge);
nRECORD.AppendChild(nDiagnosis_desc);
nRECORD.AppendChild(nCount);
nRECORD.AppendChild(nCosts);
nRECORD.AppendChild(nDoctorName);
nRECORD.AppendChild(nDateTime);
nRECORD.AppendChild(nPreciseTime);

var root = xmlDocument.DocumentElement;//取到根结点
root.AppendChild(nRECORD);
xmlDocument.Save(filePath);

MessageBox.Show("保存成功！");
```

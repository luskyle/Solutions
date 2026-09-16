#### c#读取xml文档

对应的xml文档如下：

```xml
<?xml version="1.0" encoding="utf-8" ?>
<Root>
  <PerPrice type="H">
    <PerPriceFor16>2.45</PerPriceFor16>
    <PerPriceFor32>2.5</PerPriceFor32>
    <PerPriceFor48>2.55</PerPriceFor48>
  </PerPrice>

  <PerPrice type="M">
    <PerPriceFor16>1.85</PerPriceFor16>
    <PerPriceFor32>1.9</PerPriceFor32>
    <PerPriceFor48>1.95</PerPriceFor48>
  </PerPrice>

  <PerPrice type="L">
    <PerPriceFor16>0.95</PerPriceFor16>
    <PerPriceFor32>1.0</PerPriceFor32>
    <PerPriceFor48>1.05</PerPriceFor48>
  </PerPrice>

</Root>
```

如此读取

```csharp
XmlDocument doc = new XmlDocument();
doc.Load(@"../../Data/PerPrice.xml");
var root = doc.SelectSingleNode("Root");
var childs = root.ChildNodes;

double[] tmp = new double[3];//声明一个长度为3的数组，以依次保存高中低端产品的单价-16路

{
  int index = 0;
  foreach (XmlNode xn in childs)
  {
    tmp[index] = double.Parse(xn.ChildNodes.Item(2).InnerText);
    index++;
  }
  index = 0;
}
```

读取的结果应是：

```
2.55 1.95 1.05
```


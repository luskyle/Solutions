#### 微软`trackbar`控件的bug一例

设置`trackbar`的最大值最小值时，只能使用这种形式：

```csharp
trackBar1.Minimum = -50;
trackBar1.Maximum = 50;

或

int minimum=-50;
int maximum=50;
trackBar1.Minimum = minimum;
trackBar1.Maximum = maximum;

或
int minimum=(int)-50.0;
int maximum=(int)50.0;
trackBar1.Minimum = minimum;
trackBar1.Maximum = maximum;
```

而如果使用这种方式，就会出错。即使在逻辑上（计算结果上是`int`类型）。

```c#
trackBar1.Minimum=(int)chart1.ChartAreas[0].AxisY.Minimum；
trackBar1.Maximum=(int)chart1.ChartAreas[0].AxisY.Maximum；

或

int minimum = (int)chart1.ChartAreas[0].AxisY.Minimum;
int maximum = (int)chart1.ChartAreas[0].AxisY.Maximum;

trackBar1.Minimum = minimum;
trackBar1.Maximum = maximum;

//chart1.ChartAreas[0].AxisY.Minimum 返回结果是double型
//经断点测试 (int)chart1.ChartAreas[0].AxisY.Minimum 值为int，等于Y轴坐标最小值；
//(int)chart1.ChartAreas[0].AxisY.Maximum 值为int，等于Y轴坐标最大值。
//但为 trackbar执行赋值操作后，测试得trackBar1.Minimum与trackBar1.Maximum都为-2147483648
```


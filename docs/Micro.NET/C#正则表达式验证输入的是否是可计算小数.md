#### C#正则表达式验证输入的是否是可计算小数

关键是正则表达式写法，这样做：

```csharp
string validPattern = "^[0-9]+(.[0-9]+)?$";//匹配的类型有：0，0.0，0.00...，00.0.0.00
string inValidPattern1="^[0.]{2,}$";//匹配的类型有：00，.. 
string inValidPattern2 = "^0([0-9]){1,}.*$";//匹配的类型有：00，000，000.，000..

if (Regex.IsMatch((sender as TextBox).Text, inValidPattern1))
{
	(sender as TextBox).Text = "";
}

if (Regex.IsMatch((sender as TextBox).Text, inValidPattern2))
{
	(sender as TextBox).Text = "";
}

if (!Regex.IsMatch((sender as TextBox).Text, validPattern))
{
	(sender as TextBox).Text = "";
}
```


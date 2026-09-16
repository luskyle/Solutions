#### UserControl给属性赋值失败的问题

自建了UserControl，自写了其属性。如下所示

```c#
public string Text
{
	get { return (string)GetValue(TextProperty); }
	set { SetValue(TextProperty, value); }//先清空再赋值，这样不会出现赋值失败的问题
}

public static readonly DependencyProperty TextProperty = DependencyProperty.Register("Text",
typeof(string), typeof(InforLabel), new PropertyMetadata("Text",
(sender, args) => { ((InforLabel)sender).txtBoxInforLabel.Text = args.NewValue.ToString(); }
));

```
这个控件是可正常使用的。

但是如果通过代码设置这个控件的此属性，会出现新值不能覆盖旧值的问题，解决办法是重写Text的set方法

```c#
public string Text
{
    get { return (string)GetValue(TextProperty); }
    set { SetValue(TextProperty, ""); SetValue(TextProperty, value); }//先清空再赋值，这样不会出现赋值失败的问题
}
```

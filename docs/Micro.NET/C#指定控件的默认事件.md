# C#指定控件的默认事件

```c#
[DefaultEvent("Clicked")]
public partial class usrBtn : UserControl
{
        [Browsable(false)]
        public new event EventHandler Click;

        public event EventHandler Clicked
        {
            add
            {
                Click += value;
                label1.Click += value;
            }
            remove
            {
                Click -= value;
                label1.Click -= value;
            }
        }
｝
```

如此设置后，双击控件将默认添加Clicked事件，而不是Load事件。
# C#隐藏系统事件

```c#
[Browsable(false)]
public new event EventHandler Click;
```

如此设置后，该事件将在Visual Studio属性工具栏中不可见。仍可注册此事件，但此事件将失效。
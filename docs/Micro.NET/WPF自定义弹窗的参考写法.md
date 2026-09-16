#### WPF自定义弹窗的参考写法

弹窗，首先是个`Window`窗体，而不是自定义的控件或是什么。其它细节忽略，直接说显示的问题

显示方法应如此写

```c#
public static void show()
{
    RxDialog rxDialog = new RxDialog();
    rxDialog.ShowInTaskbar = false;
    rxDialog.ShowDialog();
}
```
而不要把它定义成动态方法

```c#
public void show()
{
    RxDialog rxDialog = new RxDialog();
    rxDialog.ShowInTaskbar = false;
    rxDialog.ShowDialog();
}
```
若定义成动态方法，那么在关闭主程序后，程序仍不能结束。
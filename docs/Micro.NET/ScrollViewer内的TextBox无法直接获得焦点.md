#### ScrollViewer内的TextBox无法直接获得焦点

若想要设置ScrollViewer内的某个`TextBox`获得焦点，直接使用`Focus()`是不行的。标准写法是

```c#
Dispatcher.BeginInvoke(System.Windows.Threading.DispatcherPriority.Render,new Action(() => txtBoxHerbName.Focus()));
```

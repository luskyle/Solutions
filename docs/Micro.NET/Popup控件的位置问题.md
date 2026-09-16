#### Popup控件的位置问题

经常使用`Popup`控件为某个`Button`做弹出菜单。设置Popup控件`PlacementTarget="{Binding ElementName=按钮名}"`绑定到指定按钮后，Popup控件会取此按钮某个角的坐标为其左上角的起点。而往往实际开发中，我们需要Popup菜单在此按钮正上方，此时就需要通过设置popup的`HorizontalOffset`，此值往往取负。

类似的还有`VerticalOffset`。
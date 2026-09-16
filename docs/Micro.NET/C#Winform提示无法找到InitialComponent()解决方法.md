#### C#`Winform`提示无法找到`InitialComponent()`解决方法

问题是：修改了Form的名称后导致VS编辑器提示无法找到`InitialComponent()`。

解决方法如下：

`打开 项目文件夹中的.csproj文件`，`找到 Form所在的Compile标签的位置 `，`将之改成新窗体的名字`。

这是微软`Visual Studio`的Bug。修改名称的同时没有改变`.csproj`文件中对应的关键信息，导致编译失败。
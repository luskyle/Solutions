#### 写一个很水的c#项目，主要看结构



项目结构是这样的

![2018-07-05_175555](C:\Users\luzhanhui\Desktop\BlogFiles\images\2018-07-05_175555.png)

一个winform项目，一个类库项目。

类库里有两个类，class1（创建类库项目时自建的），class2（拖拽生成的类），这个类库是用类图 ClassLibrary1.ClassDiagram1.cd 文件创建的(拖拖拽拽生成一个类，特别爽)。![2018-07-05_180054](C:\Users\luzhanhui\Desktop\BlogFiles\images\2018-07-05_180054.png)



下面的winform项目中的类class1，接口IClass 也是这种方法创建的。

之后是在这个项目中引用类库 ClassLibrary1中的类：

首先，右击生成这个类库项目，然后在调试目录得到对应的`.dll`文件。之后右击引用将该 dll 文件添加到winform项目中。完了之后就可以在winform项目中要用到`ClassLibrary1`内数据的位置这样调用

```csharp
ClassLibrary1.Class2 cls = new ClassLibrary1.Class2();

cls.Method();
```



这就是类库的意义，用法和类图设计工具的便利。
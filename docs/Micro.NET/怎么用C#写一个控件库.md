#### 怎么用C#写一个控件库



控件库，说白了，就是个类库项目。不过这个类库内定义了一系列自定义的控件。整个项目（类库+调用项目）结构大概是这个样

![2018-07-06_140447](C:\Users\luzhanhui\Desktop\BlogFiles\images\2018-07-06_140447.png)

请忽略`Class2`和`ClassDiagram1.cd`，这是我之前一个博文

[写一个很水的c#项目，主要看结构]: https://blog.csdn.net/qq_33712555/article/details/80931232

用到的项目，留下来也无关紧要。`UserControl2.cs`就是我们的一个控件了。长这个样

![2018-07-06_141003](C:\Users\luzhanhui\Desktop\BlogFiles\images\2018-07-06_141003.png)

一个TextBox下面有一条线，线宽等于文本框的宽等于整个控件的宽。当然，这需要在cs代码中做一些调整（设置属性或是什么）。代码长这个样，仅供参考

![2018-07-06_141344](C:\Users\luzhanhui\Desktop\BlogFiles\images\2018-07-06_141344.png)

```csharp
private int width;
```

定义了一个字段，用来指示控件的宽度，private。然后定义了一个属性，也是用来指示控件宽度，public。这样在类外访问控件宽度需通过属性，而不是直接把字段暴露给外部。

```c#
[Description("控件宽度"), Category("自定义属性")]
public int selfWidth
{
    get
    {
    	return width;
    }
    set
    {
        this.width = value;
        this.Width = value;
        this.txtBox.Width = value;
        this.pictureBox.Width = value;
    }
}

```

其中

```c#
[Description("控件宽度"), Category("自定义属性")]
```

加上这行表明这个属性代表了`控件宽度`，后面的`Category`是分组情况。这行的意义是用了这个控件之后，就能在当前窗体设计器上面方便地改动属性值，就像这样

![2018-07-06_142510](C:\Users\luzhanhui\Desktop\BlogFiles\images\2018-07-06_142510.png)

还有最后一段代码

```c#
private void UserControl1_SizeChanged(object sender, EventArgs e)
{
	this.selfWidth = this.Width;
}

```

尽管这个控件在主调窗体加载完之后大小就固定了，但是仍要增加控件尺寸改变事件。这样做是为了保证控件在窗体设计阶段拖拽能即时地调整自己相关的属性，而不至于外壳改变了，而里面的东西却还是老样子。

最后在我们需要用到这个控件的项目中调用相关`dll`就OK了。

写控件库一点都不难，只需要同样的过程重复N遍再加上一点创意，必要时还需要用点别人的东西。
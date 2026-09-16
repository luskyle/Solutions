### WPF AllowsTransparency的作用

```c#
AllowsTransparency="False"//表示不允许窗体透明
```

效果是这样的：

![allowstransparency](C:\Users\Administrator\Desktop\MyBlogs-ING\C#\images\allowstransparency.png)

很明显窗体四周有边框包围。若值为True，效果是这样的：

![true](C:\Users\Administrator\Desktop\MyBlogs-ING\C#\images\true.png)



当然，上例是

```c#
Background="Transparent"
```

若设置了颜色效果是这样的：

```c#
Background="Beige"
```

![BackgroundTransparent](C:\Users\Administrator\Desktop\MyBlogs-ING\C#\images\BackgroundTransparent.png)
#### WPF绘制一条不连续的线

绘制线应配合使用`LineGeometry`、`GeometryGroup`、`System.Windows.Shapes.Path`。核心流程是将各个LineGeometry添加到GeometryGroup中，然后通过`Path.Data=group`将之合并到一个Path中，最后将`Path`添加到UI上。

绘制不连续的线也是如此做法。

需注意的是可用`double.NaN`来表示空值。然后通过循环绘出各个`LineGeometry`。大概这样写

```csharp
GeometryGroup group = new GeometryGroup();

for (int i = 0; i < pc.Count-1; i++)
{
    Point p0 = pc[i];//起点
    Point p1 = pc[i + 1];//终点

    if (!double.IsNaN(p0.Y) && !double.IsNaN(p1.Y))
    {
        LineGeometry line = new LineGeometry();
        line.StartPoint = p0;
        line.EndPoint = p1;
        group.Children.Add(line);
    }
}

Path path = new Path();
path.Stroke=xxx;
path.StrokeThickness = 2;
path.Data = group;

xxx.Children.Add(path);
```


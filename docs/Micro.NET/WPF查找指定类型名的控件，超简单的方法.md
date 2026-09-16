#### WPF查找指定类型名的控件，超简单的方法

```csharp
/// <summary>
/// 从当前控件开始，查找指定类型名的控件
/// </summary>
/// <param name="obj">当前控件</param>
/// <param name="systemTypeName">指定控件的类型名</param>
/// <returns></returns>
private object FindControl(DependencyObject obj,string systemTypeName)
{
    if (obj.DependencyObjectType.SystemType.Name == systemTypeName)
    {
        return obj;
    }

    return FindControl(VisualTreeHelper.GetParent(obj), systemTypeName);
}

```


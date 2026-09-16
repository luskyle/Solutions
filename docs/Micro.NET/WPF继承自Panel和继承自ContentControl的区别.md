#### WPF继承自Panel和继承自ContentControl的区别（自定义元素）

首先，继承自Panel或继承自ContentControl的类，通过XAML将之引用，将存在于最终的XAML树（VISUAL TREE）中。从树形结构看，继承自ContentControl的类下将自动添加`ContentPresenter`这个节点，而继承自`Panel`的类只有类本身，若通过`ControlTemplate`重写了此类的`Visual Tree`结构，其下的元素也是不能渲染到UI上的，除非模板中添加了`ContentPresenter`，但这影响了树的结构。为了将整个元素，包括其子元素显示出来，要多增加一个子节点。

事实上，我们可以通过重写`panel`类的`ArrangeOverride`,`MeasureOverride`方法来让我们的元素显示出来，而不必借住`ContentPresenter`。这两个方法的意义是，在控件渲染前，向父元素申请一块空间用来显示控件自己。最终显示成什么样子完全由父元素的安排决定。例如，控件想申请一块宽100，高100的空间显示自己，最终安排的结果是在（0，0）的位置分到宽50，高50的空间。虽然没有达到自己的期望，控件仍不得不做出妥协。妥协的结果就是在（0，0）位置以分到的宽高显示自己，说是被裁剪掉也无不可。`MeasureOverride`就是申请空间的过程，`ArrangeOverride`是分配控件的过程。这两个方法大概这么写

```csharp
        protected override Size ArrangeOverride(Size availableSize)
        {
            foreach (UIElement item in this.InternalChildren)
            {
                item.Arrange(new Rect(10, 0, 0.8, 200));
            }

            return availableSize;

        }
        protected override Size MeasureOverride(Size finalSize)
        {
            foreach (UIElement item in this.InternalChildren)
            {
                item.Measure(new Size(100, 200));
            }

            return finalSize;
        }

```


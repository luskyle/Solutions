#### WPF注册Brush类型属性

```c#
        #region BgColor-背景颜色
        /// <summary>
        /// 背景颜色
        /// </summary>
        public Brush BgColor
        {
            get { return (Brush)GetValue(BgColorProperty); }
            set { SetValue(BgColorProperty, value); }
        }

        public static readonly DependencyProperty BgColorProperty = DependencyProperty.Register("BgColor",
            typeof(Brush), typeof(CurvePanel), new PropertyMetadata((Brush)new BrushConverter().ConvertFromString("#EEEEF2"), (sender, args) =>
            {
                try
                {
                    BrushConverter brushConverter = new BrushConverter();
                    (sender as CurvePanel).border.Background = (Brush)args.NewValue;
                }
                catch (Exception) { }
            }));

        #endregion

```


#### WPF缩放-矩阵变换

```xaml
<Grid Margin="0 0 0 0" Grid.Column="1" x:Name="CanvasListPnl"
	MouseDown="CanvasListPnl_MouseDown"
	MouseUp="CanvasListPnl_MouseUp"
	MouseWheel="CanvasListPnl_MouseWheel"
	ClipToBounds="True">
	
    <Grid.RenderTransform>
    	<MatrixTransform x:Name="transForm"></MatrixTransform>
    </Grid.RenderTransform>
</Grid>
</Grid>

```

```csharp
        private void CanvasListPnl_MouseWheel(object sender, MouseWheelEventArgs e)
        {
            var center = getPosition(sender, e);
            var scale = (e.Delta > 0 ? 1.2 : 1 / 1.2);

            var matrix = transForm.Matrix;
            matrix.ScaleAt(scale, scale, center.X, center.Y);

            (e.OriginalSource as Canvas).Children.Clear();

            transForm.Matrix = matrix;

            DrawXYAxis(28,34);
        }

        Point getPosition(object sender, MouseEventArgs e)
        {
            return e.GetPosition(sender as UIElement) * transForm.Matrix;
        }

```


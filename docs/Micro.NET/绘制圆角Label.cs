2019/2/25 

        label3.Paint += Label3_Paint;

        private void Label3_Paint(object sender, PaintEventArgs e)
        {
            base.OnPaint(e);

            var gPath = Draw(e.ClipRectangle, 15);
            gPath.CloseAllFigures();
            e.Graphics.SmoothingMode = SmoothingMode.HighQuality;
            e.Graphics.FillPath(Brushes.Red, gPath);
        }

        private GraphicsPath Draw(Rectangle rect, int arc)
        {
            GraphicsPath gPath = new GraphicsPath();
            gPath.AddArc(rect.X, rect.Y, arc, arc, 180, 90);
            gPath.AddArc(rect.Width - arc, rect.Y, arc, arc, 270, 90);
            gPath.AddArc(rect.Width - arc, rect.Height - arc, arc, arc, 0, 90);
            gPath.AddArc(rect.X, rect.Height - arc, arc, arc, 90, 90);

            return gPath;
        }

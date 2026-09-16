2018/12/18 ÷ÿ‘ÿPaintª≠‘≤Ω«¥∞ÃÂ

	protected override void OnPaint(System.Windows.Forms.PaintEventArgs e)
	{
		if (isFullScreen)
		{
			Region = new Region();
			return;
		}
		GraphicsPath oPath = new GraphicsPath();
		Graphics g = e.Graphics;
		int x = 0;
		int y = 0;
		int w = Width;
		int h = Height;
		int a = 30;
		oPath.AddArc(x, y, a - 9, a - 9, 180, 90);
		oPath.AddArc(w - a + 2, y, a - 2, a - 2, 270, 90);
		oPath.AddArc(w - a - 2, h - a - 2, a + 2, a + 2, 0, 90);
		oPath.AddArc(x, h - a, a, a, 90, 90);
		oPath.CloseAllFigures();
		Region = new Region(oPath);

	}

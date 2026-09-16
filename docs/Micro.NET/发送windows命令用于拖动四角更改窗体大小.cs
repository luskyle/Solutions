2018/12/18 发送windows命令用于拖动四角更改窗体大小

	//windows命令
	const int WM_NCHITTEST = 0x0084;
	const int HTLEFT = 10;
	const int HTRIGHT = 11;
	const int HTTOP = 12;
	const int HTTOPLEFT = 13;
	const int HTTOPRIGHT = 14;
	const int HTBOTTOM = 15;
	const int HTBOTTOMLEFT = 0x10;
	const int HTBOTTOMRIGHT = 17;

	//发送windows命令用于拖动四角更改窗体大小
	protected override void WndProc(ref Message m)
	{
		base.WndProc(ref m);

		if (m.Msg != WM_NCHITTEST || this.WindowState == FormWindowState.Maximized) return;

		Point vPoint = new Point((int)m.LParam & 0xFFFF,
			(int)m.LParam >> 16 & 0xFFFF);
		vPoint = PointToClient(vPoint);
		if (vPoint.X <= 5)
			if (vPoint.Y <= 5)
				m.Result = (IntPtr)HTTOPLEFT;
			else if (vPoint.Y >= ClientSize.Height - 5)
				m.Result = (IntPtr)HTBOTTOMLEFT;
			else m.Result = (IntPtr)HTLEFT;
		else if (vPoint.X >= ClientSize.Width - 5)
			if (vPoint.Y <= 5)
				m.Result = (IntPtr)HTTOPRIGHT;
			else if (vPoint.Y >= ClientSize.Height - 5)
				m.Result = (IntPtr)HTBOTTOMRIGHT;
			else m.Result = (IntPtr)HTRIGHT;
		else if (vPoint.Y <= 5)
			m.Result = (IntPtr)HTTOP;
		else if (vPoint.Y >= ClientSize.Height - 5)
			m.Result = (IntPtr)HTBOTTOM;
	}

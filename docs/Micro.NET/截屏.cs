2018/12/18 截屏

	//截屏
	private void buttonCutScreen_Click(object sender, EventArgs e)
	{
		//判断savepath中的位置是否存在，不存在则建立文件
		if (Directory.Exists(Setting.savePath) == false)
			Directory.CreateDirectory(Setting.savePath);
		//建立与窗体大小相同的图像文件
		Bitmap image = new Bitmap(this.Size.Width, this.Size.Height);
		//创建画笔
		Graphics imgGraphics = Graphics.FromImage(image);

		//获取时间
		DateTime dateTime = DateTime.Now;
		//将时间作为文件名
		string newFileName = dateTime.ToString("截图(yyyyMMdd-HH时mm分ss秒)");
		//将屏幕画入图片
		imgGraphics.CopyFromScreen(new Point(this.Location.X, this.Location.Y), new Point(0, 0), new Size(this.Size.Width, this.Size.Height));


		if (Setting.savePath != null)
		{
			//保存图片
			image.Save(Setting.savePath + newFileName + ".jpg", System.Drawing.Imaging.ImageFormat.Jpeg);

			//若系统版本是win7及以上在截屏时会闪烁窗口，否则不闪烁
			if (System.Environment.OSVersion.Version.Major >= 6)
			{
				startFlash = true;
				TimerLighting.Enabled = true;
			}
			else
				myLabel1.SendText("【操作提示】 截图已保存");
		}

	}


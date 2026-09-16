```c#
    /// <summary>
    /// 截全屏并保存成图片
    /// </summary>
    public void getScreen()
    {
        //Image myImage = new Bitmap(Screen.PrimaryScreen.Bounds.Width, Screen.PrimaryScreen.Bounds.Height);//截取整个屏幕
        Image myImage = new Bitmap(Screen.PrimaryScreen.WorkingArea.Right, Screen.PrimaryScreen.WorkingArea.Bottom);//截取整个工作区
        
        Graphics g = Graphics.FromImage(myImage);

        g.CopyFromScreen(new Point(0, 0), new Point(0, 0), new Size(Screen.PrimaryScreen.Bounds.Width, Screen.PrimaryScreen.Bounds.Height));
        g.ReleaseHdc(g.GetHdc());

        myImage.Save(@"C:\Users\luzhanhui\Desktop\a.jpg");
        
    }
```

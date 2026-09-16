Winform重画ComboBox背景色
2013-09-22 15:01 by 假面Wilson, 3453 阅读, 1 评论, 收藏, 编辑

//返回hWnd参数所指定的窗口的设备环境。
 [System.Runtime.InteropServices.DllImport("user32.dll")]
        static extern IntPtr GetWindowDC(IntPtr hWnd);     

        [System.Runtime.InteropServices.DllImport("user32.dll")]
        //函数释放设备上下文环境（DC）  
        static extern int ReleaseDC(IntPtr hWnd, IntPtr hDC);    
        int WM_PAINT = 0xf; //要求一个窗口重画自己,即Paint事件时         


        /// <summary>
        /// 
        /// </summary>
        /// <param name="m"></param>
        protected override void WndProc(ref Message m)
        { 

            base.WndProc(ref m);
            if (m.Msg == WM_PAINT)
            {
                IntPtr hDC = GetWindowDC(m.HWnd);
                if (hDC.ToInt32() == 0) //如果取设备上下文失败则返回     
                {
                    return;
                }

                PaintComboBox(Graphics.FromHdc(hDC));
                ReleaseDC(m.HWnd, hDC);
            }
        }

 

private void PaintComboBox(Graphics g)
        {
            g.SmoothingMode = SmoothingMode.HighQuality;
            g.TextRenderingHint = TextRenderingHint.AntiAliasGridFit;


            int iDropDownButtonWidth = 17;
            int iDropDownButtonHeight = this.Height;
            int iDropDownButtonLocatinX = 17;
            int iDropDownButtonLocatinY = 0;
            
            if (!Util.PublicFunction.IsHigherWinXP())
            {
                iDropDownButtonWidth = 17;
                iDropDownButtonHeight = this.Height-2;
                iDropDownButtonLocatinX = 19;
                iDropDownButtonLocatinY = 1;
            }
            //下拉按钮
            Rectangle dropDownRectangle = new Rectangle(ClientRectangle.Width - iDropDownButtonLocatinX, iDropDownButtonLocatinY, iDropDownButtonWidth, iDropDownButtonHeight);


            //背景色刷
            Brush bkgBrush;

            //字体色刷
            Brush fcBrush;

            //设置背景色和字体色
            bkgBrush = new SolidBrush(this._backColor);
            fcBrush = new SolidBrush(this._foreColor);

            //画3D边框
            //ControlPaint.DrawBorder3D(g, new Rectangle(0, 0, this.Width, this.Height), Border3DStyle.SunkenInner, Border3DSide.All);


            int iBackColorX = 0;
            //为了字体正常，Enable时只是重画按钮区域
            if (this.Enabled)
            {
                iBackColorX = this.Width - 20;
            }
            //画背景
            g.FillRectangle(bkgBrush, iBackColorX, 0, ClientRectangle.Width, ClientRectangle.Height);

            //为了字体正常，Disable时才重画文本
            if (!this.Enabled)
            {
                //画文本
                g.DrawString(base.Text, this.Font, fcBrush, 2, this.ClientSize.Height / 2, new StringFormat() { LineAlignment = StringAlignment.Center });
            }

            //画边框
            //g.DrawRectangle(_BorderPen, new Rectangle(0, 0, this.Width, this.Height));
            ControlPaint.DrawBorder(g, new Rectangle(0, 0, this.Width, this.Height), borderColor, ButtonBorderStyle.Solid);

            //画下拉按钮
            if (Util.PublicFunction.IsHigherWinXP())
            {
                ControlPaint.DrawComboButton(g, dropDownRectangle, this.Enabled ? System.Windows.Forms.ButtonState.Flat : System.Windows.Forms.ButtonState.All);
            }
            else
            {
                ComboBoxRenderer.DrawDropDownButton(g, dropDownRectangle, this.Enabled ? ComboBoxState.Normal : ComboBoxState.Disabled);
            }

            g.Dispose();
            bkgBrush.Dispose();
            fcBrush.Dispose();

        }

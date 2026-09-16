using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;
using System.ComponentModel;

namespace ControlExs.ControlExs.TextBoxEx
{
    public class QCTextBox : TextBox
    {
        #region Field

        private QQControlState _state = QQControlState.Normal;
        private Font _defaultFont = new Font("微软雅黑", 9);

        //当Text属性为空时编辑框内出现的提示文本
        private string _emptyTextTip;
        private Color _emptyTextTipColor = Color.DarkGray;

        #endregion

        #region Constructor

        public QCTextBox()
        {
            SetStyles();
            this.Font = _defaultFont;
            //this.AutoSize = true;
            this.BorderStyle = BorderStyle.None;
        }

        #endregion

        #region Properites

        [Description("当Text属性为空时编辑框内出现的提示文本")]
        public String EmptyTextTip
        {
            get { return _emptyTextTip; }
            set
            {
                if (_emptyTextTip != value)
                {
                    _emptyTextTip = value;
                    base.Invalidate();
                }
            }
        }

        [Description("获取或设置EmptyTextTip的颜色")]
        public Color EmptyTextTipColor
        {
            get { return _emptyTextTipColor; }
            set
            {
                if (_emptyTextTipColor != value)
                {
                    _emptyTextTipColor = value;
                    base.Invalidate();
                }
            }
        }

        private int _radius = 12;
        [Description("获取或设置圆角弧度")]
        public int Radius
        {
            get { return _radius; }
            set { 
                _radius = value;
                this.Invalidate();
            }
        }

        [Description("获取或设置是否可自定义改变大小")]
        public bool CustomAutoSize
        {
            get { return this.AutoSize; }
            set { this.AutoSize = value; }
        }
       
        
        #endregion

        #region Override

        protected override void OnMouseEnter(EventArgs e)
        {
            _state = QQControlState.Highlight;
            base.OnMouseEnter(e);
        }

        protected override void OnMouseLeave(EventArgs e)
        {
            if (_state == QQControlState.Highlight && Focused)
            {
                _state = QQControlState.Focus;
            }
            else if (_state == QQControlState.Focus)
            {
                _state = QQControlState.Focus;
            }
            else
            {
                _state = QQControlState.Normal;
            }
            base.OnMouseLeave(e);
        }

        protected override void OnMouseDown(MouseEventArgs mevent)
        {
            if (mevent.Button == MouseButtons.Left)
            {
                _state = QQControlState.Highlight;
            }
            base.OnMouseDown(mevent);
        }

        protected override void OnMouseUp(MouseEventArgs mevent)
        {
            if (mevent.Button == MouseButtons.Left)
            {
                if (ClientRectangle.Contains(mevent.Location))
                {
                    _state = QQControlState.Highlight;
                }
                else
                {
                    _state = QQControlState.Focus;
                }
            }
            base.OnMouseUp(mevent);
        }

        protected override void OnLostFocus(EventArgs e)
        {
            _state = QQControlState.Normal;
            base.OnLostFocus(e);
        }

        protected override void OnEnabledChanged(EventArgs e)
        {
            if (Enabled)
            {
                _state = QQControlState.Normal;
            }
            else
            {
                _state = QQControlState.Disabled;
            }
            base.OnEnabledChanged(e);
        }

        protected override void WndProc(ref Message m)
        {//TextBox是由系统进程绘制，重载OnPaint方法将不起作用

            base.WndProc(ref m);
            if (m.Msg == Win32.WM_PAINT || m.Msg == Win32.WM_CTLCOLOREDIT)
            {
                WmPaint(ref m);
            }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (_defaultFont != null)
                {
                    _defaultFont.Dispose();
                }
            }

            _defaultFont = null;
            base.Dispose(disposing);
        }

        #endregion

        #region Private

        private void SetStyles()
        {
            // TextBox由系统绘制，不能设置 ControlStyles.UserPaint样式
            SetStyle(ControlStyles.AllPaintingInWmPaint, true);
            SetStyle(ControlStyles.OptimizedDoubleBuffer, true);
            SetStyle(ControlStyles.ResizeRedraw, true);
            SetStyle(ControlStyles.SupportsTransparentBackColor, true);
            UpdateStyles();
        }

        private void WmPaint(ref Message m)
        {
            Graphics g = Graphics.FromHwnd(base.Handle);

            //g.SmoothingMode = SmoothingMode.AntiAlias;
            //去掉 TextBox 四个角
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.SmoothingMode = SmoothingMode.AntiAlias;
            SetWindowRegion(this.Width, this.Height);

            if (!Enabled)
            {
                _state = QQControlState.Disabled;
            }

            switch (_state)
            {
                case QQControlState.Normal:
                    DrawNormalTextBox(g);
                    break;
                case QQControlState.Highlight:
                    DrawHighLightTextBox(g);
                    break;
                case QQControlState.Focus:
                    DrawFocusTextBox(g);
                    break;
                case QQControlState.Disabled:
                    DrawDisabledTextBox(g);
                    break;
                default:
                    break;
            }

            if (Text.Length == 0 && !string.IsNullOrEmpty(EmptyTextTip) && !Focused)
            {
                TextRenderer.DrawText(g, EmptyTextTip, Font, ClientRectangle, EmptyTextTipColor, GetTextFormatFlags(TextAlign, RightToLeft == RightToLeft.Yes));
            }
        }

        private void DrawNormalTextBox(Graphics g)
        {
            using (Pen borderPen = new Pen(Color.LightGray))
            {
                //g.DrawRectangle(borderPen, new Rectangle(ClientRectangle.X, ClientRectangle.Y, ClientRectangle.Width - 1, ClientRectangle.Height - 1));
                g.DrawPath(borderPen, DrawHelper.DrawRoundRect(ClientRectangle.X, ClientRectangle.Y, ClientRectangle.Width - 1, ClientRectangle.Height - 1, _radius));
            }
        }

        private void DrawHighLightTextBox(Graphics g)
        {
            using (Pen highLightPen = new Pen(ColorTable.QQHighLightColor))
            {
                //Rectangle drawRect = new Rectangle(ClientRectangle.X, ClientRectangle.Y, ClientRectangle.Width - 1, ClientRectangle.Height - 1);
                //g.DrawRectangle(highLightPen, drawRect);

                g.DrawPath(highLightPen, DrawHelper.DrawRoundRect(ClientRectangle.X, ClientRectangle.Y, ClientRectangle.Width - 1, ClientRectangle.Height - 1, _radius));

                //InnerRect
                //drawRect.Inflate(-1, -1);
                //highLightPen.Color = ColorTable.QQHighLightInnerColor;
                //g.DrawRectangle(highLightPen, drawRect);

                g.DrawPath(new Pen(ColorTable.QQHighLightInnerColor), DrawHelper.DrawRoundRect(ClientRectangle.X, ClientRectangle.Y, ClientRectangle.Width - 1, ClientRectangle.Height - 1, _radius));
            }
        }

        private void DrawFocusTextBox(Graphics g)
        {
            using (Pen focusedBorderPen = new Pen(ColorTable.QQHighLightInnerColor))
            {
                //g.DrawRectangle(focusedBorderPen,new Rectangle(ClientRectangle.X,ClientRectangle.Y,ClientRectangle.Width - 1, ClientRectangle.Height - 1));
                g.DrawPath(focusedBorderPen, DrawHelper.DrawRoundRect(ClientRectangle.X, ClientRectangle.Y, ClientRectangle.Width - 1, ClientRectangle.Height - 1, _radius));
            }
        }

        private void DrawDownTextBox(Graphics g)
        {
            using (Pen focusedBorderPen = new Pen(ColorTable.QQHighLightInnerColor))
            {
                //g.DrawRectangle(focusedBorderPen,new Rectangle(ClientRectangle.X,ClientRectangle.Y,ClientRectangle.Width - 1, ClientRectangle.Height - 1));
                g.DrawPath(focusedBorderPen, DrawHelper.DrawRoundRect(ClientRectangle.X, ClientRectangle.Y, ClientRectangle.Width - 1, ClientRectangle.Height - 1, _radius));
            }
        }

        private void DrawDisabledTextBox(Graphics g)
        {
            using (Pen disabledPen = new Pen(SystemColors.ControlDark))
            {
                //g.DrawRectangle(disabledPen,new Rectangle( ClientRectangle.X,ClientRectangle.Y, ClientRectangle.Width - 1,ClientRectangle.Height - 1));
                g.DrawPath(disabledPen, DrawHelper.DrawRoundRect(ClientRectangle.X, ClientRectangle.Y, ClientRectangle.Width - 1, ClientRectangle.Height - 1, _radius));
            }
        }

        private static TextFormatFlags GetTextFormatFlags(HorizontalAlignment alignment, bool rightToleft)
        {
            TextFormatFlags flags = TextFormatFlags.WordBreak |
                TextFormatFlags.SingleLine;
            if (rightToleft)
            {
                flags |= TextFormatFlags.RightToLeft | TextFormatFlags.Right;
            }

            switch (alignment)
            {
                case HorizontalAlignment.Center:
                    flags |= TextFormatFlags.VerticalCenter | TextFormatFlags.HorizontalCenter;
                    break;
                case HorizontalAlignment.Left:
                    flags |= TextFormatFlags.VerticalCenter | TextFormatFlags.Left;
                    break;
                case HorizontalAlignment.Right:
                    flags |= TextFormatFlags.VerticalCenter | TextFormatFlags.Right;
                    break;
            }
            return flags;
        }

        #endregion

        public void SetWindowRegion(int width, int height)
        {
            System.Drawing.Drawing2D.GraphicsPath FormPath = new System.Drawing.Drawing2D.GraphicsPath();
            Rectangle rect = new Rectangle(0, 0, width, height);
            FormPath = GetRoundedRectPath(rect, _radius);
            this.Region = new Region(FormPath);
        }

        private GraphicsPath GetRoundedRectPath(Rectangle rect, int radius)
        {
            int diameter = radius;
            Rectangle arcRect = new Rectangle(rect.Location, new Size(diameter, diameter));
            GraphicsPath path = new GraphicsPath();
            //   左上角      
            path.AddArc(arcRect, 180, 90);
            //   右上角      
            arcRect.X = rect.Right - diameter;
            path.AddArc(arcRect, 270, 90);
            //   右下角      
            arcRect.Y = rect.Bottom - diameter;
            path.AddArc(arcRect, 0, 90);
            //   左下角      
            arcRect.X = rect.Left;
            path.AddArc(arcRect, 90, 90);
            path.CloseFigure();
            return path;
        }
    }
}


public enum QQControlState
    {
        /// <summary>
        /// 正常状态
        /// </summary>
        Normal = 0,
        /// <summary>
        ///  /鼠标进入
        /// </summary>
        Highlight = 1,
        /// <summary>
        /// 鼠标按下
        /// </summary>
        Down = 2,
        /// <summary>
        /// 获得焦点
        /// </summary>
        Focus = 3,
        /// <summary>
        /// 控件禁止
        /// </summary>
        Disabled = 4  
    }
	
	
	
	
	/// <summary>
    /// 实现仿QQ效果控件内部使用颜色表
    /// </summary>
    internal class ColorTable
    {
        public static Color QQBorderColor = Color.LightBlue;  //LightBlue = Color.FromArgb(173, 216, 230)
        public static Color QQHighLightColor =RenderHelper.GetColor(QQBorderColor,255,-63,-11,23);   //Color.FromArgb(110, 205, 253)
        public static Color QQHighLightInnerColor = RenderHelper.GetColor(QQBorderColor, 255, -100, -44, 1);   //Color.FromArgb(73, 172, 231);
    }
	
	
	
	
	internal class DrawHelper
    {
        public static GraphicsPath DrawRoundRect(int x, int y, int width, int height, int radius)
        {
            GraphicsPath gp = new GraphicsPath();
            gp.AddArc(x, y, radius, radius, 180, 90);
            gp.AddArc(width - radius, y, radius, radius, 270, 90);
            gp.AddArc(width - radius, height - radius, radius, radius, 0, 90);
            gp.AddArc(x, height - radius, radius, radius, 90, 90);
            gp.CloseAllFigures();
            return gp;
        }

        /// <summary>
        /// 绘制圆角矩形
        /// </summary>
        /// <param name="rect">矩形</param>
        /// <param name="radius">弯曲程度(0-10)，越大越弯曲</param>
        /// <returns></returns>
        public static GraphicsPath DrawRoundRect(Rectangle rect, int radius)
        {
            int x = rect.X;
            int y = rect.Y;
            int width = rect.Width;
            int height = rect.Height;
            return DrawRoundRect(x, y, width - 2, height - 1, radius);
        }

        /// <summary>
        /// 得到两种颜色的过渡色（1代表开始色，100表示结束色）
        /// </summary>
        /// <param name="c">开始色</param>
        /// <param name="c2">结束色</param>
        /// <param name="value">需要获得的度</param>
        /// <returns></returns>
        public static Color GetIntermediateColor(Color c, Color c2, int value)
        {
            float pc = value * 1.0F / 100;

            int ca = c.A, cr = c.R, cg = c.G, cb = c.B;
            int c2a = c2.A, c2r = c2.R, c2g = c2.G, c2b = c2.B;

            int a = (int)Math.Abs(ca + (ca - c2a) * pc);
            int r = (int)Math.Abs(cr - ((cr - c2r) * pc));
            int g = (int)Math.Abs(cg - ((cg - c2g) * pc));
            int b = (int)Math.Abs(cb - ((cb - c2b) * pc));

            if (a > 255) { a = 255; }
            if (r > 255) { r = 255; }
            if (g > 255) { g = 255; }
            if (b > 255) { b = 255; }

            return (Color.FromArgb(a, r, g, b));
        }

        public static StringFormat StringFormatAlignment(ContentAlignment textalign)
        {
            StringFormat sf = new StringFormat();
            switch (textalign)
            {
                case ContentAlignment.TopLeft:
                case ContentAlignment.TopCenter:
                case ContentAlignment.TopRight:
                    sf.LineAlignment = StringAlignment.Near;
                    break;
                case ContentAlignment.MiddleLeft:
                case ContentAlignment.MiddleCenter:
                case ContentAlignment.MiddleRight:
                    sf.LineAlignment = StringAlignment.Center;
                    break;
                case ContentAlignment.BottomLeft:
                case ContentAlignment.BottomCenter:
                case ContentAlignment.BottomRight:
                    sf.LineAlignment = StringAlignment.Far;
                    break;
            }
            return sf;
        }

        /// <summary>
        /// 绘图对像
        /// </summary>
        /// <param name="g">绘图对像</param>
        /// <param name="img">图片</param>
        /// <param name="r">绘置的图片大小、坐标</param>
        /// <param name="lr">绘置的图片边界</param>
        /// <param name="index">当前状态</param>
        /// <param name="Totalindex">状态总数</param>
        public static void DrawRect(Graphics g, Bitmap img, Rectangle r, Rectangle lr, int index, int Totalindex)
        {
            if (img == null) return;
            Rectangle r1, r2;
            int x = (index - 1) * img.Width / Totalindex;
            int y = 0;
            int x1 = r.Left;
            int y1 = r.Top;

            if (r.Height > img.Height && r.Width <= img.Width / Totalindex)
            {
                r1 = new Rectangle(x, y, img.Width / Totalindex, lr.Top);
                r2 = new Rectangle(x1, y1, r.Width, lr.Top);
                g.DrawImage(img, r2, r1, GraphicsUnit.Pixel);

                r1 = new Rectangle(x, y + lr.Top, img.Width / Totalindex, img.Height - lr.Top - lr.Bottom);
                r2 = new Rectangle(x1, y1 + lr.Top, r.Width, r.Height - lr.Top - lr.Bottom);
                if ((lr.Top + lr.Bottom) == 0) r1.Height = r1.Height - 1;
                g.DrawImage(img, r2, r1, GraphicsUnit.Pixel);

                r1 = new Rectangle(x, y + img.Height - lr.Bottom, img.Width / Totalindex, lr.Bottom);
                r2 = new Rectangle(x1, y1 + r.Height - lr.Bottom, r.Width, lr.Bottom);
                g.DrawImage(img, r2, r1, GraphicsUnit.Pixel);
            }
            else
                if (r.Height <= img.Height && r.Width > img.Width / Totalindex)
                {
                    r1 = new Rectangle(x, y, lr.Left, img.Height);
                    r2 = new Rectangle(x1, y1, lr.Left, r.Height);
                    g.DrawImage(img, r2, r1, GraphicsUnit.Pixel);
                    r1 = new Rectangle(x + lr.Left, y, img.Width / Totalindex - lr.Left - lr.Right, img.Height);
                    r2 = new Rectangle(x1 + lr.Left, y1, r.Width - lr.Left - lr.Right, r.Height);
                    g.DrawImage(img, r2, r1, GraphicsUnit.Pixel);
                    r1 = new Rectangle(x + img.Width / Totalindex - lr.Right, y, lr.Right, img.Height);
                    r2 = new Rectangle(x1 + r.Width - lr.Right, y1, lr.Right, r.Height);
                    g.DrawImage(img, r2, r1, GraphicsUnit.Pixel);
                }
                else
                    if (r.Height <= img.Height && r.Width <= img.Width / Totalindex) { r1 = new Rectangle((index - 1) * img.Width / Totalindex, 0, img.Width / Totalindex, img.Height); g.DrawImage(img, new Rectangle(x1, y1, r.Width, r.Height), r1, GraphicsUnit.Pixel); }
                    else if (r.Height > img.Height && r.Width > img.Width / Totalindex)
                    {
                        //top-left
                        r1 = new Rectangle(x, y, lr.Left, lr.Top);
                        r2 = new Rectangle(x1, y1, lr.Left, lr.Top);
                        g.DrawImage(img, r2, r1, GraphicsUnit.Pixel);

                        //top-bottom
                        r1 = new Rectangle(x, y + img.Height - lr.Bottom, lr.Left, lr.Bottom);
                        r2 = new Rectangle(x1, y1 + r.Height - lr.Bottom, lr.Left, lr.Bottom);
                        g.DrawImage(img, r2, r1, GraphicsUnit.Pixel);

                        //left
                        r1 = new Rectangle(x, y + lr.Top, lr.Left, img.Height - lr.Top - lr.Bottom);
                        r2 = new Rectangle(x1, y1 + lr.Top, lr.Left, r.Height - lr.Top - lr.Bottom);
                        g.DrawImage(img, r2, r1, GraphicsUnit.Pixel);

                        //top
                        r1 = new Rectangle(x + lr.Left, y,
                            img.Width / Totalindex - lr.Left - lr.Right, lr.Top);
                        r2 = new Rectangle(x1 + lr.Left, y1,
                            r.Width - lr.Left - lr.Right, lr.Top);
                        g.DrawImage(img, r2, r1, GraphicsUnit.Pixel);

                        //right-top
                        r1 = new Rectangle(x + img.Width / Totalindex - lr.Right, y, lr.Right, lr.Top);
                        r2 = new Rectangle(x1 + r.Width - lr.Right, y1, lr.Right, lr.Top);
                        g.DrawImage(img, r2, r1, GraphicsUnit.Pixel);

                        //Right
                        r1 = new Rectangle(x + img.Width / Totalindex - lr.Right, y + lr.Top,
                            lr.Right, img.Height - lr.Top - lr.Bottom);
                        r2 = new Rectangle(x1 + r.Width - lr.Right, y1 + lr.Top,
                            lr.Right, r.Height - lr.Top - lr.Bottom);
                        g.DrawImage(img, r2, r1, GraphicsUnit.Pixel);

                        //right-bottom
                        r1 = new Rectangle(x + img.Width / Totalindex - lr.Right, y + img.Height - lr.Bottom,
                            lr.Right, lr.Bottom);
                        r2 = new Rectangle(x1 + r.Width - lr.Right, y1 + r.Height - lr.Bottom,
                            lr.Right, lr.Bottom);
                        g.DrawImage(img, r2, r1, GraphicsUnit.Pixel);

                        //bottom
                        r1 = new Rectangle(x + lr.Left, y + img.Height - lr.Bottom,
                            img.Width / Totalindex - lr.Left - lr.Right, lr.Bottom);
                        r2 = new Rectangle(x1 + lr.Left, y1 + r.Height - lr.Bottom,
                            r.Width - lr.Left - lr.Right, lr.Bottom);
                        g.DrawImage(img, r2, r1, GraphicsUnit.Pixel);

                        //Center
                        r1 = new Rectangle(x + lr.Left, y + lr.Top,
                            img.Width / Totalindex - lr.Left - lr.Right, img.Height - lr.Top - lr.Bottom);
                        r2 = new Rectangle(x1 + lr.Left, y1 + lr.Top,
                            r.Width - lr.Left - lr.Right, r.Height - lr.Top - lr.Bottom);
                        g.DrawImage(img, r2, r1, GraphicsUnit.Pixel);
                    }
        }

        /// <summary>
        /// 绘图对像
        /// </summary>
        /// <param name="g"> 绘图对像</param>
        /// <param name="obj">图片对像</param>
        /// <param name="r">绘置的图片大小、坐标</param>
        /// <param name="index">当前状态</param>
        /// <param name="Totalindex">状态总数</param>
        public static void DrawRect(Graphics g, Bitmap img, Rectangle r, int index, int Totalindex)
        {
            if (img == null) return;
            int width = img.Width / Totalindex;
            int height = img.Height;
            Rectangle r1, r2;
            int x = (index - 1) * width;
            int y = 0;
            r1 = new Rectangle(x, y, width, height);
            r2 = new Rectangle(r.Left, r.Top, r.Width, r.Height);
            g.DrawImage(img, r2, r1, GraphicsUnit.Pixel);
        }

        /// <summary>
        /// 得到要绘置的图片对像
        /// </summary>
        /// <param name="str">图像在程序集中的地址</param>
        /// <returns></returns>
        public static Bitmap GetResBitmap(string str)
        {
            Stream sm;
            sm = FindStream(str);
            if (sm == null) return null;
            return new Bitmap(sm);
        }

        /// <summary>
        /// 得到图程序集中的图片对像
        /// </summary>
        /// <param name="str">图像在程序集中的地址</param>
        /// <returns></returns>
        private static Stream FindStream(string str)
        {
            Assembly assembly = Assembly.GetExecutingAssembly();
            string[] resNames = assembly.GetManifestResourceNames();
            foreach (string s in resNames)
            {
                if (s == str)
                {
                    return assembly.GetManifestResourceStream(s);
                }
            }
            return null;
        }

    }
	
	
	
	public class Win32
    {
        #region Window Const

        public const int WM_KEYDOWN = 0x0100;
        public const int WM_KEYUP = 0x0101;
        public const int WM_CTLCOLOREDIT = 0x133;
        public const int WM_ERASEBKGND = 0x0014;
        public const int WM_LBUTTONDOWN = 0x0201;
        public const int WM_LBUTTONUP = 0x0202;
        public const int WM_LBUTTONDBLCLK = 0x0203;
        public const int WM_WINDOWPOSCHANGING = 0x46;
        public const int WM_PAINT = 0xF;
        public const int WM_CREATE = 0x0001;
        public const int WM_ACTIVATE = 0x0006;
        public const int WM_NCCREATE = 0x0081;
        public const int WM_NCCALCSIZE = 0x0083;
        public const int WM_NCPAINT = 0x0085;
        public const int WM_NCACTIVATE = 0x0086;
        public const int WM_NCLBUTTONDOWN = 0x00A1;
        public const int WM_NCLBUTTONUP = 0x00A2;
        public const int WM_NCLBUTTONDBLCLK = 0x00A3;
        public const int WM_NCMOUSEMOVE = 0x00A0;

        public const int WM_NCHITTEST = 0x0084;

        public const int HTLEFT = 10;
        public const int HTRIGHT = 11;
        public const int HTTOP = 12;
        public const int HTTOPLEFT = 13;
        public const int HTTOPRIGHT = 14;
        public const int HTBOTTOM = 15;
        public const int HTBOTTOMLEFT = 0x10;
        public const int HTBOTTOMRIGHT = 17;
        public const int HTCAPTION = 2;
        public const int HTCLIENT = 1;

        public const int WM_FALSE = 0;
        public const int WM_TRUE = 1;

        

        #endregion

        #region Public extern methods

        [DllImport("gdi32.dll")]
        public static extern int CreateRoundRectRgn(int x1, int y1, int x2, int y2, int x3, int y3);

        [DllImport("user32.dll")]
        public static extern int SetWindowRgn(IntPtr hwnd, int hRgn, Boolean bRedraw);

        [DllImport("gdi32.dll", EntryPoint = "DeleteObject", CharSet = CharSet.Ansi)]
        public static extern int DeleteObject(int hObject);

        [DllImport("user32.dll")]
        public static extern int SendMessage(IntPtr hWnd, int Msg, int wParam, int lParam);

        [DllImport("user32.dll")]
        public static extern bool ReleaseCapture();

        #endregion
    }







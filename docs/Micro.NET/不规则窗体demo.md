#### 不规则窗体

主要用控件的`Region`属性。效果如下

![aaa](images\aaa.gif)

源码如下：

```c#
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;
using System.Drawing.Drawing2D;
using System.Runtime.InteropServices;

namespace WindowsApplication22
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
            
            //重新绘制窗口样式
            string fileName = @"bg.jpg";
            Bitmap mybitmap = new Bitmap(fileName);
            CreateControlRegion(this, mybitmap);
            this.BackColor = Color.White;// 此处为添加部分  
            this.TransparencyKey = Color.White;//此处为添加部分 

            CreateControlRegion(button1, mybitmap);

            int btnWidth = button1.Width;
            int btnHeight = button1.Height;

            button1.Width = btnWidth / 2;
            button1.Height = btnHeight / 6;

            button1.Location = new Point((this.Width - button1.Width) / 2, (this.Height - button1.Height) / 2 - button1.Height);

            button1.Font = new System.Drawing.Font("微软雅黑", 20);
            button1.Text = "Button";

        }

             /// <summary>
        /// 重新绘制窗口样式
        /// </summary>
        /// <param name="control"></param>
        /// <param name="bitmap"></param>
        public static void CreateControlRegion(Control control, Bitmap bitmap)
        {
            // Return if control and bitmap are null  
            //判断是否存在控件和位图  
            if (control == null || bitmap == null)
                return;
            //设置控件大小为位图大小  
            control.Width = bitmap.Width;
            control.Height = bitmap.Height;
            // Check if we are dealing with Form here   
            //当控件是form时  
            if (control is System.Windows.Forms.Form)
            {
                // Cast to a Form object  
                //强制转换为FORM  
                Form form = (Form)control;
                //当FORM的边界FormBorderStyle不为NONE时，应将FORM的大小设置成比位图大小稍大一点  
                form.Width = control.Width;
                form.Height = control.Height;
                //没有边界  
                form.FormBorderStyle = FormBorderStyle.None;
                //将位图设置成窗体背景图片  
                form.BackgroundImage = bitmap;
                //计算位图中不透明部分的边界  
                GraphicsPath graphicsPath = CalculateControlGraphicsPath(bitmap);
                //应用新的区域  
                form.Region = new Region(graphicsPath);

                // 以下为自己添加的语句，不添加此两句会出现问题  
                form.Width = bitmap.Width;
                form.Height = bitmap.Height;
            }

            //当控件是button时  
            else if (control is System.Windows.Forms.Button)
            {
                //强制转换为 button  
                Button button = (Button)control;
                //不显示button text  
                button.Text = "";

                //改变 cursor的style  
                button.Cursor = Cursors.Hand;

                //设置button的背景图片  
                button.BackgroundImage = bitmap;

                //计算位图中不透明部分的边界  
                GraphicsPath graphicsPath = CalculateControlGraphicsPath(bitmap);
                // Apply new region   
                //应用新的区域  
                button.Region = new Region(graphicsPath);
                button.Width = bitmap.Width;
                button.Height = bitmap.Height;
                button.FlatStyle = FlatStyle.Popup;//此处为添加部分  
            }
        }


        private static GraphicsPath CalculateControlGraphicsPath(Bitmap bitmap)
        {
            //创建 GraphicsPath  
            GraphicsPath graphicsPath = new GraphicsPath();

            //使用左上角的一点的颜色作为我们透明色  
            Color colorTransparent = bitmap.GetPixel(0, 0);

            //第一个找到点的X  
            int colOpaquePixel = 0;

            // 偏历所有行（Y方向）  
            for (int row = 0; row < bitmap.Height - 1; row++)
            {
                // Reset value   
                //重设  
                colOpaquePixel = 0;

                //偏历所有列（X方向）  
                for (int col = 0; col < bitmap.Width - 1; col++)
                {
                    //如果是不需要透明处理的点则标记，然后继续偏历  
                    if (bitmap.GetPixel(col, row) != colorTransparent)
                    {

                        colOpaquePixel = col;

                        //建立新变量来记录当前点  
                        int colNext = col;

                        ///从找到的不透明点开始，继续寻找不透明点,一直到找到或则达到图片宽度   
                        for (colNext = colOpaquePixel; colNext < bitmap.Width; colNext++)
                        {
                            Color gpi = bitmap.GetPixel(colNext, row);
                            if (bitmap.GetPixel(colNext, row) == colorTransparent)
                            {

                                break;
                            }
                        }
                        //将不透明点加到graphics path  

                        {
                            graphicsPath.AddRectangle(new Rectangle(colOpaquePixel, row, colNext - colOpaquePixel, 1));
                        }
                        col = colNext;
                    }
                }
            }
            return graphicsPath;

        }

        private void Form1_MouseDown(object sender, MouseEventArgs e)
        {
            if (e.Button == MouseButtons.Left)
            {
                ReleaseCapture();
                SendMessage(base.Handle, 0x112, 0xf012, 0);
            }
        }

        [DllImport("user32.dll")]
        public static extern bool ReleaseCapture();

        [DllImport("user32.dll")]
        public static extern bool SendMessage(IntPtr hwnd, int wMsg, int wParam, int IParam);

        private void button1_Click(object sender, EventArgs e)
        {
            Close();
        }

    }
}
```


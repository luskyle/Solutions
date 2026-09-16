# winform控件重绘

```c#
BackColor = Color.Red;
```

将会导致界面或控件重绘。即会触发`OnPaint`事件。`Color.Red`的赋值不会改变控件的`BackColor`，只是触发了`OnPaint`事件而已，一切改变将在`OnPaint`中实现。例如：

```c#
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Windows.Forms;

namespace PCD.UsrCtrl
{
    public partial class usrBtn : UserControl
    {
        public usrBtn()
        {
            InitializeComponent();

            int x = (Width - label1.Width) / 2;
            int y = (Height - label1.Height) / 2;
            label1.Location = new Point(x, y);

            MouseEnter += UsrBtn_MouseEnter;
            MouseLeave += UsrBtn_MouseLeave;
        }

        private void UsrBtn_MouseLeave(object sender, EventArgs e)
        {
            MouseEntered = false;
        }

        private void UsrBtn_MouseEnter(object sender, EventArgs e)
        {
            MouseEntered = true;
            BackColor = Color.Green;//改为绿色
        }

        private bool MouseEntered;

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);

            Rectangle rect = new Rectangle(e.ClipRectangle.X, e.ClipRectangle.Y, e.ClipRectangle.Width-1, e.ClipRectangle.Height-1);
            Pen pen = new Pen(Color.FromArgb(173, 173, 173));
            e.Graphics.DrawRectangle(pen, rect);

            if (MouseEntered)
                BackColor = Color.Gray;//改为灰色
            else
                BackColor = Color.FromArgb(225, 225, 225);
        }

        public new string Text
        {
            set
            {
                label1.Text = value;
            }
        }
    }
}
```

最终底色将是灰色。

可将`UsrBtn_MouseEnter`中的`BackColor = Color.Green;`替换为`Invalidate()`。此方法将导致触发`OnPaint`事件。
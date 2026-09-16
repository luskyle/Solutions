2019/3/5 动态信息提示控件

using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Windows.Forms;

namespace _350.UsrCtrl
{
    public partial class DyLabel : Panel
    {
        public Label label;
        private DyDelegate del;
        private int moveStep;
        private System.Timers.Timer timer;
        private delegate void DyDelegate();

        public DyLabel()
        {
            this.label = new Label();
            this.timer = new System.Timers.Timer();
            this.moveStep = 3;
            base.SetStyle(ControlStyles.OptimizedDoubleBuffer | ControlStyles.AllPaintingInWmPaint | ControlStyles.ResizeRedraw, true);
            this.BackColor = Color.Transparent;
            this.label.Location = new Point(0, 5);
            this.label.Size = new Size(Size.Width, 20);
            this.label.Show();
            this.label.Text = "";
            this.label.Font = new Font("微软雅黑", 10.5f, FontStyle.Regular, GraphicsUnit.Point, 0x86);
            this.label.ForeColor = Color.FromArgb(20, 0xc5, 0xd8);
            this.label.TextAlign = ContentAlignment.MiddleCenter;
            base.Controls.Add(this.label);
            this.timer.Elapsed += timer_Elapsed;
            this.del = DyMove;
        }

        /// <summary>
        /// 向控件发要显示的内容
        /// </summary>
        /// <param name="text">要显示的内容</param>
        /// <param name="warning">若为true，则显示的内容为红色</param>
        public void SendMsg(string text, bool warning = false)
        {
            DyInfo.Text = text;
            DyInfo.Warning = warning;
            DyShow();
        }

        /// <summary>
        /// 移动文本内容
        /// </summary>
        private void DyMove()
        {
            if (DyInfo.Status == Status.Move_Out)
            {
                if (this.label.Location.Y > -20)
                {
                    this.label.Location = new Point(this.label.Location.X, this.label.Location.Y - this.moveStep);
                }
                else
                {
                    DyInfo.Status = Status.Move_In;
                    this.label.Location = new Point(this.label.Location.X, 0x19);
                    this.label.Text = DyInfo.Text;
                    if (!DyInfo.Warning)
                        this.label.ForeColor = Color.FromArgb(20, 0xc5, 0xd8);
                    else
                        this.label.ForeColor = Color.Red;
                    DyInfo.Text = "";
                }
            }
            else if (DyInfo.Status == Status.Move_In)
            {
                if (this.label.Location.Y > 5)
                {
                    this.label.Location = new Point(this.label.Location.X, this.label.Location.Y - this.moveStep);
                }
                else
                {
                    DyInfo.Status = Status.Stay;
                    this.timer.Interval = 1000;
                    this.timer.AutoReset = false;
                }
            }
        }
        /// <summary>
        /// 显示文本内容
        /// </summary>
        private void DyShow()
        {
            if (DyInfo.Status < Status.Move_In)
            {
                timer.Enabled = true;
                timer.Interval = 30;
                timer.AutoReset = true;
                DyInfo.Status = Status.Move_Out;
            }
        }
        private void timer_Elapsed(object sender, EventArgs e)
        {
            if (DyInfo.Status == Status.Stay)
            {
                timer.Enabled = false;
                DyInfo.Status = Status.Free;
                DyShow();
            }
            else
            {
                Invoke(del);
            }
        }

        private enum Status
        {
            Free,
            Move_Out,
            Move_In,
            Stay
        }

        [StructLayout(LayoutKind.Sequential, Size = 1)]
        private struct DyInfo
        {
            public static string Text;
            public static Status Status;
            public static bool Warning;
            static DyInfo()
            {
                Text = "";
                Warning = false;
            }
        }
    }
}

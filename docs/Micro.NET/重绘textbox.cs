using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.ComponentModel; 
using System.Collections;
using System.Diagnostics;
using System.Windows.Forms;
using System.Drawing;
using System.Drawing.Drawing2D;
namespace Project
{
[ToolboxItem(true)] 
public partial class CTextBox :System.Windows.Forms.TextBox
{
[System.Runtime.InteropServices.DllImport("user32.dll")]
static extern IntPtr GetWindowDC(IntPtr hwnd);
[System.Runtime.InteropServices.DllImport("user32.dll")]
static extern int ReleaseDC(IntPtr hWnd, IntPtr hDC);
public CTextBox() : base() { }
/// <summary> 
/// 是否启用热点效果 
/// </summary> 
private bool _HotTrack = true;
private bool _Isempty=false;
/// <summary> 
/// 边框颜色 
/// </summary> 
private Color _BorderColor = Color.Red;// Color.FromArgb(0xA7, 0xA6, 0xAA);
/// <summary> 
/// 热点边框颜色 
/// </summary> 
private Color _HotColor = Color.FromArgb(0x33, 0x5E, 0xA8);
/// <summary> 
/// 是否鼠标MouseOver状态 
/// </summary> 
private bool _IsMouseOver = false;
[Category("行为"),Description("获得或设置一个值，指示当鼠标经过控件时控件边框是否发生变化。只在控件的BorderStyle为FixedSingle时有效"),DefaultValue(true)]
public bool HotTrack
{
get
{
return this._HotTrack;
}
set
{
this._HotTrack = value;
//在该值发生变化时重绘控件，下同 
//在设计模式下，更改该属性时，如果不调用该语句， 
//则不能立即看到设计试图中该控件相应的变化 
this.Invalidate();
}
}
[Category("变色"),Description("获得或设置一个值，当鼠标点击按钮的时候判断文本框是否为空"),DefaultValue(false)]
public bool IsEmpty
{
get
{
return this._Isempty;
}
set
{
this._Isempty = value;
//在该值发生变化时重绘控件，下同 //在设计模式下，更改该属性时，如果不调用该语句， //则不能立即看到设计试图中该控件相应的变化 
this.Invalidate();
}
}
/// <summary> 
/// 边框颜色 
/// </summary> 
[Category("外观"),Description("获得或设置控件的边框颜色"),DefaultValue(typeof(Color), "#A7A6AA")]
public Color BorderColor
{
get
{
return this._BorderColor;
}
set
{
this._BorderColor = value;
this.Invalidate();
}
}
/// <summary> 
/// 热点时边框颜色 
/// </summary> 
[Category("外观"),Description("获得或设置当鼠标经过控件时控件的边框颜色。只在控件的BorderStyle为FixedSingle时有效"),DefaultValue(typeof(Color), "#335EA8")]
public Color HotColor
{
get
{
return this._HotColor;
}
set
{
this._HotColor = value;
this.Invalidate();
}
}
public void TextBoxXP()
{
}
/// <summary> 
/// 鼠标移动到该控件上时 
/// </summary> 
/// <param name="e"></param> 
protected override void OnMouseMove(MouseEventArgs e)
{
//鼠标状态 
this._IsMouseOver = true;
//如果启用HotTrack，则开始重绘 //如果不加判断这里不加判断，则当不启用HotTrack， //鼠标在控件上移动时，控件边框会不断重绘， //导致控件边框闪烁。下同 
if (this._HotTrack)
{
this.Invalidate();//重绘 
}
base.OnMouseMove(e);
}
/// <summary> 
/// 当鼠标从该控件移开时 
/// </summary> 
/// <param name="e"></param> 
protected override void OnMouseLeave(EventArgs e)
{
this._IsMouseOver = false;
if (this._HotTrack)
{
this.Invalidate(); //重绘 
}
base.OnMouseLeave(e);
}
/// <summary> 
/// 当该控件获得焦点时 
/// </summary> 
/// <param name="e"></param> 
protected override void OnGotFocus(EventArgs e)
{
if (this._HotTrack)
{
this.Invalidate();//重绘 
}
base.OnGotFocus(e);
}
/// <summary> 
/// 当该控件失去焦点时 
/// </summary> 
/// <param name="e"></param> 
protected override void OnLostFocus(EventArgs e)
{
if (this._HotTrack)
{
this.Invalidate();//重绘 
}
base.OnLostFocus(e);
} 
/// <summary> 
/// 获得操作系统消息 
/// </summary> 
/// <param name="m"></param> 
protected override void WndProc(ref System.Windows.Forms.Message m)
{
base.WndProc(ref m);
if (m.Msg == 0xf || m.Msg == 0x133)
{
IntPtr hDC = GetWindowDC(m.HWnd);
if (hDC.ToInt32() == 0)
{
return;
}
//只有在边框样式为FixedSingle时自定义边框样式才有效 
if (this.BorderStyle == BorderStyle.FixedSingle)
{
if (_Isempty)
{
System.Drawing.Pen pen = new Pen(this._BorderColor,2); //边框Width为2个像素 
if (this._HotTrack)
{
if (this.Focused)
{
pen.Color = this._HotColor;
}
else
{
if (this._IsMouseOver)
{
pen.Color = this._HotColor;
}
else
{
pen.Color = this._BorderColor;
}
}
}
//绘制边框 
System.Drawing.Graphics g = Graphics.FromHdc(hDC);
g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
g.DrawRectangle(pen, 0, 0, this.Width - 1, this.Height - 1);
pen.Dispose();
}
}
m.Result = IntPtr.Zero;//返回结果 
ReleaseDC(m.HWnd, hDC);//释放 
}
}
private void InitializeComponent()
{
this.SuspendLayout();
// 
// CTextBox
// 
this.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
this.ResumeLayout(false);
} 
}
}
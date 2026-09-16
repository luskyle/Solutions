#### user32.dll的源码

```c#

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.InteropServices;
 
namespace WindowsAPI
{
    class CSharp_Win32Api
    {
        #region User32.dll 函数
        /// <summary>
        /// 该函数检索一指定窗口的客户区域或整个屏幕的显示设备上下文环境的句柄，以后可以在GDI函数中使用该句柄来在设备上下文环境中绘图。hWnd：设备上下文环境被检索的窗口的句柄
        /// </summary>
        [DllImport("user32.dll", CharSet = CharSet.Auto)]
        public static extern IntPtr GetDC(IntPtr hWnd);
        /// <summary>
        /// 函数释放设备上下文环境（DC）供其他应用程序使用。
        /// </summary>
        public static extern int ReleaseDC(IntPtr hWnd, IntPtr hDC);
        /// <summary>
        /// 该函数返回桌面窗口的句柄。桌面窗口覆盖整个屏幕。
        /// </summary>
        static public extern IntPtr GetDesktopWindow();
        /// <summary>
        /// 该函数设置指定窗口的显示状态。
        /// </summary>
        static public extern bool ShowWindow(IntPtr hWnd, short State);
        /// <summary>
        /// 通过发送重绘消息 WM_PAINT 给目标窗体来更新目标窗体客户区的无效区域。
        /// </summary>
        static public extern bool UpdateWindow(IntPtr hWnd);
        /// <summary>
        /// 该函数将创建指定窗口的线程设置到前台，并且激活该窗口。键盘输入转向该窗口，并为用户改各种可视的记号。系统给创建前台窗口的线程分配的权限稍高于其他线程。
        /// </summary>
        static public extern bool SetForegroundWindow(IntPtr hWnd);
        /// <summary>
        /// 该函数改变一个子窗口，弹出式窗口式顶层窗口的尺寸，位置和Z序。
        /// </summary>
        static public extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int x, int y, int Width, int Height, uint flags);
        /// <summary>
        /// 打开剪切板
        /// </summary>
        static public extern bool OpenClipboard(IntPtr hWndNewOwner);
 
 
        /// <summary>
        /// 关闭剪切板
        /// </summary>
        static public extern bool CloseClipboard();
        /// <summary>
        /// 打开清空</summary>
        static public extern bool EmptyClipboard();
        /// <summary>
        /// 将存放有数据的内存块放入剪切板的资源管理中
        /// </summary>
        static public extern IntPtr SetClipboardData(uint Format, IntPtr hData);
        /// <summary>
        /// 在一个矩形中装载指定菜单条目的屏幕坐标信息 
        /// </summary>
        static public extern bool GetMenuItemRect(IntPtr hWnd, IntPtr hMenu, uint Item, ref RECT rc);
 
        [DllImport("user32.dll", ExactSpelling = true, CharSet = CharSet.Auto)]
        /// <summary>
        /// 该函数获得一个指定子窗口的父窗口句柄。
        /// </summary>
        public static extern IntPtr GetParent(IntPtr hWnd);
        /// <summary>
        /// 该函数将指定的消息发送到一个或多个窗口。此函数为指定的窗口调用窗口程序，直到窗口程序处理完消息再返回。　
        /// </summary>
        /// <param name="hWnd">其窗口程序将接收消息的窗口的句柄</param>
        /// <param name="msg">指定被发送的消息</param>
        /// <param name="wParam">指定附加的消息指定信息</param>
        /// <param name="lParam">指定附加的消息指定信息</param>
        /// <returns></returns>
        public static extern int SendMessage(IntPtr hWnd, int msg, int wParam, int lParam);
        public static extern IntPtr SendMessage(IntPtr hWnd, int msg, int wParam, IntPtr lParam);        
        public static extern void SendMessage(IntPtr hWnd, int msg, int wParam, ref RECT lParam);
        public static extern int SendMessage(IntPtr hWnd, int msg, int wParam, ref POINT lParam);       
        public static extern void SendMessage(IntPtr hWnd, int msg, int wParam, ref TBBUTTON lParam);        
        public static extern void SendMessage(IntPtr hWnd, int msg, int wParam, ref TBBUTTONINFO lParam);      
        public static extern int SendMessage(IntPtr hWnd, int msg, int wParam, ref REBARBANDINFO lParam);      
        public static extern void SendMessage(IntPtr hWnd, int msg, int wParam, ref TVITEM lParam);       
        public static extern void SendMessage(IntPtr hWnd, int msg, int wParam, ref LVITEM lParam);    
        public static extern void SendMessage(IntPtr hWnd, int msg, int wParam, ref HDITEM lParam);   
        public static extern void SendMessage(IntPtr hWnd, int msg, int wParam, ref HD_HITTESTINFO hti);  
        /// <summary>
        /// 该函数将一个消息放入（寄送）到与指定窗口创建的线程相联系消息队列里
        /// </summary>
        public static extern IntPtr PostMessage(IntPtr hWnd, int msg, int wParam, int lParam);
        public static extern IntPtr SetWindowsHookEx(int hookid, HookProc pfnhook, IntPtr hinst, int threadid);
 
        [DllImport("user32.dll", CharSet = CharSet.Auto, ExactSpelling = true)]
        public static extern bool UnhookWindowsHookEx(IntPtr hhook);
 
        [DllImport("user32.dll", CharSet = CharSet.Auto, ExactSpelling = true)]
        public static extern IntPtr CallNextHookEx(IntPtr hhook, int code, IntPtr wparam, IntPtr lparam);
        /// <summary>
        /// 该函数对指定的窗口设置键盘焦点。
        /// </summary>
        public static extern IntPtr SetFocus(IntPtr hWnd);
        /// <summary>
        /// 该函数在指定的矩形里写入格式化文本，根据指定的方法对文本格式化（扩展的制表符，字符对齐、折行等）。
        /// </summary>
        public extern static int DrawText(IntPtr hdc, string lpString, int nCount, ref RECT lpRect, int uFormat);
        /// <summary>
        /// 该函数改变指定子窗口的父窗口。
        /// </summary>
        public extern static IntPtr SetParent(IntPtr hChild, IntPtr hParent);
        /// <summary>
        /// 获取对话框中子窗口控件的句柄
        /// </summary>
        public extern static IntPtr GetDlgItem(IntPtr hDlg, int nControlID);
        /// <summary>
        /// 该函数获取窗口客户区的坐标。
        /// </summary>
        public extern static int GetClientRect(IntPtr hWnd, ref RECT rc);
        /// <summary>
        /// 该函数向指定的窗体添加一个矩形，然后窗口客户区域的这一部分将被重新绘制。
        /// </summary>
        public extern static int InvalidateRect(IntPtr hWnd, IntPtr rect, int bErase);
        /// <summary>
        /// 该函数产生对其他线程的控制，如果一个线程没有其他消息在其消息队列里。
        /// </summary>
        public static extern bool WaitMessage();
        /// <summary>
        /// 该函数为一个消息检查线程消息队列，并将该消息（如果存在）放于指定的结构。
        /// </summary>
        public static extern bool PeekMessage(ref MSG msg, int hWnd, uint wFilterMin, uint wFilterMax, uint wFlag);
        /// <summary>
        /// 该函数从调用线程的消息队列里取得一个消息并将其放于指定的结构。此函数可取得与指定窗口联系的消息和由PostThreadMesssge寄送的线程消息。此函数接收一定范围的消息值。
        /// </summary>
        public static extern bool GetMessage(ref MSG msg, int hWnd, uint wFilterMin, uint wFilterMax);
        /// <summary>
        /// 该函数将虚拟键消息转换为字符消息。
        /// </summary>
        public static extern bool TranslateMessage(ref MSG msg);
        /// <summary>
        /// 该函数调度一个消息给窗口程序。
        /// </summary>
        public static extern bool DispatchMessage(ref MSG msg);
        /// <summary>
        /// 该函数从一个与应用事例相关的可执行文件（EXE文件）中载入指定的光标资源.
        /// </summary>
        public static extern IntPtr LoadCursor(IntPtr hInstance, uint cursor);
        /// <summary>
        /// 该函数确定光标的形状。
        /// </summary>
        public static extern IntPtr SetCursor(IntPtr hCursor);
        /// <summary>
        /// 确定当前焦点位于哪个控件上。
        /// </summary>
        public static extern IntPtr GetFocus();
        /// <summary>
        /// 该函数从当前线程中的窗口释放鼠标捕获，并恢复通常的鼠标输入处理。捕获鼠标的窗口接收所有的鼠标输入（无论光标的位置在哪里），除非点击鼠标键时，光标热点在另一个线程的窗口中。
        /// </summary>
        public static extern bool ReleaseCapture();
        /// <summary>
        /// 准备指定的窗口来重绘并将绘画相关的信息放到一个PAINTSTRUCT结构中。
        /// </summary>
        public static extern IntPtr BeginPaint(IntPtr hWnd, ref PAINTSTRUCT ps);
        /// <summary>
        /// 标记指定窗口的绘画过程结束,每次调用BeginPaint函数之后被请求
        /// </summary>
        public static extern bool EndPaint(IntPtr hWnd, ref PAINTSTRUCT ps);
        /// <summary>
        /// 半透明窗体
        /// </summary>
        public static extern bool UpdateLayeredWindow(IntPtr hwnd, IntPtr hdcDst, ref POINT pptDst, ref SIZE psize, IntPtr hdcSrc, ref POINT pprSrc, Int32 crKey, ref BLENDFUNCTION pblend, Int32 dwFlags);
        /// <summary>
        /// 该函数返回指定窗口的边框矩形的尺寸。该尺寸以相对于屏幕坐标左上角的屏幕坐标给出。
        /// </summary>
        public static extern bool GetWindowRect(IntPtr hWnd, ref RECT rect);
        /// <summary>
        /// 该函数将指定点的用户坐标转换成屏幕坐标。
        /// </summary>
        public static extern bool ClientToScreen(IntPtr hWnd, ref POINT pt);
        /// <summary>
        /// 当在指定时间内鼠标指针离开或盘旋在一个窗口上时，此函数寄送消息。
        /// </summary>
        public static extern bool TrackMouseEvent(ref TRACKMOUSEEVENTS tme);
        /// <summary>
        /// 
        /// </summary>
        public static extern bool SetWindowRgn(IntPtr hWnd, IntPtr hRgn, bool redraw);
        /// <summary>
        /// 该函数检取指定虚拟键的状态。
        /// </summary>
        public static extern ushort GetKeyState(int virtKey);
        /// <summary>
        /// 该函数改变指定窗口的位置和尺寸。对于顶层窗口，位置和尺寸是相对于屏幕的左上角的：对于子窗口，位置和尺寸是相对于父窗口客户区的左上角坐标的。
        /// </summary>
        public static extern bool MoveWindow(IntPtr hWnd, int x, int y, int width, int height, bool repaint);
        /// <summary>
        /// 该函数获得指定窗口所属的类的类名。
        /// </summary>
        public static extern int GetClassName(IntPtr hWnd, out STRINGBUFFER ClassName, int nMaxCount);
        /// <summary>
        /// 该函数改变指定窗口的属性
        /// </summary>
        public static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);
        /// <summary>
        /// 该函数检索指定窗口客户区域或整个屏幕的显示设备上下文环境的句柄，在随后的GDI函数中可以使用该句柄在设备上下文环境中绘图。
        /// </summary>
        public static extern IntPtr GetDCEx(IntPtr hWnd, IntPtr hRegion, uint flags);
        /// <summary>
        /// 获取整个窗口（包括边框、滚动条、标题栏、菜单等）的设备场景 返回值 Long。
        /// </summary>
        public static extern IntPtr GetWindowDC(IntPtr hWnd);
        /// <summary>
        /// 该函数用指定的画刷填充矩形，此函数包括矩形的左上边界，但不包括矩形的右下边界。
        /// </summary>
        public static extern int FillRect(IntPtr hDC, ref RECT rect, IntPtr hBrush);
        /// <summary>
        /// 该函数返回指定窗口的显示状态以及被恢复的、最大化的和最小化的窗口位置。
        /// </summary>
        public static extern int GetWindowPlacement(IntPtr hWnd, ref WINDOWPLACEMENT wp);
        /// <summary>
        /// 该函数改变指定窗口的标题栏的文本内容
        /// </summary>
        public static extern int SetWindowText(IntPtr hWnd, string text);
        /// <summary>
        /// 该函数将指定窗口的标题条文本（如果存在）拷贝到一个缓存区内。如果指定的窗口是一个控制，则拷贝控制的文本。
        /// </summary>
        public static extern int GetWindowText(IntPtr hWnd, out STRINGBUFFER text, int maxCount);
        /// <summary>
        /// 用于得到被定义的系统数据或者系统配置信息.
        /// </summary>
        static public extern int GetSystemMetrics(int nIndex);
        /// <summary>
        /// 该函数设置滚动条参数，包括滚动位置的最大值和最小值，页面大小，滚动按钮的位置。
        /// </summary>
        static public extern int SetScrollInfo(IntPtr hwnd, int bar, ref SCROLLINFO si, int fRedraw);
        /// <summary>
        /// 该函数显示或隐藏所指定的滚动条。
        /// </summary>
        public static extern int ShowScrollBar(IntPtr hWnd, int bar, int show);
        /// <summary>
        /// 该函数可以激活一个或两个滚动条箭头或是使其失效。
        /// </summary>
        public static extern int EnableScrollBar(IntPtr hWnd, uint flags, uint arrows);
        /// <summary>
        /// 该函数将指定的窗口设置到Z序的顶部。
        /// </summary>
        public static extern int BringWindowToTop(IntPtr hWnd);
        /// <summary>
        /// 该函数滚动指定窗体客户区域的目录。
        /// </summary>
        static public extern int ScrollWindowEx(IntPtr hWnd, int dx, int dy,ref RECT rcScroll, ref RECT rcClip, IntPtr UpdateRegion, ref RECT rcInvalidated, uint flags);
        /// <summary>
        /// 该函数确定给定的窗口句柄是否识别一个已存在的窗口。
        /// </summary>
        public static extern int IsWindow(IntPtr hWnd);
        /// <summary>
        /// 该函数将256个虚拟键的状态拷贝到指定的缓冲区中。
        /// </summary>
        public static extern int GetKeyboardState(byte[] pbKeyState);
        /// <summary>
        /// 该函数将指定的虚拟键码和键盘状态翻译为相应的字符或字符串。该函数使用由给定的键盘布局句柄标识的物理键盘布局和输入语言来翻译代码。
        /// </summary>
        public static extern int ToAscii(int uVirtKey,int uScanCode, byte[] lpbKeyState, byte[] lpwTransKey,int fuState);
        #endregion
 
    }
```


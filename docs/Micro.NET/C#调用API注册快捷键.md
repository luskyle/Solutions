#### C#调用API注册快捷键

```csharp
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using System.Runtime.InteropServices;

namespace WindowsFormsApplication1
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            MessageBox.Show("使用快捷键启动按钮");
        }

        private void Form1_Load(object sender, EventArgs e)
        {
             //注册热键Ctrl+F12，这里的8879就是一个ID识别
          　　RegisterHotKey(this.Handle, 8879, 2, Keys.F12);
        }


        private void Form1_FormClosing(object sender, FormClosingEventArgs e)
        {
              //用来取消注册的热键
           　　UnregisterHotKey(this.Handle, 8879);
        }
 
        /// <summary>
        /// 注册热键
      　/// </summary>
        /// <param name="hWnd">为窗口句柄</param>
        /// <param name="id">注册的热键识别ID</param>
        /// <param name="control">组合键代码  Alt的值为1，Ctrl的值为2，Shift的值为4，Shift+Alt组合键为5
        ///  Shift+Alt+Ctrl组合键为7，Windows键的值为8
        /// </param>
        /// <param name="vk">按键枚举</param>
        /// <returns></returns>
        [DllImport("user32")]
        public static extern bool RegisterHotKey(IntPtr hWnd, int id, uint control, Keys vk);

        /// <summary>
        /// 取消注册的热键
        /// </summary>
        /// <param name="hWnd">窗口句柄</param>
        /// <param name="id">注册的热键id</param>
        /// <returns></returns>
        [DllImport("user32")]
        public static extern bool UnregisterHotKey(IntPtr hWnd, int id);

        // 响应热键
        protected override void WndProc(ref Message m)
        {
            switch (m.Msg)
            {
                case 0x0312:                               　　//这个是window消息定义的注册的热键消息     
                    if (m.WParam.ToString().Equals("8879"))   //如果是注册的那个热键     
                    {
                        // 执行button按钮
                        button1.PerformClick();
                    }
                    break;
            }
            base.WndProc(ref m);
        }
    }
}
```


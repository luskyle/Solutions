#### WPF自定义弹框的后台逻辑写法

```c#
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;

namespace UsrControl
{
    /// <summary>
    /// RxDialog.xaml 的交互逻辑
    /// </summary>
    public partial class RxDialog : Window
    {
        public RxDialog()
        {
            InitializeComponent();
        }

        public static RxDialogResult show(string msgInfo)
        {
            RxDialog rxDialog = new RxDialog();
            rxDialog.ShowInTaskbar = false;//不在任务栏中显示
            rxDialog.Topmost = true;//在所有窗体最前方显示，不管后面的窗体是哪个

            rxDialog.setInfo(msgInfo);
            rxDialog.ShowDialog();

            if (result==1)
                return RxDialogResult.no;
            else
                return RxDialogResult.yes;

        }

        private void setInfo(string msgInfo)
        {
            txtMsgInfo.Text = msgInfo;
        }

        private void Window_MouseDown(object sender, MouseButtonEventArgs e)
        {
            DragMove();
        }

        /// <summary>
        /// 保存点击的结果，点是时此值为0，否时为1
        /// </summary>
        private static int result = 0;

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            if ((sender as Button).Name=="no")
                result = 1;  
            else
                result = 0;

            Close();
            
        }
    }

    public enum RxDialogResult
    {
        yes=0,
        no=1
    }

}

```


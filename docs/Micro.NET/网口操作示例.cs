2018/12/20 网口操作示例

using Maticsoft.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace AirMonitorFHY.AirMonitorStation
{
    public class TcpClient
    {
        public delegate void dataReceive(string RecevieData, int ReceiveLength);   //消息处理委托     接收的数据、定义好的数据长度
        public event dataReceive DataReceived;

        string ReceiveData = "";
        int ReceiveLength = 0;
        string IpServer = "";
        string PortServer = "";
        public bool IsConnect = false;
        public TcpClient(string ip, string port)
        {
            IpServer = ip;
            PortServer = port;
        }
        Thread threadClient = null; // 创建用于接收服务端消息的 线程；  
        Socket sockClient = null;
        public Boolean ConnectServer()
        {
            try
            {
                string str = IpServer;
                IPAddress ip = IPAddress.Parse(str);
                IPEndPoint endPoint = new IPEndPoint(ip, int.Parse(PortServer));
                sockClient = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
                sockClient.Connect(endPoint);

            }
            catch (SocketException se)
            {
                IsConnect = false;
                //MessageBox.Show(se.Message);
                return IsConnect; 
            }
            IsConnect = true;
            threadClient = new Thread(RecMsg);
            threadClient.IsBackground = true;
            threadClient.Start();
            return true;
        }
        void RecMsg()
        {

            while (true)
            {
                // 定义一个2M的缓存区；  
                byte[] arrMsgRec = new byte[1024];
                // 将接受到的数据存入到输入  arrMsgRec中；  
                int length = -1;
                try
                {
                    length = sockClient.Receive(arrMsgRec); // 接收数据，并返回数据的长度；  
                }
                catch (SocketException se)
                {
                    IsConnect = false;
                    //MessageBox.Show("异常:" + se.Message);
                    return;
                }
                catch (Exception e)
                {
                    MessageBox.Show("异常：" + e.Message);
                    return;
                }
                if (arrMsgRec[0] == 0) // 表示接收到的是消息数据；
                {
                    try
                    {
                        ReceiveData = System.Text.Encoding.UTF8.GetString(arrMsgRec, 1, length - 1);// 将接收到的字节数据转化成字符串；
                        ReceiveLength = ReceiveData.Length;
                        Thread th = null;
                        th = new Thread(new ThreadStart(ProcessData));
                        th.Start();
                    }
                    catch (Exception ex)
                    {
                        //MessageBox.Show(ex.Message);
                        return;
                    }
                }
            }
        }

        // 发送消息；  
        public void SendMsg(string strMsg)
        {
            //strMsg = "PH";
            byte[] arrMsg = System.Text.Encoding.UTF8.GetBytes(strMsg);
            byte[] arrSendMsg = new byte[arrMsg.Length + 1];
            arrSendMsg[0] = 0; // 用来表示发送的是消息数据  
            Buffer.BlockCopy(arrMsg, 0, arrSendMsg, 1, arrMsg.Length);
            try
            {
                sockClient.Send(arrSendMsg); // 发送消息；  
            }
            catch (SocketException se)
            {
                Program.logfile.writeValue("客户端发送异常：" + se.Message);
            }
            //MessageBox.Show(strMsg);
        }
        void ProcessData()
        {
            if (DataReceived != null)
                DataReceived(ReceiveData, ReceiveLength);
        }
        public void StopConnect(object sender, EventArgs e)
        {
            if (IsConnect)
            {
                try
                {
                    sockClient.Close();
                    threadClient.Abort();
                }
                catch (Exception ex)
                {
                    MessageBox.Show(ex.Message);
                }
            }
        }
    }
}

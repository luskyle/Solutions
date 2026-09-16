2018/12/20 串口操作参考

using System;
using System.IO.Ports;
using System.Text;
using System.Threading;

namespace AirMonitorFHY.AirMonitorStation
{
    public class SerialPortOperator
    {
        ///封装串口操作类
        SerialPort sp = new SerialPort();
        public delegate void dataReceive(string receivedata, ProtocolReturnLength ReceivedataLength);   //消息处理委托     接收的数据、定义好的数据长度
        public event dataReceive DataReceived;
        /// <summary>
        /// 接收到的数据
        /// </summary>
        string m_ReceiveData;
        /// <summary>
        /// 数据长度
        /// </summary>
        public ProtocolReturnLength m_ReceivedataLength;
        /// <summary>
        /// 串口号 波特率实例化
        /// </summary>
        /// <param name="comPort">端口</param>
        /// <param name="comRate">波特率</param>
        public SerialPortOperator(string comPort, string comRate)
        {
            sp.PortName = comPort;
            sp.BaudRate = int.Parse(comRate);
            sp.Parity = Parity.None;
            sp.StopBits = StopBits.One;
            sp.DataReceived += new SerialDataReceivedEventHandler(sp_DataReceived);
        }
        bool _isopen = false;
        /// <summary>
        /// 串口开关状态
        /// </summary>
        public bool Isopen
        {
            get { return _isopen; }
            set { _isopen = value; }
        }
        /// <summary>
        /// 串口开启
        /// </summary>
        public void open()
        {
            if (!sp.IsOpen)
            {
                try
                {
                    sp.Open();
                    Isopen = true;
                }
                catch(Exception ex)
                {
                   
                    Isopen = false;
                    //throw;
                }
            }
        }
        /// <summary>
        /// 串口关闭
        /// </summary>
        public void close()
        {
            Isopen = false;
            if (sp.IsOpen)
            {
                sp.DiscardInBuffer();
                sp.DiscardOutBuffer();
                sp.Close();

            }
        }
        /// <summary>
        /// 发送数据 不带返回数据
        /// </summary>
        /// <param name="str"></param>
        public void sendHexOnly(string str)
        {
            if (!sp.IsOpen) return;
            sp.DiscardInBuffer();//收多少算多少.发之前清空,(如果有数据,就不要了).
            
            try
            {
                byte[] ByteFoo = HexStringToByteArray(str);
                sp.Write(ByteFoo, 0, ByteFoo.Length);
            }
            catch
            {
                //发送失败
            }
        }
        /// <summary>
        /// 发送数据 带返回数据
        /// </summary>
        /// <param name="str"></param>
        public void sendHex(string str, ProtocolReturnLength length)
        {
            if (!sp.IsOpen) return;
            sp.DiscardInBuffer();//收多少算多少.发之前清空,(如果有数据,就不要了).
            m_ReceivedataLength = length;
            try
            {
                byte[] ByteFoo = HexStringToByteArray(str);
                sp.Write(ByteFoo, 0, ByteFoo.Length);
            }
            catch
            {
                //发送失败
            }
        }
        /// <summary>
        /// 接收数据
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        void sp_DataReceived(object sender, SerialDataReceivedEventArgs e)
        {
            int bytes = 0;
            Thread.CurrentThread.Join(10);
            bytes = (int)m_ReceivedataLength;
            if (sp.BytesToRead < bytes) return;
            

            byte[] buffer = new byte[bytes];
            try
            {
                if (sp.IsOpen && Isopen)
                {

                    sp.Read(buffer, 0, bytes);

                    if (sp.IsOpen)
                        sp.DiscardInBuffer();
                    m_ReceiveData = ByteArrayToHexString(buffer);
                    m_ReceiveData = m_ReceiveData.Replace(" ", ""); //转换为字符串长度为m_ReceivedataLength*2
                                                                    //m_ReceivedataLength = m_ReceiveData.Length;
                    Thread th = null;
                    th = new Thread(new ThreadStart(ProcessData));
                    th.Start();

                }
            }
            catch (Exception ex)
            { }
        }

        void ProcessData()
        {
            if (DataReceived != null)
            {
                try
                {
                    DataReceived(m_ReceiveData, m_ReceivedataLength);
                }
                catch (Exception  ex)
                { }
             }
        }

        //HEX string转 byte[]
        public byte[] HexStringToByteArray(string s)
        {
            s = s.Replace(" ", "");
            byte[] buffer = new byte[s.Length / 2];
            for (int i = 0; i < s.Length; i += 2)
                buffer[i / 2] = (byte)Convert.ToByte(s.Substring(i, 2), 16);
            return buffer;
        }
        //byte[]转 HEXstring
        public string ByteArrayToHexString(byte[] data)
        {
            StringBuilder sb = new StringBuilder(data.Length * 3);
            foreach (byte b in data)
                sb.Append(Convert.ToString(b, 16).PadLeft(2, '0'));
            return sb.ToString().ToUpper();
        }
    }
}


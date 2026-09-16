#### C#判断打印机工作状态

```c#
        public static string GetPrinterStatus(string PrinterName)
        {
            int intValue = GetPrinterStatusInt(PrinterName);
            string strRet = string.Empty;
            switch (intValue)
            {
                case 0:
                    strRet = "准备就绪（Ready）";
                    break;
                case 0x00000200:
                    strRet = "忙(Busy）";
                    break;
                case 0x00400000:
                    strRet = "被打开（Printer Door Open）";
                    break;
                case 0x00000002:
                    strRet = "错误(Printer Error）";
                    break;
                case 0x0008000:
                    strRet = "初始化(Initializing）";
                    break;
                case 0x00000100:
                    strRet = "正在输入,输出（I/O Active）";
                    break;
                case 0x00000020:
                    strRet = "手工送纸（Manual Feed）";
                    break;
                case 0x00040000:
                    strRet = "无墨粉（No Toner）";
                    break;
                case 0x00001000:
                    strRet = "不可用（Not Available）";
                    break;
                case 0x00000080:
                    strRet = "脱机（Off Line）";
                    break;
                case 0x00200000:
                    strRet = "内存溢出（Out of Memory）";
                    break;
                case 0x00000800:
                    strRet = "输出口已满（Output Bin Full）";
                    break;
                case 0x00080000:
                    strRet = "当前页无法打印（Page Punt）";
                    break;
                case 0x00000008:
                    strRet = "塞纸（Paper Jam）";
                    break;
                case 0x00000010:
                    strRet = "打印纸用完（Paper Out）";
                    break;
                case 0x00000040:
                    strRet = "纸张问题（Page Problem）";
                    break;
                case 0x00000001:
                    strRet = "暂停（Paused）";
                    break;
                case 0x00000004:
                    strRet = "正在删除（Pending Deletion）";
                    break;
                case 0x00000400:
                    strRet = "正在打印（Printing）";
                    break;
                case 0x00004000:
                    strRet = "正在处理（Processing）";
                    break;
                case 0x00020000:
                    strRet = "墨粉不足（Toner Low）";
                    break;
                case 0x00100000:
                    strRet = "需要用户干预（User Intervention）";
                    break;
                case 0x20000000:
                    strRet = "等待（Waiting）";
                    break;
                case 0x00010000:
                    strRet = "热机中（Warming Up）";
                    break;
                default:
                    strRet = "未知状态（Unknown Status）";
                    break;
            }
            return strRet;
        }

        [DllImport("winspool.Drv", EntryPoint = "OpenPrinter", SetLastError = true,CharSet = CharSet.Unicode, ExactSpelling = false, CallingConvention = CallingConvention.StdCall),SuppressUnmanagedCodeSecurityAttribute()]
        internal static extern bool OpenPrinter([MarshalAs(UnmanagedType.LPTStr)] string printerName, out IntPtr phPrinter, ref structPrinterDefaults pd);

        [DllImport("winspool.Drv", EntryPoint = "GetPrinterA", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
        internal static extern bool GetPrinter(IntPtr hPrinter,int dwLevel,IntPtr pPrinter,int dwBuf,out int dwNeeded);

        [StructLayout(LayoutKind.Sequential)]
        internal struct PRINTER_INFO_2
        {
            public string pServerName;
            public string pPrinterName;
            public string pShareName;
            public string pPortName;
            public string pDriverName;
            public string pComment;
            public string pLocation;
            public IntPtr pDevMode;
            public string pSepFile;
            public string pPrintProcessor;
            public string pDatatype;
            public string pParameters;
            public IntPtr pSecurityDescriptor;
            public uint Attributes;
            public uint Priority;
            public uint DefaultPriority;
            public uint StartTime;
            public uint UntilTime;
            public uint Status;
            public uint cJobs;
            public uint AveragePPM;
        }
        [DllImport("winspool.Drv", EntryPoint = "ClosePrinter", SetLastError = true,CharSet = CharSet.Unicode, ExactSpelling = false,CallingConvention = CallingConvention.StdCall), SuppressUnmanagedCodeSecurityAttribute()]
        internal static extern bool ClosePrinter(IntPtr phPrinter);

        internal static int GetPrinterStatusInt(string PrinterName)
        {
            int intRet = 0;
            IntPtr hPrinter;
            structPrinterDefaults defaults = new structPrinterDefaults();

            if (OpenPrinter(PrinterName, out hPrinter, ref defaults))
            {
                int cbNeeded = 0;
                bool bolRet = GetPrinter(hPrinter, 2, IntPtr.Zero, 0, out cbNeeded);
                if (cbNeeded > 0)
                {
                    IntPtr pAddr = Marshal.AllocHGlobal((int)cbNeeded);
                    bolRet = GetPrinter(hPrinter, 2, pAddr, cbNeeded, out cbNeeded);
                    if (bolRet)
                    {
                        PRINTER_INFO_2 Info2 = new PRINTER_INFO_2();

                        Info2 = (PRINTER_INFO_2)Marshal.PtrToStructure(pAddr, typeof(PRINTER_INFO_2));

                        intRet = System.Convert.ToInt32(Info2.Status);
                    }
                    Marshal.FreeHGlobal(pAddr);
                }
                ClosePrinter(hPrinter);
            }

            return intRet;
        }

        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)]
        internal struct structPrinterDefaults
        {
            [MarshalAs(UnmanagedType.LPTStr)]
            public String pDatatype;
            public IntPtr pDevMode;
            [MarshalAs(UnmanagedType.I4)]
            public int DesiredAccess;
        };

        //状态枚举
        [FlagsAttribute]
        internal enum PrinterStatus
        {
            PRINTER_STATUS_BUSY = 0x00000200,
            PRINTER_STATUS_DOOR_OPEN = 0x00400000,
            PRINTER_STATUS_ERROR = 0x00000002,
            PRINTER_STATUS_INITIALIZING = 0x00008000,
            PRINTER_STATUS_IO_ACTIVE = 0x00000100,
            PRINTER_STATUS_MANUAL_FEED = 0x00000020,
            PRINTER_STATUS_NO_TONER = 0x00040000,
            PRINTER_STATUS_NOT_AVAILABLE = 0x00001000,
            PRINTER_STATUS_OFFLINE = 0x00000080,
            PRINTER_STATUS_OUT_OF_MEMORY = 0x00200000,
            PRINTER_STATUS_OUTPUT_BIN_FULL = 0x00000800,
            PRINTER_STATUS_PAGE_PUNT = 0x00080000,
            PRINTER_STATUS_PAPER_JAM = 0x00000008,
            PRINTER_STATUS_PAPER_OUT = 0x00000010,
            PRINTER_STATUS_PAPER_PROBLEM = 0x00000040,
            PRINTER_STATUS_PAUSED = 0x00000001,
            PRINTER_STATUS_PENDING_DELETION = 0x00000004,
            PRINTER_STATUS_PRINTING = 0x00000400,
            PRINTER_STATUS_PROCESSING = 0x00004000,
            PRINTER_STATUS_TONER_LOW = 0x00020000,
            PRINTER_STATUS_USER_INTERVENTION = 0x00100000,
            PRINTER_STATUS_WAITING = 0x20000000,
            PRINTER_STATUS_WARMING_UP = 0x00010000
        }

```

或

```c#
    // 打印机状态集合
    public enum enum_printerSys_status
    {
        /// <summary>
        /// 其他状态
        /// </summary>
        other = 1,

        /// <summary>
        /// 未知
        /// </summary>
        unknown,

        /// <summary>
        /// 空闲
        /// </summary>
        free,

        /// <summary>
        /// 正在打印
        /// </summary>
        print,

        /// <summary>
        /// 预热
        /// </summary>
        warmup,

        /// <summary>
        /// 停止打印
        /// </summary>
        stop,

        /// <summary>
        /// 打印中
        /// </summary>
        printing,

        /// <summary>
        /// 离线
        /// </summary>
        offline,

    }

    public class PrinterSys : Printer
    {
        public PrinterSys(string name): base(name)
        {

        }

        /// <summary>
        /// 获取打印机状态
        /// </summary>
        /// <returns></returns>
        public enum_printerSys_status getStatus()
        {
            return (enum_printerSys_status)base.getStatus();
        }
    }

    public class Printer
    {
        /// <summary>
        /// 构造函数
        /// </summary>
        /// <param name="name">打印机名称</param>
        public Printer(string name)
        {
            this.printer_name = name;
        }

        // 设备名：EPSON R330 Series
        private string _printer_name;

        /// <summary>
        /// 打印机名称
        /// </summary>

        public string printer_name
        {
            get
            {
                return _printer_name;
            }

            set
            {
                _printer_name = value;
            }
        }



        /// <summary>
        /// 获取打印机状态
        /// </summary>
        /// <returns></returns>
        public int getStatus()
        {
            string path = @"win32_printer.DeviceId='" + this.printer_name + "'";

            ManagementObject printer = new ManagementObject(path);

            printer.Get();

            return Convert.ToInt32(printer.Properties["PrinterStatus"].Value);
        }
    }

```


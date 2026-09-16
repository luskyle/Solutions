# 产线集成：PLC 地址表、打印机、Access 与部署权限

!!! note "状态"
    已定稿（2026-09-16）。

上位机软件和产线的结合部，是"看起来简单、现场最致命"的地方：IO 点几十上百个、标签打印机说卡就卡、数据库装完就不能写、IIS 报错一行字能让人排查半天。本文按五类场景整理，每类都给出现场现象、根因和可直接抄的代码——这些坑都是真在产线上踩过的。

## 一、PLC 地址表：把 IO 点从代码里请出来

### 场景

真空腔体类设备（氧浓度、氮气流量、蝶阀、闸阀、气缸、玻璃真空度）有几十个 IO 点。如果把地址写死在代码里：`WriteFloat(DB5, 14, value)` 这种表达式堆成山，改一个点是全局改，电气改地址软件就炸，加班全耗在对表上。

### 方案：一张 XML 地址表，当作"设备与软件的契约"

以 `ChamberPLCAddr.xml` 为例（节选）：

```xml
<PLCOperationConfig>
  <OperateList>
    <OperateItem ItemName="Initialize"               Addr="M50.5"  Direction="Write" DataType="Bool"  ByteCount="1" />
    <OperateItem ItemName="OxygenContentSetpoint"    Addr="DB5.14"  Direction="Write" DataType="Float" ByteCount="4" />
    <OperateItem ItemName="ButterflyValveOpenValueSetpoint" Addr="DB5.18" Direction="Write" DataType="Float" ByteCount="4" />
    <OperateItem ItemName="SlitValveCommand"         Addr="M50.0"   Direction="Write" DataType="Bool"  ByteCount="2" />
    <OperateItem ItemName="ChamberAtmosphereCtrlCommand"   Addr="M50.1"   Direction="Write" DataType="Bool"  ByteCount="1" />
    <OperateItem ItemName="GetSlitValveState"        Addr="DB5.0"   Direction="Read"  DataType="Float" ByteCount="1" />
    <OperateItem ItemName="GetOxygenContent"         Addr="DB5.10"  Direction="Read"  DataType="Float" ByteCount="4" />
    <OperateItem ItemName="GetGlassVacuumDegree"     Addr="DB5.46"  Direction="Read"  DataType="Float" ByteCount="4" />
    <OperateItem ItemName="GetButterflyValveOpenValue"      Addr="DB5.66"  Direction="Read"  DataType="Float" ByteCount="4" />
    <OperateItem ItemName="HorCylinderExtendCommand" Addr="M103.0"  Direction="Write" DataType="Bool"  ByteCount="1" />
    <OperateItem ItemName="HorCylinderRetractCommand"        Addr="M103.1"  Direction="Write" DataType="Bool"  ByteCount="1" />
  </OperateList>
</PLCOperationConfig>
```

六个字段自解释，电气和软件各读各的：

| 字段 | 含义 | 谁负责 |
| --- | --- | --- |
| ItemName | 软件侧唯一标识（变量名） | 软件 |
| Addr | PLC 地址（M 区布尔位 / DB 区字） | 电气 |
| Direction | Read / Write：软件读还是写 | 双方 |
| DataType | Bool / Float：组包解包的依据 | 双方 |
| ByteCount | 字节数 | 电气 |
| MinValue / MaxValue | 量程，读取后校验用 | 电气 |

### 读取参考实现

用 `XmlDocument` 加载成字典，业务代码只认 `ItemName`：

```csharp
public class OperateItem
{
    public string ItemName  { get; set; }
    public string Addr      { get; set; }
    public string Direction { get; set; }
    public string DataType  { get; set; }
    public int    ByteCount { get; set; }
    public double MinValue  { get; set; }
    public double MaxValue  { get; set; }
}

public class PlcAddressTable
{
    private readonly Dictionary<string, OperateItem> _items;

    public PlcAddressTable(string xmlPath)
    {
        var doc = new XmlDocument();
        doc.Load(xmlPath);
        _items = new Dictionary<string, OperateItem>();
        foreach (XmlNode node in doc.SelectNodes("//OperateItem"))
        {
            var item = new OperateItem
            {
                ItemName  = node.Attributes["ItemName"].Value,
                Addr      = node.Attributes["Addr"].Value,
                Direction = node.Attributes["Direction"].Value,
                DataType  = node.Attributes["DataType"].Value,
                ByteCount = int.Parse(node.Attributes["ByteCount"].Value),
                MinValue  = double.Parse(node.Attributes["MinValue"].Value),
                MaxValue  = double.Parse(node.Attributes["MaxValue"].Value)
            };
            _items[item.ItemName] = item;
        }
    }

    public OperateItem this[string itemName] => _items[itemName];
}
```

> 注：这是按表结构补的参考实现，原笔记只有表本身。用 `XDocument` 写也行，团队统一一种即可。地址表放程序目录 `Config/` 随包分发，改地址不用重新编译。

### 值得注意的细节

- **布尔读状态用 Float 读**：`GetSlitValveState`（DB5.0）是 `Read + Float + ByteCount=1`。西门子系 PLC 的 Bool 在 DB 里也占字节，用 Float 类型去读"一个字节的布尔块"是现场常见做法——别看到 Bool 就以为读 1 bit。
- **同一地址多个 ItemName**：`DB18.0` 同时是 `GetCylinderState` 和 `GetAllBooleanState2`——一个物理块、两个语义视图，读一次拆两用。
- **ByteCount 和 DataType 不一致**：`SlitValveCommand` 是 `Bool` 却 `ByteCount=2`。写驱动时字长必须从表里来，不能从 DataType 猜。

> 现场背景：设备为真空腔体，PLC 是西门子系的，M 区布尔位 + DB 区状态字的结构与 S7 系列一致。地址表随程序包分发，改地址不用重新编译。

### 坑

1. **出问题的第一怀疑对象永远是地址表对不上**。增删改点必须双端同步，否则读回来的是旧布局的残值，表现成"参数写不进去""状态显示错乱"。
2. **读回来的值要过 MinValue/MaxValue 校验**。设备重启/断气后寄存器里的脏数据比想象中多，不过滤直接显示在界面上，会被操作员当软件 bug 报。
3. 地址表是双端契约，字段注释比代码注释重要——电气看不懂的字段名，迟早变成联调时的电话。

## 二、判断打印机工作状态

### 场景

产线标签打印机卡纸、缺纸、脱机，操作员不知道，标签错打/漏打半天才发现，返工成本全算在软件头上。需要在界面上实时显示打印机状态。

### 方案 A：winspool P/Invoke，拿全量状态标志位

`winspool.Drv` 的 `GetPrinter` 取 `PRINTER_INFO_2.Status`，是 32 位标志位组合，能区分"脱机""纸用完""卡纸""墨粉不足"等 20 多种状态。完整代码（原笔记，可直接抄）：

```csharp
[Flags]
internal enum PrinterStatus
{
    PRINTER_STATUS_BUSY              = 0x00000200,
    PRINTER_STATUS_DOOR_OPEN         = 0x00400000,
    PRINTER_STATUS_ERROR             = 0x00000002,
    PRINTER_STATUS_INITIALIZING      = 0x00008000,
    PRINTER_STATUS_IO_ACTIVE         = 0x00000100,
    PRINTER_STATUS_MANUAL_FEED       = 0x00000020,
    PRINTER_STATUS_NO_TONER          = 0x00040000,
    PRINTER_STATUS_NOT_AVAILABLE     = 0x00001000,
    PRINTER_STATUS_OFFLINE           = 0x00000080,
    PRINTER_STATUS_OUT_OF_MEMORY     = 0x00200000,
    PRINTER_STATUS_OUTPUT_BIN_FULL   = 0x00000800,
    PRINTER_STATUS_PAGE_PUNT         = 0x00080000,
    PRINTER_STATUS_PAPER_JAM         = 0x00000008,
    PRINTER_STATUS_PAPER_OUT         = 0x00000010,
    PRINTER_STATUS_PAPER_PROBLEM     = 0x00000040,
    PRINTER_STATUS_PAUSED            = 0x00000001,
    PRINTER_STATUS_PENDING_DELETION  = 0x00000004,
    PRINTER_STATUS_PRINTING          = 0x00000400,
    PRINTER_STATUS_PROCESSING        = 0x00004000,
    PRINTER_STATUS_TONER_LOW         = 0x00020000,
    PRINTER_STATUS_USER_INTERVENTION = 0x00100000,
    PRINTER_STATUS_WAITING           = 0x20000000,
    PRINTER_STATUS_WARMING_UP        = 0x00010000
}

public static string GetPrinterStatus(string PrinterName)
{
    return GetPrinterStatus(GetPrinterStatusInt(PrinterName));
}

// Status 是位标志组合（"忙 + 纸用完"会同时置位），
// 按优先级从严重到轻微逐位判断；原笔记的 switch 单值写法会漏判。
public static string GetPrinterStatus(int status)
{
    if (status == 0) return "准备就绪（Ready）";
    if ((status & (int)PrinterStatus.PRINTER_STATUS_PAPER_JAM) != 0) return "塞纸（Paper Jam）";
    if ((status & (int)PrinterStatus.PRINTER_STATUS_PAPER_OUT) != 0) return "打印纸用完（Paper Out）";
    if ((status & (int)PrinterStatus.PRINTER_STATUS_OFFLINE) != 0) return "脱机（Off Line）";
    if ((status & (int)PrinterStatus.PRINTER_STATUS_ERROR) != 0) return "错误（Printer Error）";
    if ((status & (int)PrinterStatus.PRINTER_STATUS_NO_TONER) != 0) return "无墨粉（No Toner）";
    if ((status & (int)PrinterStatus.PRINTER_STATUS_TONER_LOW) != 0) return "墨粉不足（Toner Low）";
    if ((status & (int)PrinterStatus.PRINTER_STATUS_DOOR_OPEN) != 0) return "被打开（Printer Door Open）";
    if ((status & (int)PrinterStatus.PRINTER_STATUS_PAPER_PROBLEM) != 0) return "纸张问题（Page Problem）";
    if ((status & (int)PrinterStatus.PRINTER_STATUS_OUTPUT_BIN_FULL) != 0) return "输出口已满（Output Bin Full）";
    if ((status & (int)PrinterStatus.PRINTER_STATUS_OUT_OF_MEMORY) != 0) return "内存溢出（Out of Memory）";
    if ((status & (int)PrinterStatus.PRINTER_STATUS_USER_INTERVENTION) != 0) return "需要用户干预（User Intervention）";
    if ((status & (int)PrinterStatus.PRINTER_STATUS_MANUAL_FEED) != 0) return "手工送纸（Manual Feed）";
    if ((status & (int)PrinterStatus.PRINTER_STATUS_NOT_AVAILABLE) != 0) return "不可用（Not Available）";
    if ((status & (int)PrinterStatus.PRINTER_STATUS_INITIALIZING) != 0) return "初始化（Initializing）";
    if ((status & (int)PrinterStatus.PRINTER_STATUS_WARMING_UP) != 0) return "热机中（Warming Up）";
    if ((status & (int)PrinterStatus.PRINTER_STATUS_BUSY) != 0) return "忙（Busy）";
    if ((status & (int)PrinterStatus.PRINTER_STATUS_PRINTING) != 0) return "正在打印（Printing）";
    if ((status & (int)PrinterStatus.PRINTER_STATUS_PROCESSING) != 0) return "正在处理（Processing）";
    if ((status & (int)PrinterStatus.PRINTER_STATUS_IO_ACTIVE) != 0) return "正在输入、输出（I/O Active）";
    if ((status & (int)PrinterStatus.PRINTER_STATUS_PAUSED) != 0) return "暂停（Paused）";
    if ((status & (int)PrinterStatus.PRINTER_STATUS_WAITING) != 0) return "等待（Waiting）";
    if ((status & (int)PrinterStatus.PRINTER_STATUS_PENDING_DELETION) != 0) return "正在删除（Pending Deletion）";
    if ((status & (int)PrinterStatus.PRINTER_STATUS_PAGE_PUNT) != 0) return "当前页无法打印（Page Punt）";
    return "未知状态（Unknown Status）";
}

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
                intRet = Convert.ToInt32(Info2.Status);
            }
            Marshal.FreeHGlobal(pAddr);
        }
        ClosePrinter(hPrinter);
    }
    return intRet;
}

[DllImport("winspool.Drv", EntryPoint = "OpenPrinter", SetLastError = true, CharSet = CharSet.Unicode,
    ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
internal static extern bool OpenPrinter([MarshalAs(UnmanagedType.LPTStr)] string printerName,
    out IntPtr phPrinter, ref structPrinterDefaults pd);

[DllImport("winspool.Drv", EntryPoint = "GetPrinterA", SetLastError = true, ExactSpelling = true,
    CallingConvention = CallingConvention.StdCall)]
internal static extern bool GetPrinter(IntPtr hPrinter, int dwLevel, IntPtr pPrinter, int dwBuf, out int dwNeeded);

[DllImport("winspool.Drv", EntryPoint = "ClosePrinter", SetLastError = true, CharSet = CharSet.Unicode,
    ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
internal static extern bool ClosePrinter(IntPtr phPrinter);

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

[StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)]
internal struct structPrinterDefaults
{
    [MarshalAs(UnmanagedType.LPTStr)] public string pDatatype;
    public IntPtr pDevMode;
    [MarshalAs(UnmanagedType.I4)] public int DesiredAccess;
}
```

状态标志位速查（`PRINTER_STATUS_*`）：

| 值 | 含义 | 值 | 含义 |
| --- | --- | --- | --- |
| 0x00000001 | 暂停 | 0x00000400 | 正在打印 |
| 0x00000002 | 错误 | 0x00000800 | 输出口已满 |
| 0x00000004 | 正在删除 | 0x00001000 | 不可用 |
| 0x00000008 | 塞纸 | 0x00004000 | 正在处理 |
| 0x00000010 | 打印纸用完 | 0x00008000 | 初始化 |
| 0x00000020 | 手工送纸 | 0x00010000 | 热机中 |
| 0x00000040 | 纸张问题 | 0x00020000 | 墨粉不足 |
| 0x00000080 | 脱机 | 0x00040000 | 无墨粉 |
| 0x00000100 | 输入输出中 | 0x00080000 | 当前页无法打印 |
| 0x00000200 | 忙 | 0x00100000 | 需要用户干预 |
| 0x00200000 | 内存溢出 | 0x00400000 | 门被打开 |
| 0x20000000 | 等待 | | |

### 方案 B：WMI，三行搞定（备选）

```csharp
ManagementObject printer = new ManagementObject(@"win32_printer.DeviceId='EPSON R330 Series'");
printer.Get();
int status = Convert.ToInt32(printer.Properties["PrinterStatus"].Value);
```

WMI 的 `PrinterStatus` 是 1~7 的简化枚举（空闲/打印/预热/停止/离线等），信息粒度不如标志位细，但胜在代码量小。

### 坑

1. **Status 是标志位组合，不是单一值**。"忙且纸用完"时两个位一起置上，`switch` 单值判断会漏判。要展示就给"最严重的那位"排优先级，要报警就按位与。
2. **状态要在打印任务下发前查**。错误标签打出来才报警已经晚了——标签错贴到产品上的返工成本，永远大于多查一次状态。
3. 轮询别太频繁，Spooler 忙时 `OpenPrinter` 会慢；丢到后台线程，别卡界面。

> 现场背景：产线标签打印机为 Epson 机型（原笔记中即有 EPSON R330 Series 的实例）。

## 三、Access 数据库随包分发：现场最经典的两个错误

### 场景

单机上位机用 Access 存工艺/记录数据，`mdb` 随安装包分发到每台工位机，改表操作时报错。

### 错误一："操作必须使用一个可更新的查询"

**根因**：数据库文件本身没有写权限。Jet 引擎更新数据需要可写的 mdb 文件；文件只读时，读没问题，一写就报这个。

**解法**：找到 mdb 文件 → 右键 → 安全 → 给当前运行账号加"写入"权限。

### 错误二："不能使用''；文件已在使用中"

**根因**：整个安装目录不可写，Jet 无法创建 `.ldb` 锁文件。文件权限解决了，锁文件创建不了照样报。

**解法**：对整个安装目录开放写权限。

> 一句话区分：**只读数据看文件权限，要写就看目录权限。**

### 连接与读取（原笔记代码，改为 using 写法）

```csharp
string strcon = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=user.mdb;";
using (OleDbConnection mycon = new OleDbConnection(strcon))
{
    mycon.Open();
    string sql = "SELECT * FROM UserInfor";
    using (OleDbCommand mycom = new OleDbCommand(sql, mycon))
    using (OleDbDataReader myReader = mycom.ExecuteReader())
    {
        while (myReader.Read())
        {
            // myReader.GetString(0) + " " + myReader.GetString(1)
        }
    }
}
```

### 坑

1. **Jet 4.0 驱动只有 32 位**。64 位进程连 mdb 直接报"未找到 Jet 引擎"；要么平台目标改 x86，要么换 ACE 驱动改连接串。
2. **更根本的解法是别把数据装进 Program Files**。数据目录从一开始就规划到 ProgramData 或工位本地路径，随包分发只放空模板。权限是应急手段，路径规划才是设计。
3. **mdb 单文件锁**：多进程共享一个 mdb 会互踢（第二个错误的另一种形态）。需要并发就换 SQL Server Compact/本地库，别跟 Jet 死磕。

> 这两个错误是 Jet 引擎在只读位置部署时的经典问题，与具体业务无关——只要 mdb 落在只读目录，插入 / 更新 / 删除必报其一。

## 四、IIS 部署："写不进 framework 临时目录"其实不是权限问题

### 现象

WebService 布到 IIS，浏览器打开 `localhost/service.asmx` 报"无法写入 framework 目录下的临时文件夹下的某 dll"。

### 根因

网上几乎一面倒说是权限问题，实际不是。ASP.NET 临时编译是把 dll 写进 framework 的临时目录，用的是**应用程序池进程的身份**；默认的 `ApplicationPoolIdentity` 在这个场景下写不进去。

### 解法（原笔记两步）

1. 应用程序池 → 高级设置 → **标识 → 改为 localSystem**
2. 网站 → 基本设置，允许通过用户凭据访问网站项目目录

排查顺序很重要：**先查池标识，再查 NTFS 权限**。顺序反了，会被网上"改目录权限"的话术带进一小时的权限泥潭。

> 后续 IIS 版本升级后，该问题没有再复现过。

## 五、装 C 盘的程序要写文件：ClickOnce 的"作弊"用法

### 场景

程序装在 C 盘默认路径，运行时要有写文件操作，普通权限会失败。

### 解法（原笔记的巧妙流程）

用 Visual Studio 生成 manifest，再关掉开关：

1. 项目 → 属性 → 安全性 → **启用 ClickOnce 安全设置**
2. 打开项目里的 `app.manifest`，按注释说明修改 `requestedExecutionLevel`
3. 返回属性页，把"启用 ClickOnce 安全设置"**勾掉**
4. 重新生成项目 —— manifest 保留，权限生效

`app.manifest` 里关键的一行（原笔记未贴出内容，这是标准写法）：

```xml
<requestedExecutionLevel level="asInvoker" uiAccess="false" />
```

两个取值要分清：

| level | 效果 | 适用 |
| --- | --- | --- |
| asInvoker | 以启动者权限运行，不弹 UAC | 产线普通账号，写数据目录 |
| requireAdministrator | 每次启动弹 UAC，可写 C 盘 | 安装、配置类工具，慎用于产线客户端 |

### 坑

- manifest 不要手搓，用 VS 生成再改最稳，格式错误会导致启动失败。
- 这解决的是"运行时提权"，和"安装时提权"是两件事：安装包（inno setup）请求的权限是装的时候的，程序自己写的权限是跑的时候的。
- 产线客户端首选"数据目录独立 + 当前用户可写"，manifest 是兜底不是设计——操作员环境天天弹 UAC 会被骂的。

## 结语

五个问题五种根因：地址表是**契约**、打印机靠**标志位**、Access 卡在**权限**、IIS 卡在**池标识**、C 盘卡在**manifest**。共同点只有一个——**先分清什么才是权限问题，什么只是看起来像权限问题**。排查顺序对了，产线现场的夜班就少一半。

## 参考资料（本站素材）

- [ChamberPLCAddr.xml（完整 PLC 地址表）](../Micro.NET/xsl%20通过%20IE%20看%20XML%20文件/ChamberPLCAddr.xml)
- [C#判断打印机工作状态](../Micro.NET/C%23判断打印机工作状态.md)
- [C#Winform连接并访问Access数据库](../Micro.NET/C%23Winform连接并访问Access数据库.md)
- [C#项目中引入Access数据库生成安装包安装后权限问题](../Micro.NET/C%23项目中引入Access数据库生成安装包安装后权限问题.md)
- [IIS配置无法写入framework路径下的临时文件夹下的某dll](../Micro.NET/IIS配置无法写入framework路径下的临时文件夹下的某dll.md)
- [C#项目获取安装目标机C盘权限](../Micro.NET/C%23项目获取安装目标机C盘权限.md)
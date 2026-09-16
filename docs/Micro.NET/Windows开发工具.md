### 针对托管 (.NET) 开发人员的工具

| 工具                | 说明                                                         |
| ------------------- | ------------------------------------------------------------ |
| AL.exe              | *程序集链接器。* 程序集链接器从一个或多个文件（可以是模块，也可以是资源文件）生成一个具有程序集清单的文件。 模块是不含程序集清单的 Microsoft 中间语言 (MSIL) 文件。 |
| ASPNet_merge.exe    | *ASP.NET 合并工具。* ASP.NET 合并工具 (Aspnet_merge.exe) 允许您合并和管理由 ASP.NET 编译工具 (Aspnet_compiler.exe) 创建的程序集。 ASP.NET 合并工具可以处理使用 ASP.NET 2.0 版或更高版本创建的程序集。 |
| AxImp.exe           | *Windows 窗体 ActiveX 控件导入程序*。 将 COM 类型库中 ActiveX 控件的类型定义转换成 Windows 窗体控件。 |
| ClrVer.exe          | *CLR 版本检测技术示例。* 显示当前系统上已安装的所有版本的 .NET Framework。 |
| CorFlags.exe        | *CorFlags 转换工具。* 转换工具允许您配置可迁移可执行映像标头的 Flags 部分。 |
| Disco.exe           | *Web 服务发现工具。* 发现位于 Web 服务器上的 XML Web services 的 URL，并将与每个 XML Web services 相关的文档保存到本地磁盘上。 |
| FusLogVw.exe        | *程序集绑定日志查看器。* 从公共语言运行时查看程序集绑定消息。 允许以交互方式探究公共语言运行时的程序集绑定决策，并帮助确定程序集绑定错误的根源。 |
| FXCopSetup.exe      | *FXCop 工具。* FxCop 是一个应用程序，可用于分析托管代码程序集并报告有关程序集的信息，例如可能的设计、本地化、性能和安全改进。 |
| GacUtil.exe         | *全局程序集缓存工具。* 可用于查看和操作全局程序集缓存和下载缓存的内容。 |
| ildasm.exe          | *MSIL 反汇编程序。* 采用包含 MSIL 代码的 PE 文件，并创建适合的文本文件作为 MSIL 汇编程序（即 .NET Framework 附带的 ILAsm.exe）的输入。 |
| LC.exe              | *许可证编译器。* 读取包含授权信息的文本文件，并生成一个可嵌入到公共语言运行时可执行文件中的 .licenses 文件。 |
| Mage.exe            | *清单生成和编辑工具。* Mage.exe 是一个支持创建和编辑应用程序和部署清单的命令行工具。 |
| MageUI.exe          | *清单生成和编辑工具（图形化客户端）。* MageUI.exe 支持的功能与命令行工具 Mage.exe 支持的功能完全相同，但使用基于 Windows 窗体的用户界面 (UI)。 使用此工具，可以对部署清单和应用程序清单执行创建、编辑和签名操作。 |
| MDbg.exe            | .*NET Framework 命令行调试器*。 提供针对托管应用程序的命令行调试服务。 |
| MgmtClassGen.exe    | *管理强类型类生成器。* 可用于为指定的 Windows Management Instrumentation (WMI) 类快速生成早期绑定的托管类。 生成的类简化了为访问 WMI 类的实例所必须编写的代码。 |
| PEVerify.exe        | *PEVerify 工具。* 对指定的程序集执行 MSIL 类型安全验证检查和元数据验证检查。 |
| ResGen.exe          | *资源文件生成器。* 将文本文件和 .x（基于 XML 的资源格式）文件转换成 .NET 公共语言运行时 (CLR) 二进制 .resources 文件，这些 .resources 文件可嵌入到运行时二进制可执行文件中，或编译到附属程序集中。 |
| Sgen.exe            | *XML 序列化程序生成器。* 为指定程序集中的类型创建一个 XML 序列化程序集，以改进 XmlSerializer 在序列化或反序列化指定类型的对象时的启动性能。 |
| sn.exe              | *强名称工具。* 帮助创建具有强名称的程序集。Sn.exe 提供用于密钥管理、签名生成和签名验证的选项。 |
| SoapSuds.exe        | *Soapsuds 工具。* 使用一种称为“远程处理”的技术帮助您编译与 XML Web services 进行通信的客户端应用程序。 |
| SqlMetal.exe        | *代码生成工具。* SqlMetal.exe 可利用数据库表生成类和默认的类映射。 此工具可用于生成 C# 或 VB.NET 代码，还可以用于生成代码中的基于 .NET 特性的映射或 XML 文件中的单独映射。 |
| StoreAdm.exe        | *独立存储工具。* 为当前登录的用户列出或移除所有的现有存储区。 |
| SvcConfigEditor.exe | *配置编辑器工具。* 用于配置 WCF 服务和客户端应用程序。       |
| SvcTraceViewer.exe  | *服务跟踪查看器工具。* 用于查看和分析 WCF 跟踪数据和消息日志。 |
| SvcUtil.exe         | *服务模型元数据实用工具。* 使用此工具，既可从元数据文档生成服务模型代码，又可从服务模型代码生成元数据文档。 |
| TlbExp.exe          | *类型库导出程序。* 从公共语言运行时程序集生成类型库。        |
| TlbImp.exe          | *类型库导入程序。* 将 COM 类型库中发现的类型定义转换成托管元数据格式的等同定义。 |
| Wca.exe             | *Windows 工作流通信活动命令行实用工具。* 此实用工具用于从包含一个或多个 ExternalDataExchangeService 接口的输入程序集中为严格绑定的 HandleExternalEventActivity 活动和 CallExternalMethodActivity 活动派生类生成代码文件。 |
| Wfc.exe             | *Windows 工作流命令行编译器。* 此实用工具用于编译工作流和活动。 它采用工作流标记 (.xoml) 和 C# 或 Visual Basic 源文件，验证工作流或活动并生成程序集或可执行文件。 |
| Winres.exe          | *Windows 窗体资源编辑器。* 这是一个可视化布局工具，可以帮助本地化专家对窗体使用的 Windows 窗体用户界面 (UI) 资源进行本地化。 |
| Wsdl.exe            | *Web 服务描述语言工具。* 从 Web 服务描述语言 (WSDL) 协定文件、XML 架构定义 (XSD) 架构文件和 .comap 发现文档为 XML Web services 和 XML Web services 客户端生成代码。 |
| Xsd.exe             | *XML 架构定义工具。* 此工具可生成遵从万维网联合会 (W3C) 提出的 XSD 语言的 XML 架构。 此工具还可基于 XSD 架构文件生成公共语言运行时类和 aSetclass。 |
| Xsltc.exe           | *XSLT 编译器。* XSLT 编译器 (xsltc.exe) 可编译 XSLT 样式表并生成程序集。 然后将编译后的样式表直接传递到 XslCompiledTransform.Load(Type) 方法中。 |

### 针对本机 (Win32 API) 开发人员的工具

| 工具                        | 说明                                                         |
| --------------------------- | ------------------------------------------------------------ |
| BETest.exe                  | *VSS 备份和还原测试工具。*BETest 是测试高级备份和还原操作的 VSS 请求方。 |
| Checkv4.exe                 | *IPv6 兼容性检查工具。* 搜索文件中 IPv4 特定的代码并建议使代码成为 IPv6 兼容的代码所需进行的更改。 |
| CTRPP.exe                   | *计数器预处理器工具。* CTRPP 工具是一个用于分析并验证计数器清单的预处理器。 此工具还生成用于提供计数器数据的代码。 |
| Ecmangen.exe                | *ETW 清单生成工具。* 生成一个检测清单，此清单定义事件提供程序及其记录到 ETW 的事件。 |
| EspExe.exe                  | *TAPI 经济服务提供程序。* ESP（经济服务提供程序）是一个支持多重虚拟线路和电话设备的 TAPI 服务提供程序。 此提供程序是可以配置的，它不需要任何特殊硬件，并可实现整个电话服务提供程序接口。 |
| ExtidGen.exe                | *TAPI 扩展 ID 生成器。* 用于生成扩展标识符的 TAPI 工具。     |
| FDBrowser.exe               | *功能发现浏览器。*显示“功能发现”可发现的所有资源（如设备）。 |
| Genmanifest.exe             | *生成清单工具。*这是一个可用于生成清单的命令行工具。         |
| Graphedt.exe                | *多媒体筛选器图形编辑器。*Graphedt 是一个开发工具，可用于使用 DirectShow 应用程序编程接口以可视化方式生成有用的多媒体筛选器图形。 |
| MC.exe                      | *消息编译器。*创建应用程序或 DLL 所需的消息。                |
| Midl.exe Midlc.exe          | *MIDL 编译器。*处理 IDL 文件以生成类型库和输出文件。         |
| MuiRct.exe                  | *MUIRCT 工具。*一个实用工具，可用于将标准的 Win32 可移植可执行文件拆分为一个 LN 文件和一个 .mui 文件（此文件包含特定于语言的 Win32 资源）。 |
| PTConform.exe               | *PrintTicket 合规性测试。*PTConform 是一个合规性工具，用于检查 PrintCapabilities 和 PrintTicket 文档的有效性。 PTConform 会从语法和结构上检查给定的 PrintCapabilities 或 PrintTicket XML 文档是否遵从公共的打印架构定义。 |
| RC.Exe                      | *资源编译器。*一个实用工具，用于将资源定义脚本文件（扩展名为 .rc）编译成资源文件（扩展名为 .res）。 此工具可用于从一组资源生成一个 LN 文件和一个单独的 .mui 文件（此文件包含特定于语言的 Win32 资源）。 |
| sddlgen.exe                 | *SddlGen 工具。*从基于 GUI 的输入生成 SDDL 字符串。 分析给定 SDDL 字符串/访问掩码。 使用直观的 GUI 元素来显示它们。 |
| Sporder.exe                 | *协议重新排序工具。*允许在安装协议后以交互方式重新对已安装协议的目录进行排序。 |
| TB3x.exe                    | *TAPI 3.x 浏览器工具。*针对 TAPI 3.x 的测试工具。            |
| TraceFmt.exe                | *TraceFmt 工具。*设置来自事件跟踪日志文件或实时跟踪会话的跟踪消息的格式并显示这些消息。 |
| TracePdb.exe                | *TracePdb 工具。*通过从使用 WPP 软件跟踪宏的跟踪提供程序的完整或专用 PDB 符号文件中提取跟踪消息格式说明，创建跟踪消息格式 (.tmf) 文件。 |
| TraceWpp.exe                | *TraceWpp 工具。*对跟踪提供程序的源文件运行 Windows 软件跟踪预处理器 (WPP)。 |
| ValidateSD.exe              | *ValidateSD 工具。*验证文件是否包含有效的 UPnP 服务说明文档。 |
| VSDiagview.exe VSSAgent.exe | *VSS 诊断工具。*VSSAgent 收集一些数据，这些数据可通过 VSDiagview 进行查看，并可用于对 VSS 应用程序进行故障排除。 |
| Vshadow.exe                 | *VShadow 工具。*可用于创建和管理卷影副本的命令行工具。       |
| Vstorcontrol.exe            | *VSS 示例提供程序工具。*说明如何使用 VSS 接口创建 VSS 硬件提供程序。 |
| VSWriter.exe                | *VSS 测试编写器工具。*测试编写器是一个可用于测试 VSS 请求方应用程序的实用工具。 可将此编写器配置为执行 VSS 编写器可执行的几乎所有操作。 此外，测试编写器还可执行大量检查以确保请求方已正确处理这些编写器操作。 |
| WSTraceDump.exe             | *Web 服务跟踪转储工具。*帮助分析 Web 服务跟踪转储。          |
| WSUtil.exe                  | *Web 服务编译器工具。*此工具支持服务模型和数据类型的序列化。 它可处理 WSDL、XML 架构和策略文档并生成 C 头文件和源文件。 此工具与针对托管代码的 wsdl 编译器工具类似，只不过它面向的是本机代码，而不是托管代码。 |

### 针对托管 (.NET) 开发人员和本机 (Win32 API) 开发人员的常用工具

| 工具                                  | 说明                                                         |
| ------------------------------------- | ------------------------------------------------------------ |
| Apatch.exe                            | *修补应用程序实用工具。* Apatch.exe 实用工具用于应用二进制修补程序。 |
| Bind.exe                              | *Windows NT 映像活页夹。*通过跳过查找导出的 DLL 函数地址的操作来最大限度地减少加载时间 |
| Cert2Spc.exe                          | *软件发行者证书测试工具。* 软件发行者证书测试工具通过一个或多个 X.509 证书创建软件发行者证书 (SPC)。 |
| CertMgr.exe                           | *证书管理器工具。* 用于配置系统证书存储区的命令行和 GUI 工具。 |
| Consume.exe                           | *资源占用工具。* 可以占用各种资源（如内存、CPU 和磁盘空间）的测试工具。 |
| DeviceSimulatorForWindowsSideShow.msi | *针对 Windows SideShow 的设备模拟器。* 开发针对 Windows SideShow 的小工具的开发人员可以利用此模拟器，在不使用物理硬件的情况下测试其小工具。 |
| Guidgen.exe                           | *创建 GUID 工具。* 以指定格式生成 GUID。                     |
| isXPS.exe                             | *isXPS 合规性工具。* 测试文件是否符合 XML 纸张规范 (XPS) 和开放式打包约定 (OPC) 规范。 |
| MakeCat.Exe                           | *MakeCat 工具。* 用于生成 Authenticode 目录的命令行工具。    |
| MakeCert.exe                          | *证书创建工具。* 用于生成自签名证书和测试证书的命令行工具。  |
| Make-Shell.exe                        | *Make-Shell 工具。* Windows PowerShell 提供了一个用于创建不可扩展的控制台 Shell 的工具。 以后无法通过 Windows PowerShell 管理单元来扩展使用此新工具创建的 Shell。 |
| MSICert.exe                           | *MSI 证书工具。* 一个命令行实用工具，可用于将外部压缩文件的数字签名信息填充到 MsiDigitalSignature 表和 MsiDigitalCertificate 表中。 |
| MSIDB.exe                             | *MSIDb 工具。* 使用 MsiDatabaseImport 和 MsiDatabaseExport 导入和导出数据库表和流。 |
| MSIFiler.exe                          | *MSIFiler 工具。* 基于源目录在文件表中填入文件版本、语言和大小。 此工具还可用文件哈希更新 MsiFileHash 表。 |
| MSIInfo.exe                           | *MSIInfo 工具。* 使用数据库函数和安装程序函数来编辑或显示数据库的摘要信息流。 |
| MSIMerg.exe                           | *MSIMerg 工具。* 使用 MsiDatabaseMerge 将引用数据库合并到基数据库中。 |
| MSIMsp.exe                            | *MSIMsp 工具。* Msimsp.exe 是一个调用 Patchwiz.dll 的可执行文件。 此工具可用于通过传入修补程序创建属性文件（.pcp 文件）的路径和要创建的修补程序包的路径来创建修补程序包。 |
| MSITran.exe                           | *MSITran 工具。* 使用 MsiDatabaseGenerateTransform、MsiCreateTransformSummaryInfo 和 MsiDatabaseApplyTransform 来生成或应用转换文件。 |
| MSIVal2.msi                           | *MSIVal2 工具。* Msival2 是一个命令行实用工具，可运行内部一致性计算器 (ICE) 套件。 |
| MSIZap.exe                            | *MSIZap 工具。* Msizap.exe 是一个命令行实用工具，可移除有关计算机上安装的一项产品或全部产品的所有 Windows Installer 信息。 |
| MT.exe                                | *清单工具。*生成签名文件和目录。                             |
| OleView.Exe                           | *OLE/COM 对象查看器。*可用于浏览、配置和测试已安装的 COM 类。 |
| Orca.msi                              | *Orca 安装程序。* Orca.exe 的安装程序，这是一个用于创建和编辑 Windows Installer 程序包和合并模块的数据库表编辑器。 |
| Pvk2Pfx.exe                           | *SPC/CER/PVK 到 PFX 的转换工具。* 用于将 PVK 文件转换为 PFX 文件的命令行工具。 |
| ReBase.Exe                            | *Rebase 工具。* 指定应用程序使用的 DLL 的基址。              |
| SetReg.exe                            | *SetReg 工具。* 设置用于控制 Authenticode 证书验证过程的注册表项的值。 这些注册表项称作“软件发布状态密钥”。 完成请求的操作后，此工具将显示软件发布状态密钥的当前状态。 |
| SignTool.exe                          | *签名工具。* 供 Authenticode 用来对应用程序签名、验证 Authenticode 签名和配置系统目录数据库的命令行工具。 |
| TcpAnalyzer.exe                       | *TCP 分析器。* 启用对各个 TCP/IP 连接的监控和诊断。 利用此工具，用户可以选择连接列表中的任何连接，并以图形化方式查看相应连接的发送速率、性能瓶颈、丢失情况、重新传输情况和各种其他详细的 TCP/IP 信息。 |
| UuidGen.exe                           | *UUID 生成器工具。* 此工具生成通用唯一标识符 (UUID)（也称作 GUID）。 |
| WiLogUtl.Exe                          | *Windows Installer 日志实用工具。* 此工具可帮助分析 Windows Installer 安装中的日志文件，并将显示针对日志文件中找到的错误的建议的解决方法。 |
| WinDiff.Exe                           | *WinDiff 工具。* 对文件进行比较并以图形化方式显示它们之间的任何差异。 |
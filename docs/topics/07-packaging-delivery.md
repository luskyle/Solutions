# 打包与交付

!!! note "状态"
    已定稿（2026-09-16）。

上位机软件的"最后一公里"。写好的程序装不上、装上跑不了、跑了没权限——任何一个都在产线现场变成一次失败的验收。这篇按"打安装包 → 系统依赖 → 权限 → 交付检查表"整理，全部是踩过的坑。

## 一、VS Setup Project 打包（2017 时代的经典流程）

原笔记流程（VS2017，思路通用）：

1. **装插件**：工具 → 扩展和更新 → 搜索安装 `Microsoft Visual Studio 2017 Installer` 系列；
2. **新建项目**：解决方案资源管理器 → 添加 → 新建项目 → 其他项目类型 → **Setup Project**；
3. 出现三个项：
   - 项 1 = **程序安装目录**内容设置；
   - 项 2 = **桌面**内容设置；
   - 项 3 = **开始菜单**内容设置；
4. 右键项 1 → Add → **项目输出**；还有附带文件（如 Access 数据库）就继续 Add → **文件**；
5. 右键 `主输出 from xxx(Active)` → **Create Shortcut** → 生成的快捷方式拖到项 2（桌面）；
6. 右键 Setup 项目 → **生成** → 得到 `setup.exe` + `Setup1.msi`。

要点就一个：**快捷方式、附带文件、输出分离成三块管理**。现代替代品是 MSIX/WiX，但用这个旧流程理解的"三块结构"依然是对的。

## 二、inno setup 调用 win32 dll

安装脚本里要注册/调用 Win32 dll（如 `user32.dll`）时，`[Files]` 段要这样写：

```ini
[Files]
Source: "user32.dll"; DestDir: "{sys}"; Flags: external allowunsafefiles;
```

两个 Flag 的含义（原笔记）：
- `external`：告诉 Inno 这是**外部文件**（不是打包进安装包的文件），只做声明；
- `allowunsafefiles`：允许引入"可能影响系统安全的文件"（Win32 API 文件被认为不安全），**不写这个 Flag 会直接报错**。

`{sys}` 代表 `C:\Windows\System32`。**坑**：64 位系统上 32 位安装程序访问 `{sys}` 会被重定向到 SysWOW64，注册 64 位 dll 要用 `{sysnative}` 或显式指向 System32。

## 三、ocx 注册 / 注销

ActiveX 控件（ocx）装完不进注册表就没法用。注册用 `regsvr32`：

```
regsvr32 C:\YourPath\MyControl.ocx
regsvr32 /u C:\YourPath\MyControl.ocx    # 注销
```

**坑**：
1. 需要管理员权限，否则报"模块已加载但对 DllRegisterServer 调用失败"（0x8002801C 之类）；
2. 64 位系统上 32 位 ocx 要用 32 位 `regsvr32`（`C:\Windows\SysWOW64\regsvr32.exe`），混了就报"不是有效的 Win32 应用程序"；
3. 静默部署：在 inno setup 的 `[Run]` 段或安装后脚本里执行 `regsvr32 /s`（静默模式），别让客户手动开命令行。

## 四、权限三件套（与《产线集成》互引）

装完能不能跑、跑了能不能写，是现场问题的大头——详见[产线集成](05-line-integration.md)的对应三节：

1. **装 C 盘要写文件** → `app.manifest` 配 `requestedExecutionLevel`（asInvoker / requireAdministrator 二选一）；
2. **Access 随包分发不能写** → mdb 文件/安装目录的写权限（"操作必须使用一个可更新的查询"、"文件已在使用中"两个经典报错）；
3. **更根本的**：数据目录从一开始就规划到 ProgramData/工位本地路径，别装进 Program Files 再补权限。

## 五、交付检查表

每次发版前对着走一遍，能拦下 90% 的现场问题：

| # | 检查项 | 失败的症状 |
| --- | --- | --- |
| 1 | 目标机 .NET Framework 版本 ≥ 程序要求 | 装完双击无反应 / 版本不匹配报错 |
| 2 | 32/64 位一致（程序位数、驱动、ocx、dll） | "不是有效的 Win32 应用程序"、DllNotFound |
| 3 | 安装需要管理员权限（inno 的 PrivilegesRequired） | 装到 Program Files 静默失败 |
| 4 | 数据目录可写 + 首启自动创建 | 写文件异常、程序闪退 |
| 5 | 快捷方式指向主输出、名称正确 | 客户找不到程序/打开的是旧版 |
| 6 | 依赖的 ocx/dll 注册完成（安装脚本内） | 运行期 COM 组件未注册 |
| 7 | 配置（数据库连接串、服务器地址）在哪、谁改 | 现场连不上库，排查半天 |
| 8 | 卸载是否干净（注册表、服务、数据目录） | 换版本装不上，残留冲突 |

## 结语

交付 = **打包 + 依赖 + 权限**三关。打包解决"装得上"，ocx/dll 解决"跑得起来"，权限解决"用得了"。最容易被忽视的是第 7 条：**配置位置**——程序写得再稳，客户连不上库时第一眼看的还是你。

## 参考资料（本站素材）

- [打包VS项目](../ETC/打包VS项目.md)
- [inno setup调用win32 dll文件](../ETC/inno%20setup调用win32%20dll文件.md)
- [注册ocx控件](../ETC/注册ocx控件.md)
- [C#项目获取安装目标机C盘权限](../Micro.NET/C%23项目获取安装目标机C盘权限.md)
- [C#项目中引入Access数据库生成安装包安装后权限问题](../Micro.NET/C%23项目中引入Access数据库生成安装包安装后权限问题.md)
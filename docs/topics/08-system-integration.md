# 系统集成小技巧：快捷键、U 盘、端口、注册表

!!! note "状态"
    已定稿（2026-09-16）。

上位机客户端离不开和 Windows 系统本身打交道：全屏时怎么快速调出面板、U 盘插上怎么自动响应、端口被占怎么快速揪出真凶、系统级配置存在哪。这套技巧的共同点是——**借系统现成的机制，不自己造轮子**。四件事，全部有代码、有坑。

## 一、全局快捷键：RegisterHotKey

### 场景

产线客户端经常全屏或无边框运行，界面上的按钮"看不见"。操作员要快速调出隐藏面板、呼叫帮助、切换工位——只能靠全局热键，程序没焦点也要能用。

### 原理

`RegisterHotKey` 让系统在指定组合键按下时，**无论焦点在哪**都向你的窗口发送 `WM_HOTKEY`（消息号 0x0312），在 `WndProc` 里拦截处理。

### 代码（原笔记整理：补了返回值检查、缩进规范化）

```csharp
public partial class MainForm : Form
{
    private const int WM_HOTKEY = 0x0312;
    private const int HOTKEY_ID = 8879;   // 热键标识，同一窗口内必须唯一

    protected override void OnLoad(EventArgs e)
    {
        base.OnLoad(e);
        // 注册 Ctrl + F12（fsModifiers：2 = Ctrl）
        if (!RegisterHotKey(this.Handle, HOTKEY_ID, 2, Keys.F12))
        {
            // 返回 false = 组合键已被其他程序占用
            MessageBox.Show("热键 Ctrl+F12 注册失败，可能已被其他程序占用。",
                "提示", MessageBoxButtons.OK, MessageBoxIcon.Warning);
        }
    }

    protected override void OnFormClosing(FormClosingEventArgs e)
    {
        UnregisterHotKey(this.Handle, HOTKEY_ID);   // 注销与注册必须成对
        base.OnFormClosing(e);
    }

    protected override void WndProc(ref Message m)
    {
        if (m.Msg == WM_HOTKEY && m.WParam.ToInt32() == HOTKEY_ID)
        {
            OnHotKeyPressed();
            return;                                  // 已处理，不必再走 base
        }
        base.WndProc(ref m);
    }

    private void OnHotKeyPressed()
    {
        btnHiddenPanel.PerformClick();               // 触发自己的动作
    }

    [DllImport("user32")]
    private static extern bool RegisterHotKey(IntPtr hWnd, int id, uint fsModifiers, Keys vk);

    [DllImport("user32")]
    private static extern bool UnregisterHotKey(IntPtr hWnd, int id);
}
```

`fsModifiers` 组合键速查（原笔记注释整理）：

| 值 | 组合键 | 值 | 组合键 |
| --- | --- | --- | --- |
| 1 | Alt | 5 | Shift + Alt |
| 2 | Ctrl | 7 | Shift + Alt + Ctrl |
| 4 | Shift | 8 | Win 键 |

### 坑

1. **`RegisterHotKey` 的返回值必须查**。false 意味着组合键已被占用（截图工具、QQ、输入法惯用的 Ctrl+Alt+ 系列最容易撞）。原笔记没查返回值，热键"不灵"时没有任何提示。
2. **注销与注册成对**。`FormClosing` 里 `UnregisterHotKey`；窗口还开着时用同一个 id 重复注册会失败。
3. **注册时机放在 Load 之后**（Handle 已就绪）。构造函数里访问 `this.Handle` 会强制提前建句柄，容易出问题。
4. `Ctrl+Alt+Del` 这类系统级组合键无法注册；多个热键用不同 id 区分。

## 二、USB 插拔检测：WM_DEVICECHANGE

### 场景

U 盘导工艺数据、拷日志、升级程序——插上自动弹窗或自动拷贝，拔出也要有提示，不能靠操作员手动点。

### 原理

系统广播 `WM_DEVICECHANGE`（0x0219），`WParam` 是事件类型：`DBT_DEVICEARRIVAL`（0x8000）设备到达、`DBT_DEVICEREMOVECOMPLETE`（0x8004）移除完成。

### 代码（原笔记整理：去掉了调试框、补了就绪等待）

```csharp
private const int WM_DEVICECHANGE = 0x0219;
private const int DBT_DEVICEARRIVAL = 0x8000;
private const int DBT_DEVICEREMOVECOMPLETE = 0x8004;

protected override void WndProc(ref Message m)
{
    if (m.Msg == WM_DEVICECHANGE)
    {
        switch (m.WParam.ToInt32())
        {
            case DBT_DEVICEARRIVAL:
                // 插入事件到达时盘符可能还没挂载完，延迟等一会儿再枚举
                Task.Delay(500).ContinueWith(
                    _ => OnUsbArrived(),
                    TaskScheduler.FromCurrentSynchronizationContext());
                break;
            case DBT_DEVICEREMOVECOMPLETE:
                OnUsbRemoved();
                break;
        }
    }
    base.WndProc(ref m);
}

private void OnUsbArrived()
{
    foreach (DriveInfo drive in DriveInfo.GetDrives())
    {
        if (drive.DriveType == DriveType.Removable && drive.IsReady)
        {
            // 先校验卷标再动作，防止插错盘误触发（见坑 3）
            if (drive.VolumeLabel == "DATA")
                logBox.AppendText("U盘已插入：" + drive.Name + "\r\n");
            break;
        }
    }
}

private void OnUsbRemoved()
{
    logBox.AppendText("U盘已拔出\r\n");
}
```

### 坑

1. **插入事件 ≠ 盘已就绪**。`DBT_DEVICEARRIVAL` 到达时文件系统可能还没挂载完，立即 `GetDrives()` 可能枚举不出新盘符——延迟几百毫秒或轮询等 `IsReady`。原笔记没处理这个竞态。
2. **原笔记用 `MessageBox.Show("2")`/`("3")`… 当调试输出**。生产代码千万别这么干——U 盘一动弹一串框，直接打断产线操作；换成日志或状态栏。
3. **自动执行要防误触发**。产线机器插错盘会误触发自动逻辑，动作前校验卷标是底线。
4. 覆盖 `WndProc` 记得 `base.WndProc(ref m)`。

## 三、端口排查两件套

### 场景

服务起不来、程序报"端口被占用"，第一件事是揪出是谁占了端口。

### 第一件：netstat 三步（原笔记）

```
netstat -aon | findstr "80"
```

拿到端口对应的 PID，再打开任务管理器 → 详细信息 → 按 PID 找进程。

**坑**：一个端口在 TCP 和 TCP6 上可能同时被监听（两行、两个 PID）；`TIME_WAIT` 状态的记录 PID 是 0，不代表真的有人占用。

### 第二件：按端口杀进程（PowerShell）

原笔记写了个交互式函数，核心逻辑整理成一行版：

```powershell
# 找到 80 端口处于 LISTENING 的 PID 并强制结束
$portPid = (netstat -ano | findstr ":80" | findstr "LISTENING") -split '\s+' | Select-Object -Last 1
if ($portPid) { taskkill /pid $portPid /f } else { "端口 80 未被监听" }
```

**坑**：netstat 输出是随意对齐的空格，按列 `split` 后取到的列号经常不对（端口名长短不一）。先 `findstr "LISTENING"` 把行收窄，再取**最后一列**（PID 永远是最后一列）最稳。

## 四、注册表存取配置：反射一把梭

### 场景

程序级配置放 `app.config` 就够了，但**系统级配置**（全局共享参数、需要装完就能用的默认值）放注册表更合适。原笔记的思路值得抄：**反射把静态字段和注册表值名一一对应，读写全部配置就两个方法**。

### 代码（原笔记整理）

```csharp
public static class Setting
{
    // 要存哪些配置就加哪些字段，字段名 = 注册表值名
    public static bool   AutoStart;      // bool 示例
    public static int    Interval = 30;  // int  示例
    public static string ServerIp;       // string 示例
}

public static class Register
{
    // 换成自己的键路径：HKLM\SOFTWARE\...
    private const string Path = @"SOFTWARE\Biological Monitor";

    /// <summary>读：按字段名把注册表值反射回 Setting</summary>
    public static void ReadAll()
    {
        RegistryKey key = Registry.LocalMachine.OpenSubKey(Path);
        if (key == null) return;
        try
        {
            Type t = typeof(Setting);
            foreach (string keyName in key.GetValueNames())
            {
                foreach (FieldInfo fi in t.GetFields())
                {
                    if (fi.Name != keyName) continue;
                    if (fi.FieldType == typeof(bool))
                        fi.SetValue(null, bool.Parse(key.GetValue(keyName).ToString()));
                    else if (fi.FieldType == typeof(int))
                        fi.SetValue(null, int.Parse(key.GetValue(keyName).ToString()));
                    else if (fi.FieldType == typeof(double))
                        fi.SetValue(null, double.Parse(key.GetValue(keyName).ToString()));
                    else
                        fi.SetValue(null, key.GetValue(keyName).ToString());
                }
            }
        }
        catch (Exception ex)
        {
            // 值类型和字段类型对不上、Parse 失败都会走到这里，别让配置读取崩掉程序
            Trace.WriteLine("读取注册表配置失败：" + ex.Message);
        }
        finally
        {
            key.Dispose();
        }
    }

    /// <summary>写：把 Setting 的非空字段全量写回</summary>
    public static void Write()
    {
        RegistryKey key = Registry.LocalMachine.CreateSubKey(Path);
        try
        {
            foreach (FieldInfo fi in typeof(Setting).GetFields())
            {
                if (fi.GetValue(null) != null)
                    key.SetValue(fi.Name, fi.GetValue(null));
            }
        }
        finally
        {
            key.Dispose();
        }
    }

    /// <summary>写单个值</summary>
    public static void WriteSingle(string itemName, object value)
    {
        RegistryKey key = Registry.LocalMachine.CreateSubKey(Path);
        try
        {
            key.SetValue(itemName, value);
        }
        finally
        {
            key.Dispose();
        }
    }
}
```

### 坑

1. **`HKLM` 写入要管理员权限，`HKCU` 不用**。产线工位机是普通账号时，写 `LocalMachine` 会抛 `UnauthorizedAccessException`。要么配置走 `HKCU`，要么安装时提权写一次、程序只读。
2. **32/64 位注册表重定向**：32 位进程访问 `HKLM\SOFTWARE` 会被重定向到 `WOW6432Node`——同一个键，32 位写的 64 位读不到，反之亦然。需要统一时用 `RegistryView.Registry64` 显式指定。
3. **反射 Parse 不兜底会崩**。字段类型和注册表值类型对不上直接抛异常；原笔记没处理，这里补了 try/catch。
4. `OpenSubKey`/`CreateSubKey` 拿到的 key 用完要 `Dispose`。

## 结语

四个技巧的共同点：`RegisterHotKey`、`WM_DEVICECHANGE`、`netstat`、注册表——全是 Windows 原生的现成机制，比轮询、比自实现可靠一个数量级。集成类需求的第一原则：**先问系统有没有现成的，再考虑自己写**。

## 参考资料（本站素材）

- [C#调用API注册快捷键](../Micro.NET/C%23调用API注册快捷键.md)
- [检测USB插拔](../Micro.NET/检测USB插拔.md)
- [查看某个端口是否被占用](../Micro.NET/查看某个端口是否被占用.md)
- [Powershell终止某个端口所在进程](../OS/Powershell终止某个端口所在进程.md)
- [注册表操作.cs](../Micro.NET/注册表操作.cs)
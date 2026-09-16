# 异步与文件 IO：从"会写"到"不乱写"

!!! note "状态"
    已定稿（2026-09-16）。

上位机软件的本地数据处理，翻来覆去就三件事：**异步别卡界面、文件读写别丢数据、目录扫描别死机**。这三篇"深度总结"是当年逐个踩出来的，整理成一篇：先讲 async/await 的纪律，再给一套 IO 工具箱，然后是目录递归搜索的生产级写法，最后是一个拖拽判断的细节修正。

## 一、async/await：await 才是控制点

### 核心模型

`async` 方法本身不创建新线程、不阻塞调用者——真正的行为差异来自 **`await`**：

- 遇到 `await`：挂起当前方法，把后续代码交给调度器，等被等待的任务完成再继续；
- 不 `await`：调用立即返回，方法照跑（fire-and-forget）；
- `await` 之后的代码，在 UI 线程上下文里会**自动回到 UI 线程**，可以直接操作控件，不需要手动 `Dispatcher.Invoke`。

原笔记用 A/B 两句代码就把这个差异讲透了：

```csharp
static async Task Asyn()
{
    // 代码 A：挂起，等 CreateFileAsync 完成后再继续往下跑
    await CreateFileAsync(@"C:\temp\a.txt");

    // 代码 B：不等，立即继续往下跑
    // CreateFileAsync(@"C:\temp\a.txt");
}
```

一句话记忆：**想等，就 `await`；不想等，就不要 `await`，但要想清楚后果。**

### 原笔记的坑（已修正）

原笔记的演示代码本身有几个会误导新手的问题，照抄会翻车：

| 原写法 | 问题 | 修正 |
| --- | --- | --- |
| `async void Asyn()` | `async void` 的异常没有任何人接收，出问题直接崩进程 | 只有**事件处理器**允许 `async void`，其余全部 `async Task` |
| `Task.Delay(5000);` | 没 `await`，等于什么都没写，任务瞬间丢弃 | `await Task.Delay(5000)` 才是真挂起 |
| `Task.Run(delegate { File.Create(...) })` | 没 `await`、没 `Dispose`，句柄泄漏 | 文件异步用 `File.WriteAllTextAsync` 等现成 API，不需要自己 `Task.Run` 包 |
| `for` 循环里 `Task.Delay(1000)` | 没 `await`，循环瞬间跑完 | `await Task.Delay(1000)` |

### 上位机实战模板

保存按钮的正确姿势——不卡界面、异常可见、按钮防重入：

```csharp
// 事件处理器：async void 在这里是唯二的正当用法
private async void btnSave_Click(object sender, RoutedEventArgs e)
{
    btnSave.IsEnabled = false;
    try
    {
        var data  = await LoadDataAsync();      // 读配置/查库：挂起点
        await SaveDataAsync(data);              // 写数据：挂起点
        statusText.Text = "保存完成：" + DateTime.Now;
    }
    catch (Exception ex)
    {
        statusText.Text = "保存失败：" + ex.Message;
    }
    finally
    {
        btnSave.IsEnabled = true;
    }
}

private async Task<Model> LoadDataAsync()
{
    // 小文件用 ReadAllTextAsync，大文件用流式
    return await Task.Run(() => LoadData());   // 纯 CPU 密集才包 Task.Run
}

private async Task SaveDataAsync(Model m)
{
    // 写文件、写日志……
    await Task.Delay(10);                       // 演示用的挂起点
}
```

### 坑

1. **`async void` 只在事件处理器用**。其余地方崩溃时异常无接收者，进程直接挂，日志里什么都没有。
2. **`Task.Delay` 不 `await` 等于白写**。想"等一会儿再重试"，先确认 `await` 写上了。
3. **UI 线程里 `await` 完再手动 `Dispatcher.Invoke` 是双重切换**。`await` 已经带回了当前 SynchronizationContext；只有后台任务（`ConfigureAwait(false)` 之后）才需要手动切回。
4. **fire-and-forget 必须包 try/catch**。不等的任务一样会抛异常，不接住就静默丢。


## 二、文件读写工具箱

### 六件套

原笔记把文件操作拆成六个小方法，整理成 `IoHelper`（已是可抄版本）：

```csharp
public static class IoHelper
{
    /// <summary>读（小文件一把梭；大文件用流式逐行）</summary>
    public static string ReadAll(string path) => File.ReadAllText(path, Encoding.UTF8);

    /// <summary>写（覆盖）—— 忘 Flush/Dispose 会丢数据</summary>
    public static void Write(string path, string content)
    {
        using (StreamWriter sw = new StreamWriter(path, false, Encoding.UTF8))
        {
            sw.Write(content);
            sw.Flush();
        }
    }

    /// <summary>追加一行（日志最常用）</summary>
    public static void Append(string path, string content)
    {
        using (StreamWriter sw = new StreamWriter(path, true, Encoding.UTF8))
        {
            sw.WriteLine(content);
        }
    }

    /// <summary>清空（FileMode.Truncate）</summary>
    public static void Clear(string path)
    {
        using (new FileStream(path, FileMode.Truncate)) { }
    }

    /// <summary>创建 —— 不 Dispose 会一直锁着文件</summary>
    public static void Create(string path)
    {
        if (!File.Exists(path))
            File.Create(path).Dispose();
    }

    /// <summary>删除 —— 文件不存在会抛异常，先判存在</summary>
    public static void Delete(string path)
    {
        if (File.Exists(path))
            File.Delete(path);
    }
}
```

用法对照（配合原笔记的思路）：

| 操作 | 做法 | 容易踩的坑 |
| --- | --- | --- |
| 读 | `StreamReader.ReadToEnd()` 或逐行 | 大文件一把梭内存暴涨 |
| 写（覆盖） | `StreamWriter(path, false)` + `Flush` | 忘 Flush/Close 丢数据 |
| 追加 | `StreamWriter(path, true)` | 用 `WriteAllText` 会把历史全盖掉 |
| 清空 | `FileMode.Truncate` | 和 `FileMode.Create` 搞混：Create 会**新建覆盖** |
| 创建 | `File.Create(...).Dispose()` | 不 Dispose，文件被自己锁住，再读就报"正在占用" |
| 删除 | 先 `File.Exists` 再 `File.Delete` | 直接删不存在的文件会抛异常 |

### 坑

1. **`StreamWriter` 忘 `Flush`/`Close`（或 `Dispose`）会丢数据**。写日志到一半程序退出，最后几条没了——用 `using` 块是从根上解决。
2. **配置/数据目录别跟程序装一起**。Program Files 只读，写文件必踩权限（详见[产线集成](05-line-integration.md)的 Access 一节）——数据目录放 ProgramData 或工位本地路径。
3. **路径拼接用 `Path.Combine`**，别用字符串加号——两边谁少个 `\` 都是事故。


## 三、目录递归搜索：先能跑，再防炸

### 原笔记的递归版

```csharp
/// <summary>递归列出所有文件</summary>
static IEnumerable<string> GetAllFiles(string path)
{
    foreach (var file in Directory.GetFiles(path))
        yield return file;
    foreach (var dir in Directory.GetDirectories(path))
        foreach (var file in GetAllFiles(dir))
            yield return file;
}
```

思路没问题，但直接上生产会遇到三个现实问题。

### 生产版：防权限、防死循环、防栈溢出

```csharp
/// <summary>
/// 安全遍历目录下所有文件：
/// 无权限目录跳过、symbolic link/junction 不跟进（防死循环）、迭代代替递归（防栈溢出）
/// </summary>
static IEnumerable<string> SafeEnumerateFiles(string root, string pattern = "*")
{
    var stack = new Stack<string>();
    stack.Push(root);

    while (stack.Count > 0)
    {
        var dir = stack.Pop();

        string[] files, dirs;
        try
        {
            files = Directory.GetFiles(dir, pattern);
            // junction/链接目录跳过，否则 A -> B -> A 会死循环
            dirs = Directory.GetDirectories(dir)
                .Where(d => (File.GetAttributes(d) & FileAttributes.ReparsePoint) == 0)
                .ToArray();
        }
        catch (UnauthorizedAccessException) { continue; }   // 系统目录无权限：跳过继续
        catch (IOException)               { continue; }     // 目录被删/被占用：跳过继续

        foreach (var f in files) yield return f;
        foreach (var d in dirs)  stack.Push(d);
    }
}
```

三个防炸点对应三个现场事故：

| 事故 | 原因 | 对策 |
| --- | --- | --- |
| 扫到一半抛异常整体崩溃 | 某个系统目录无权限，`GetDirectories` 直接抛 `UnauthorizedAccessException` | 每层 try/catch 跳过，不能整个遍历包一层 try 就以为完事 |
| 程序卡死/越跑越深 | 目录 junction 循环引用（A→B→A） | 跳过 `ReparsePoint` 属性 |
| 深层目录栈溢出 | 递归一层层压栈 | 显式栈迭代；数据量小再考虑递归的简洁 |

按后缀筛选（原笔记的 `GetFiles(path, ext)` 思路）直接用上面的 `SafeEnumerateFiles(path, "*.txt")` 即可，注意 `Directory.GetFiles` 的 pattern 是通配符不是后缀——`"txt"` 匹配不到，必须是 `"*.txt"`。

### 坑

1. **pattern 是通配符不是后缀**。`GetFiles(path, "txt")` 匹配不到任何文件，写成 `"*.txt"`。
2. **别在遍历时改动目录**。边遍历边删文件会撞 `IOException`；先收集路径，统一处理。
3. **文件量级大时用 `Enumerate*` 系列**（流式返回），别图省事一把 `GetFiles` 数组全进内存——几十万文件时差出一个数量级。


## 四、判断拖拽的是文件还是文件夹

### 原写法

```csharp
string filePath = ((System.Array)e.Data.GetData(DataFormats.FileDrop)).GetValue(0).ToString();
FileInfo fInfor = new FileInfo(filePath);
if (fInfor.Attributes == FileAttributes.Directory)  // 文件夹
{
    MessageBox.Show("是文件夹");
}
else
{
    MessageBox.Show(fInfor.Name.Split('.')[0]);
}
```

### 修正版

原逻辑对"干净的纯目录"成立，但 `FileAttributes` 是**标志位**——目录带上了 `ReparsePoint`（快捷方式/链接）等附加属性时，`==` 相等判断就会失效。按位与才是稳妥写法，顺带补上空拖动判断：

```csharp
private void DropArea_Drop(object sender, DragEventArgs e)
{
    string[] paths = e.Data.GetData(DataFormats.FileDrop) as string[];
    if (paths == null || paths.Length == 0) return;

    string path = paths[0];
    bool isDirectory = (File.GetAttributes(path) & FileAttributes.Directory) != 0;
    // 用 &=判，不要用 ==：属性是位标志组合，单纯目录才能用相等判断

    if (isDirectory)
        MessageBox.Show("是文件夹");
    else
        MessageBox.Show(Path.GetFileNameWithoutExtension(path));
}
```

文件名也别用 `Split('.')[0]`——文件名带点（`v1.2.3.txt`）就截错了，`Path.GetFileNameWithoutExtension` 是标准答案。

## 结语

异步是**纪律**（`await` 写没写对，决定卡不卡、崩不崩），文件读写是**工具箱**（六件套用对，决定丢不丢数据），目录搜索是**防炸**（权限、死循环、栈溢出三关）。三件套覆盖上位机本地数据场景的九成。

## 参考资料（本站素材）

- [C#深度总结-Async Await](../Micro.NET/C%23深度总结-Async%20Await.md)
- [C#深度总结-文件IO](../Micro.NET/C%23深度总结-文件IO.md)
- [C#深度总结-文件目录搜索](../Micro.NET/C%23深度总结-文件目录搜索.md)
- [WPF判断拖拽的是文件还是文件夹](../Micro.NET/WPF判断拖拽的是文件还是文件夹.md)
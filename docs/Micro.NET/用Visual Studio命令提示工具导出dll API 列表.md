#### 用Visual Studio命令提示工具导出dll API 列表

每个版本的`Visual Studio`都会附带这个工具。在`vs`安装目录下的`VC\bin`目录下。也可从菜单中`VS`对应的菜单目录通过点击快捷方式访问。

不知道怎么使用`dumpbin`输入`dumpbin /?`即可。直接输入`help`会发现对应的提示列表中没有`dumpbin`命令。这是应为此时的提示是如何使用控制台应用程序的帮助。`Microsoft`玩了个小把戏，实际上只是以管理员的身份运行`cmd.exe`程序而已。只是当运行这个命令提示工具时，它把目录设置到安装目录下的`VC`目录。

导出dll的`API`到桌面可这样写

```powershell
dumpbin /exports /out:桌面路径\a.txt c:\windows\system32\kernel.dll
```


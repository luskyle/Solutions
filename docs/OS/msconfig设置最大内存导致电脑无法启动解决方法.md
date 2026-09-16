#### msconfig设置最大内存导致电脑无法启动解决方法

导致此问题的根本原因是，truncatememory被手动设置为0x0000000。系统启动时内存不足。解决方法是

进入高级选项，找到命令提示工具(也可能叫其它名字)，然后执行命令

```powershell
bcdedit /deletevalue {default} truncatememory
```


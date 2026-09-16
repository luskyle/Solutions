### windows开始菜单被禁用，可弹出菜单，但是不能用鼠标操作解决方案



我用的系统是win10，前段时间修改了系统启动配置，导致完全蓝屏。根本进不去操作系统。无奈重置了它。

然后就对重置后的操作系统进行配置。各种卸载，禁用。其中因为神烦每次开机都会出现Cortana进程，认为它浪费内存资源。就这个：

![cortanaProcess](C:\Users\Administrator\Desktop\MyBlogs-ING\OS运维\images\cortanaProcess.png)



然后就找到它的文件位置，修改了它的名称，让系统找不到这个文件夹的内容。果然，每次开机都进程列表中再也没有出现Cortana的身影。期间没有任何异常情况。然后有一天，开始菜单毛病了：菜单可以被弹出，但不能用鼠标上面的所有按钮（按钮全部变灰），可用键盘控制操作菜单。

![SysMenuError](C:\Users\Administrator\Desktop\MyBlogs-ING\OS运维\images\SysMenuError.png)



开始觉得是不是中毒而windows defender没发现？下载个杀毒软件后也没发现病毒。后来想是不是因为杀毒软件太垃圾检测不到恶意程序？而这个恶意程序修改了注册表的某个项？但是翻了注册表文档后似乎也没有专门用来设置不让鼠标操作菜单的项。甚至怀疑被监视了。

后来经人指点才明白问题正是因为系统找不到Cortana文件夹。所以，找到它的文件夹

```
C:\Windows\SystemApps\Microsoft.Windows.Cortana_cw5n1h2txyewy
```

把修改后的名称重新写成

```
Microsoft.Windows.Cortana_cw5n1h2txyewy
```

即可。
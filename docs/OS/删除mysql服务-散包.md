#### 删除`mysql`服务-散包

`mysql`官网上下载了需要的`mysql`版本。安装完如果不想要它，可以这样删除。

首先，删掉这个文件夹。其次打开注册表`\HKEY_LOCAL_MACHINE\SYSTEM\ControlSet001\Services`，找到`MySQL`删掉它；然后`cmd`命令，取得管理员权限后`sc query`，即可查看到当前安装的服务。或者通过任务管理器打开服务界面，可以看到仍有MySQL服务这项，只是已经完全损坏。删掉它就行了。这样删除：`sc delete MySQL`。这样`Mysql`就彻底清除掉了。
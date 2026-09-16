#### 配置`mysql-5.7.22-winx64`

这个版本的`mysql`安装十分方便。

下载后，解压到需要的目录。然后`cmd`变换目录到那里。执行命令`mysqld --install`，然后再`mysqld --initialize-insecure`就大功告成了，不用配置什么`ini`文件，因为`根本没有！！`。



另外安装`mysql`服务不能这样搞：`mysqld -k install -n "自定义服务名"`，卸载也不能这样`mysqld -k uninstall -n "自定义服务名"`。安装或卸载只能这样：`mysqld --install`，`mysqld --remove`。
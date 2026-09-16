#### Centos开机自启某个服务

以`mysql服务`为例，这么做：

复制命令`vi /etc/rc.local`。这就会打开`rc.local文件`。然后在这个文件中添加命令`service mysqld start`。即可。


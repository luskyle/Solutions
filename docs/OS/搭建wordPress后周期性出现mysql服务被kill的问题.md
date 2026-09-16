#### 搭建wordPress后周期性出现mysql服务被kill的问题

原因是php程序开的子进程太多了，而进驻内存后却不释放，所以导致运行一会内存耗尽，mysql进程被Kill。

解决办法是安装php-fpm扩展，

```shell
#因为通过yum -y install php安装的php几乎什么扩展都没有，所以需要安装这个管控服务
yum -y install php-fpm
```

运行这个服务之后将自动控制php进程。

```shell
systemctl start php-fpm
```

测试发现，访问博客时内存不断消耗，但在消耗到一定值后又会回升。这就表示安装管控程序后，php将占用的资源释放给了系统。



##### 查看服务器上一共开了多少的 php-cgi 进程

```shell
ps -fe |grep "php-fpm"|grep "pool"|wc -l
```

##### 查看已经有多少个php-cgi进程用来处理tcp请求

```shell
netstat -anp|grep "php-fpm"|grep "tcp"|grep "pool"|wc -l
```

通过yum -y install php安装后几乎什么扩展都没有。有的只是让php能够开始运行的必要文件。像操作mysql什么的都搞不了。

所以通过yum -y install php-mysql安装mysql服务，安装后在对应目录中就会添加跟操作mysql相关的.so文件（.so就是扩展的具体内容）。

同理，php-fpm也是这样。php-fpm是php团队开发的便于管理php运行的工具，安装后以服务的形式运行在目标机上。php5以后已经是php项目的标准配置了。下载php源码到目标机，编译安装后会生成php-fpm程序。

当然有人已经做好了一个，放在centos的fastMirror镜像库里，所以通过yum -y install php-fpm就能很方便地安装到目标机。安装后启动它，就能根据配置的信息控制php子进程的数量，耗内存块的大小等等，从而实现自动控制。
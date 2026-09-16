#### 恢复`mysql`数据库到本地

服务器端`Mysql`挂了。但是还有重要数据怎么办？这样做：

首先找到服务器端`Mysql`安装路径下的数据库，可以看到有三个文件:

```shell
目录xxx

db.opt
xxx.frm 
xxx.ibd
```

把整个目录copy到本地。

停止本地`Mysql`服务，把此目录copy到本地`Mysql`安装目录的data文件夹下。这样本地就有了完整的待恢复的数据库。

但问题是，还要考虑这个数据库用的引擎类型。当初创建的时候究竟是用的`MyISAM`引擎还是`InnoDB`引擎。如果是前者，直接Copy过来就算完成了恢复工作。如果是后者，则还需要Copy服务器上的`ibdata1`文件替换本地data目录下的`ibdata1`。因为`Mysql`启动时需要根据这个文件生成`ib_logfile0，iblogfile101(中间文件,最后就没有了)，iblogfile1，ibtmp1，xxx.pid`文件到data目录下。所以最好是把原先的`ib_logfile0，ib_logfile1`也删掉。这样重新生成的`ib_logfile`就是描述了当前`ibdata1`的日志文件。
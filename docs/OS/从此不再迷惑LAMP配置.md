#### 从此不再迷惑LAMP配置

LAMP环境搭建，说白了就两点。

一、让Apache解析PHP。

二、让PHP能够连接`Mysql` 。

为实现一，应该设置Apache的配置文件`httpd.conf`。把Apache安装目录下的`module`下的解析PHP的`.so`扩展加载上。

```shell
httpd.conf

LoadModule xxx（自定义的名称） moudules\xxx.so(.so文件的路径)
```

为实现二，应该配置PHP的`Mysqli.ini`文件。我的是在`php.d`目录下的。



做完上面两个步骤就算是完成了LAMP配置。WAMP一样。
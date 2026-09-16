#### yum安装`php`

如此安装

```shell
yum -y install php
```

这样安装完之后几乎什么扩展都没有，比如要搭建`wordPress`要用到mysql数据库。这时的php是不能满足我们需要的。因此还要额外安装mysql扩展。这样安装

```bash
yum -y php-mysql
```

这样装完后，php的安装目录下就会增加操作mysql相关的`.so`扩展。
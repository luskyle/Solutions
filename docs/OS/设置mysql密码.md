#### 设置`mysql`密码

安装完`mysql`后，默认用户是`root`密码为空，可以这样修改密码。

`cmd`进入`mysql`，直接`set password =password('xxxxxxx');`。

或者

```mysql
mysql>use mysql;
mysql>update user set password=password('xxxxxxx') where user='xxxxx'; 
mysql>flush privileges;
```


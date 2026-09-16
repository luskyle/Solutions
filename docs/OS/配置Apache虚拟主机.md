#### 配置Apache虚拟主机

配置Apache虚拟主机。这样就可以实现一个IP地址绑定多个域名。其意义在于可以用一个IP地址绑定多个网站。这样做：

```shell
#httpd.conf

<VirtualHost *:80>
    ServerName 网站1的域名，如example1.xxx.cn
    DocumentRoot "网站1路径"
</VirtualHost>

<Directory "网站1路径">
    Options FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>

<VirtualHost *:80>
    ServerName 网站2的域名，如example2.xxx.cn
    DocumentRoot "网站2路径"
</VirtualHost>

<Directory "网站2路径">
    Options FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>
```

重启下`Apache`就OK了。
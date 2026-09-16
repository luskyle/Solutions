#### 网站Apache服务器到底该怎么配置

到底应该怎么配置网站Apache服务器呢？打开Apache配置文件`httpd.conf`。Centos版路径为`\etc\httpd`目录下，其它Linux版应该也是。之后找到这两行：

这个是配置网站的根目录。网站放在哪就写到哪。如在`/var/www/html`文件夹内就写到这里。

![2018-04-03_143822](C:\Users\Administrator\Desktop\MyBlogs-ING\OS运维\images\2018-04-03_143822.png)

这个是配置这个目录的权限，其实不配置也能访问网站。

![2018-04-03_143908](C:\Users\Administrator\Desktop\MyBlogs-ING\OS运维\images\2018-04-03_143908.png)



再之后很关键的是网站的目录。以上面目录为例。因为是配置到了`/var/www/html`。所以，`html`目录下应该有`index.html`。而不应该把此文件放到`html`的子文件夹内。
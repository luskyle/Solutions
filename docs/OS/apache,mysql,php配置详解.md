#### `apache`,`php`,`mysql`配置详解

配置AMP环境是开发轻量型网站最常用到的。知道怎么配首先得明确配置的目的，充分了解各个组件的作用。

#### 一、Apache

Apache的作用是代理。不管Apache运行在哪，本地或某台远程服务器上，它都用来响应发到80（默认80，也可能是其它）端口的请求。实际情形一是Apache运行在远程服务器上，我们通过浏览器地址栏访问这台主机。http或https。假如是http，通过域名/ip跳转到这台服务器的80端口，被监测着80端口的Apache进程捕获。捕获之后怎样处理，这就是配置Apache的目的。

Apache程序由一堆文件组成。让Apache执行捕获后的动作的关键是对其程序目录下的`httpd.conf`的配置。比如我可能希望通过不同域名访问这台远程服务器上的不同目录（放着不同网站）,那就需要这样配置：

```
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

或者我需要设置默认访问的目录，那就需要这样做（这在初配置Apache的时候很关键，虽然有默认设置，但还是建议按自己需要设置）：

```
DocumentRoot "xxxx"#目录

<Directory "xxxx">#目录
    #
    # Possible values for the Options directive are "None", "All",
    # or any combination of:
    #   Indexes Includes FollowSymLinks SymLinksifOwnerMatch ExecCGI MultiViews
    #
    # Note that "MultiViews" must be named *explicitly* --- "Options All"
    # doesn't give it to you.
    #
    # The Options directive is both complicated and important.  Please see
    # http://httpd.apache.org/docs/2.4/mod/core.html#options
    # for more information.
    #
    Options Indexes FollowSymLinks

    #
    # AllowOverride controls what directives may be placed in .htaccess files.
    # It can be "All", "None", or any combination of the keywords:
    #   Options FileInfo AuthConfig Limit
    #
    AllowOverride None

    #
    # Controls who can get stuff from this server.
    #
    Require all granted
</Directory>

```

Apache的`bin`目录下有两个关键的exe文件。一个叫做`httpd.exe`，一个叫做`ApacheMonitor.exe`。前者是`apache`的主程序，后者是一个监视程序——监视运行着的apache代理服务。通过它可以图形化的方式启动/停止apache服务。（当然，第二个exe文件是在Windows下有的，Linux版本上是没有的）。

而不管是Windows还是Linux环境，首先都应该在这台机器上使`httpd.exe`运行起来。也就是要先安装Apache代理服务。不管是何种操作系统，都应该以命令行的方式先进入`httpd.exe`的目录，然后`httpd install`。windows下还可以这样安装`httpd -k install -n "自定义服务名称" `。安装完成后启动就行了。



#### 二、PHP

现在前端（web页面）与后台（服务器）交互中最常用的就是PHP。html文件中可能包含大量`php`代码。这些代码不能被前端浏览器所解释，因此就需要在浏览器接到最终html文件前，或者说在服务器发出这些文件前先解释一番。解释工作当然不是Apache，也不是`Mysql` 。而是PHP的解释程序。

应该说创建PHP项目的程序员让PHP变得足够方便调用。只需将PHP项目中提供的`php Apache 连接程序的位置`告诉Apache就可以不用关心如何解释`php`代码的问题了。所以，在对接Apache与`php`的时候，应当打开`httpd.conf`文件，以Apache规定的语法加载这个连接程序。

```shell
LoadModule php7_module "xxxxx\连接程序名.扩展名"
PHPIniDir "php ini文件所在的路径"
AddType application/x-httpd-php .php .html .htm 
```



#### 三、`MySql`

`mysql`与`apache`是同类（都是独立的服务）。因此需要在目标机上安装此服务。

不管通过何种方式获得了`mysql`程序，也不管运行的环境是怎样的，都应该先变换目录到其`bin`文件夹下，然后通过`mysqld --install`的方式安装`mysql`服务；再之后应当初始化`mysql`：

```shell
mysqld --initialize-insecure
```

这样启动`mysql服务后`就可以`mysql -uroot -p `的方法无密码进入`mysql`程序进行操作了。

因为PHP提供了操作数据库的方法，而PHP与`mysql`搭在一起很适合构建轻型网站，因此PHP的开发者提供了操作`mysql`的扩展`如名为 php_mysqli`。所以，还需要配置`php的 ini 文件`。找到`；extension=php_mysqli.dll` 这行代码，把前面的注释去掉就OK了。



经过以上配置，当80（http）或是443（https）端口监测到请求时，会由Apache去访问指定位置，取得对应内容后，先由apache初步分析下（因为apache连接了`php`的解释程序），发现`php`代码，就交给`php`程序解释，`php`程序解释完再通过`A-P`连接程序将解释的结果告诉Apache，最终由Apache将请求的内容以`http`或是`https`向发起请求的地址发送数据。

当然，在PHP解释的过程中有可能碰上连接`mysql`数据库的代码。由于我们手动开启了PHP操作`mysql`的能力，所以PHP可以根据需要连接运行着的`mysql`程序，得到操作`mysql`后的结果。



这就是配置`AMP`环境的目的与关键所在。


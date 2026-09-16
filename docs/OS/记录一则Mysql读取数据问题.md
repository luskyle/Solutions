#### 记录一则`Mysql`读取数据问题

服务器上部署了`Mysql`服务。程序从某表读取某字段值（值为汉字），读取完做比较，就死活通过不了。检查语法，程序逻辑都没问题，迷惑了好长时间，终于意识到是编码的问题。

于是检查了项目的编码格式，把它调成`gb2312`，然后把数据库，表的格式都改成了`gb2312`，最后把连接的格式也改成了`gb2312`。终于解决了问题。连接命令这样写：

` string connStr="server=xxxxxxxx;user=xxxx;database=xxxxxxx;port=3306;password=xxxxxxxxx;Charset=gb2312;";`




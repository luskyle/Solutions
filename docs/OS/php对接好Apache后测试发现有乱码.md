#### PHP对接好Apache后测试发现有乱码

修改PHP的`ini`文件就好了。打开后搜索`charset`，把默认的”UTF-8“改为gb2312，重启Apache服务就OK了。

```
; PHP's default character set is set to gb2312.
; http://php.net/default-charset
default_charset = "gb2312"
```


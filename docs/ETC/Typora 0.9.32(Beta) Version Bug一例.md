#### Typora 0.9.32(Beta) Version Bug一例


```
从URL地址中提取文件名的javascript程序 
　　s="http://www.9499.net/page1.htm"; 
　　s=s.replace(/(.*/){0,}([^.]+).*/ig,"$2") ;
```

这段代码，放到Code Fences中。如果选择`javascript`语言，那么Typora程序就会卡死掉。
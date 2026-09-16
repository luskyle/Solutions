#### 文档创建时为什么要使用using

为了不至于出现文件占用的情况。所以要如此创建文档：          

```c#
using (File.Create(filePath)) { }
```


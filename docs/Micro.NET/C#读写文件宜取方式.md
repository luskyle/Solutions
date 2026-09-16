#### C#读写文件宜取方式

首先，不推荐用如下方式读写

```c#
//读
using (FileStream fs = File.OpenRead(filePath))
{
    byte[] b = new byte[1024 * 4];
    UTF8Encoding temp = new UTF8Encoding(true);
    
    while (fs.Read(b, 0, b.Length) > 0)
    {
        
    }
}

//写
using (FileStream fs = File.Create(path)) 
{
    Byte[] info = new UTF8Encoding(true).GetBytes("This is some text in the file.");
    fs.Write(info, 0, info.Length);
}

```

因为规定了读写块的大小之后读，读到文件尾后如果字节不足这个块大小，会再从上个块尾读取一定字节凑够指定块大小。这样，新文件就会出现脏数据。

##### 推荐用这种方式读写

```c#
StreamReader sr = new StreamReader(filePath, Encoding.UTF8);
sr.ReadToEnd();
sr.Close();

File.WriteAllText(filePath, content);
```


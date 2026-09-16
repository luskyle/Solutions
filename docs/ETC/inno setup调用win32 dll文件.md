#### inno setup调用win32 dll文件

如此调用：

首先在`[Files]`标记下添加`Source`引用，

`Source: "user32.dll"; DestDir: "{sys}";Flags:external allowunsafefiles;`。

这段代码告诉解释器需要调用一个文件，`user32.dll`。路径是{sys}，代表`c:\windows\system32`。并且通过`Flags`额外告诉解释器一些附加的东西。`external`表示这是个外（相对于被打包文件）部文件。`allowunsafefiles`表示允许打开`可能造成目标系统不安全（使用 Win32 API）文件被认为是不安全`的文件。不指定此项便会报错。


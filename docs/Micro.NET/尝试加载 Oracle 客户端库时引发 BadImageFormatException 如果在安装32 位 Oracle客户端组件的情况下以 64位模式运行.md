#### 尝试加载 Oracle 客户端库时引发 BadImageFormatException 如果在安装32 位 Oracle客户端组件的情况下以 64位模式运行

解决办法：

更改vs的debug对应的`解决方案`平台从`Any CPU`到`x86`。`x86`代表32位程序
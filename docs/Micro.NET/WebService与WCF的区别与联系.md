#### Web Service与WCF的区别

`Web Service`先于`WCF`出现。主要采用`SOAP+XML`的方式与远程服务通信，返回的结果也是XML，不支持`JSON`格式的数据。这样，兼容性就不很好，也有相当程度的局限性。

`WCF`，作为数据提供层，通过`HTTP`协议，与远程服务交互，作为独立的服务向有关程序提供数据。实际上，`WCF`还支持`TCP`、`Named Pipe`，`MSMQ`，`Peer-To-Peer TCP `协议，对`Web Service`也有支持。

总之，`WCF`是比`Web Service`更新，更完善的技术。
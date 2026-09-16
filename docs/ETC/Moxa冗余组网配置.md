# **Moxa**冗余组网配置

#### **1**、单独设置各个交换机

​       分别用网线连接Moxa各个交换机，在浏览器端输入其IP，默认为（192.168.127.253），若曾修改过设备IP但不知道，可用Moxa公司提供的光盘，安装MxStudio。安装完毕，打开edscfgui工具进行检测。按下图配置可实现如下网络拓扑：

![clip_image002](images\clip_image002.jpg)

配置如下：

![clip_image004](C:\Users\JY284\Desktop\Solutions\ETC\images\1659424658301.png)

![img](file:///C:/Users/JY284/AppData/Local/Temp/msohtmlclip1/01/clip_image006.jpg)

 

 

![clip_image008](C:\Users\JY284\Desktop\Solutions\ETC\images\clip_image008.jpg)

​       各个交换机还需单独配置某些端口，如下图

![clip_image010](C:\Users\JY284\Desktop\Solutions\ETC\images\clip_image010.jpg)

 

以192.168.127.10（Switch A）为例，配置如下

![clip_image012](C:\Users\JY284\Desktop\Solutions\ETC\images\clip_image012.jpg)

 

#### **2**、组网

按照给定拓扑结构连接各台交换机。连接完毕后将测试计算机接入AB交换机任一端口（因为A、B接同一设备），打开CMD，执行 Ping命令 Ping 192.168.127.12（C的IP地址）。收到回复数据即组网成功。

 

#### **3**、其它测试

让任一交换机停止工作（断电或拔出所有连接线），打开CMD，执行 Ping命令 Ping 192.168.127.12（C的IP地址）。收到回复数据即实现交换机A、B冗余配置。

同样，断开与C交换机连接的任一网线，打开CMD，执行 Ping命令 Ping 192.168.127.12（C的IP地址）。收到回复数据即实现AC、BC线路冗余配置。

 
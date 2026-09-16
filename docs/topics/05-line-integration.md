# 产线集成

!!! note "状态"
    撰写中。本文为站点专题之一，下方为定位与素材清单，正文完成后替换本页。

## 定位

上位机软件和产线的结合部：设备侧通讯（PLC 地址表、串口 / 网口）、打印机状态判断、数据落库（Access 随包分发）、部署时的权限问题。这是本站点最核心的一篇。

## 计划内容

- PLC 地址表（ChamberPLCAddr.xml）的组织与读取
- 判断打印机工作状态
- Access 数据库随安装包分发与权限
- IIS 部署中 framework 临时目录写入问题
- 获取安装目标机 C 盘权限

## 素材

- [ChamberPLCAddr.xml](../Micro.NET/xsl%20通过%20IE%20看%20XML%20文件/ChamberPLCAddr.xml)
- [C#判断打印机工作状态](../Micro.NET/C%23判断打印机工作状态.md)
- [C#Winform连接并访问Access数据库](../Micro.NET/C%23Winform连接并访问Access数据库.md)
- [C#项目中引入Access数据库生成安装包安装后权限问题](../Micro.NET/C%23项目中引入Access数据库生成安装包安装后权限问题.md)
- [IIS配置无法写入framework路径下的临时文件夹下的某dll](../Micro.NET/IIS配置无法写入framework路径下的临时文件夹下的某dll.md)
- [C#项目获取安装目标机C盘权限](../Micro.NET/C%23项目获取安装目标机C盘权限.md)
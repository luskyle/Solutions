# 无边框窗体与视觉细节

!!! note "状态"
    撰写中。本文为站点专题之一，下方为定位与素材清单，正文完成后替换本页。

## 定位

WPF 桌面客户端给客户的第一印象来自窗体本身。本文整理无边框窗口的移动与缩放、阴影与圆角、AllowsTransparency 的代价，以及窗口之间共享资源踩过的坑。

## 计划内容

- 无边框窗口：拖动、最小化 / 最大化、缩放
- AllowsTransparency 与性能取舍（splashScreen 显示时长等）
- Popup 的定位与层级问题
- 样式与资源作用域：跨窗口共享资源导致的状态丢失
- 自制弹窗的后台逻辑与参考写法

## 素材

- [WPF样例大全](../Micro.NET/WPF样例大全.md)
- [WPF AllowsTransparency 的作用](../Micro.NET/WPF%20AllowsTransparency%20的作用.md)
- [WPF为控件四周添加淡淡的阴影效果](../Micro.NET/WPF为控件四周添加淡淡的阴影效果.md)
- [wpf最小化关闭窗体](../Micro.NET/wpf最小化关闭窗体.md)
- [Popup控件的位置问题](../Micro.NET/Popup控件的位置问题.md)
- [WPF不同窗体引用同个资源导致前一个窗体资源在窗体中不显示的问题](../Micro.NET/WPF不同窗体引用同个资源导致前一个窗体资源在窗体中不显示的问题.md)
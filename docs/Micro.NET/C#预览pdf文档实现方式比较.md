# C#预览pdf文档实现方式比较

1、使用Adobe控件。加载速度慢；提供的是COM组件，必须在各个机器安装Adobe PDF程序后使用。

2、可使用`Dev Express`来实现pdf文档预览。提供的有.NET Framework组件、WPF组件。此种方式较Adobe控件加载速度快，界面美观，预览文档中自带打印功能。

3、可使用`pdf2htmlEX`将pdf文档转为html，然后在WebBrowser控件中显示。此种方式加载速度也很快，界面也很简洁，没有文档打印功能。很适合仅做预览功能的需求，有打印权限控制的系统。对于分布式预览pdf的系统是最好的实现方式：通过WebBrowser控件，以http请求的方式获取html页，这在一定程度上保护了pdf源文件，且不必在本地存储一份文档后再显示。

`Dev Express 18`及以上需要高版本（4.6及以上）.net framework支持。而适用于XP系统的低版本`Dev Express`（DXperience）则没有pdf预览控件。

所以，最好的方案是转为html方案；最差的方案是Adobe控件方案。
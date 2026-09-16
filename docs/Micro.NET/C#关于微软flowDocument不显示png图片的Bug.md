#### C#关于微软`flowDocument`不显示`png`图片的Bug

最近再用WPF`flowDocument`做文档。文档中需要引用图片。开始时引入的是`png`格式的图片。但是问题是在设计器中可以看到图片加载成功。但是项目运行时却没有图片显示出来。

好长时间没弄明白，后来Google，看到`RTF-document doesn't display PNG-image` 的标题，顿时明白是遇到微软Bug了。将图片换成其它格式问题解决。
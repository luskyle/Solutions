#### [wpf窗体项目 生成dll类库文件](https://www.cnblogs.com/chiyueqi/p/4010938.html) 		

我想把一个wpf应用程序的输出类型由windows应用程序改为类库该怎么做，直接在项目属性里改的话报错为 库项目文件无法指定applicationdefinition属性

wpf窗体项目运行之后bin/debug下面只有.exe文件,现在想要生成dll文件供其他第三方引用的实现方法。

1、删除App.xaml文件

2、将项目属性--应用程序--输出类型 改为类库。

若要在类库文件中引用多个资源字典，可以这么做

- 在项目增加一个名为 Themes 的目录，在目录里面添加一个名为 Generic.xaml 的ResourceDictionary
- 这样，你就可以把在App.xaml中定义的资源全部放在Generic.xaml中了，系统根据程序集的设置会默认从这个资源目录中去寻找资源
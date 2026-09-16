#### 打包VS项目

打开Visual Studio，选择`工具，扩展和更新`，在弹出的对话框中选择`联机选项后,在搜索框内搜Microsoft Visual Studio 2017 Installer`。搜到后安装。安装完就能用这个工具打包VS项目了。打包过程如下：

在解决方案资源管理器中`右击，添加，新建项目`，选择`其他项目类型，Setup Project`。就会弹出下面这个对话框。

![2018-03-22_194817](C:\Users\Administrator\Desktop\MyBlogs-ING\杂项\images\2018-03-22_194817.png)

项1代表程序安装目录的内容设置；项2代表程序在桌面上的内容设置；项3代表程序在开始菜单栏中的内容设置。

`右击项1,Add,项目输出`,如果还有要用到的文件，如Access数据库了啥的，就继续`右击项1,Add,文件`。以我的项目为例，右击添加为项目输出后是这个样子的。

![2018-03-22_195857](C:\Users\Administrator\Desktop\MyBlogs-ING\杂项\images\2018-03-22_195857.png)



这时，我们右击`主输出 from xxxxx(Active) `项，选择`Create Shortcut to 主输出 from xxxxx(Active)`项。这一步骤的操作是生成快捷方式。

再之后拖动这个快捷方式到左侧`项2`。这样我们的程序安装完成后就会在桌面创建一快捷方式。快捷方式名字就是`Shortcut to 主输出 from xxxxx（Active）`。当然，你可以改名。项3的操作就看自己的创意了。愿意怎样设置就怎样设置。

一切设置完成后，点击解决方案管理器中的`Setup1（添加项目的默认名）`。`右击，生成`.。这样，我们的项目文件夹中就有了两个项。`setup.exe和Setup1.msi`。双击哪个都能启动安装程序。


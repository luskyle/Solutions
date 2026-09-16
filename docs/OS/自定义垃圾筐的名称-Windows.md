#### 自定义垃圾筐的名称-Windows

修改注册表就行了。这样做

打开注册表`\HKEY_CLASSES_ROOT\CLSID\{645FF040-5081-101B-9F08-00AA002F954E}`。`右击权限-->高级-->更改所有者为当前用户，或者system-->设置对应用户的权限为完全控制-->修改LocalizedString的值为xxx`。那么垃圾筐的名字就变成xxx了。
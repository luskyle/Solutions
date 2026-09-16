# 改变Pip源

任意一个位置（保证系统能找到这个路径下的ini文件，环境变量）建文件`pip.ini`。添加如下配置：

```ini
[global]
index-url = https://pypi.com/simple/
[install]
trusted-host=https://pypi.com
```

配置好后`pip install xxx`时将会从`https://pypi.com`下载所需包和依赖。当然也可配置成其它源。



```ini
# 清华源
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
# 阿里源
pip config set global.index-url https://mirrors.aliyun.com/pypi/simple/
# 腾讯源
pip config set global.index-url http://mirrors.cloud.tencent.com/pypi/simple
# 豆瓣源
pip config set global.index-url http://pypi.douban.com/simple/
# 换回默认源
pip config unset global.index-url
```
# Mac HomeBrew国内镜像安装方法

2019年02月25日 06:34:27 [weixin_34067980](https://me.csdn.net/weixin_34067980) 阅读数 1367



解决Mac上国内安装HomeBrew慢的解决方法。如下

## 安装

### 官网安装Homebrew

```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"



复制代码
```

### 国内镜像安装

#### 获取install文件

获取官网脚本并保存名为 brew_install：[raw.githubusercontent.com/Homebrew/in…](https://link.juejin.im/?target=https%3A%2F%2Fraw.githubusercontent.com%2FHomebrew%2Finstall%2Fmaster%2Finstall)

#### 替换成清华大学的镜像

打开 brew_install 文件，修改如下：

找到如下代码：

```
BREW_REPO = “https://github.com/Homebrew/brew“.freeze



CORE_TAP_REPO = “https://github.com/Homebrew/homebrew-core“.freeze



复制代码
```

更改为：

```
BREW_REPO = “https://mirrors.ustc.edu.cn/brew.git “.freeze



CORE_TAP_REPO = “https://mirrors.ustc.edu.cn/homebrew-core.git“.freeze



复制代码
```

注意： 新版本HomeBrew可能没有`CORE_TAP_REPO`这句代码，如果没有不用新增。 如果这个镜像有问题的话，可以换成其他源。

#### 执行脚本

打开终端允许脚本

```
/usr/bin/ruby brew_install



复制代码
```

如果此时脚本应该停在

```
==> Tapping homebrew/core



 



Cloning into '/usr/local/Homebrew/Library/Taps/homebrew/homebrew-core'...



复制代码
```

出现这个原因是因为源不通，代码来不下来，解决方法就是更换国内镜像源：

手动执行下面这句命令，更换为中科院的镜像：

```
git clone git://mirrors.ustc.edu.cn/homebrew-core.git/ /usr/local/Homebrew/Library/Taps/homebrew/homebrew-core --depth=1



复制代码
```

然后把homebrew-core的镜像地址也设为中科院的国内镜像

```
cd "$(brew --repo)"



 



git remote set-url origin https://mirrors.ustc.edu.cn/brew.git



 



cd "$(brew --repo)/Library/Taps/homebrew/homebrew-core"



 



git remote set-url origin https://mirrors.ustc.edu.cn/homebrew-core.git



复制代码
```

执行更新，成功：

```
brew update



复制代码
```

最后用这个命令检查无错误：

```
brew doctor



复制代码
```

至此HomeBrew就安装完成了。

## 更改默认源

直接使用 Homebrew 还需要更改默认源。以下是将默认源替换为国内 USTC 源的方法。 如下：

### 替换核心软件仓库

```
cd "$(brew --repo)/Library/Taps/homebrew/homebrew-core"



git remote set-url origin https://mirrors.ustc.edu.cn/homebrew-core.git



复制代码
```

### 替换 cask 软件仓库（提供 macOS 应用和大型二进制文件）

```
cd "$(brew --repo)"/Library/Taps/caskroom/homebrew-cask



git remote set-url origin https://mirrors.ustc.edu.cn/homebrew-cask.git



复制代码
```

### 替换 Bottles 源（Homebrew 预编译二进制软件包）

bash（默认 shell）用户：

```
echo 'export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.ustc.edu.cn/homebrew-bottles' >> ~/.bash_profile



source ~/.bash_profile



复制代码
```

zsh 用户：

```
echo 'export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.ustc.edu.cn/homebrew-bottles' >> ~/.zshrc



source ~/.zshrc



复制代码
```
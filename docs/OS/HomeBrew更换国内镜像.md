[![logo](https://chad-it.github.io/favicon.png)](https://chad-it.github.io/)

- [博客](https://chad-it.github.io/)
- [归档](https://chad-it.github.io/archives/)
- [微博](http://weibo.com/)
- [GITHUB](https://github.com/chad-it)
- [留言](https://chad-it.github.io/board)

# HomeBrew更换国内镜像

Jun 21, 2018

 字数统计: 443字   |    阅读时长: 2分

## HomeBrew更换国内镜像

### 国内镜像源

[中科大USTC开源软件镜像站](https://mirrors.ustc.edu.cn/)
[清华大学开源软件镜像站](https://mirrors.tuna.tsinghua.edu.cn/)

### Homebrew 源使用帮助

#### 地址

https://mirrors.ustc.edu.cn/brew.git/

#### 说明

Homebrew 源代码仓库

#### 使用说明

替换USTC镜像：

```
cd "$(brew --repo)"
git remote set-url origin https://mirrors.ustc.edu.cn/brew.git
```



重置为官方地址：

```
cd "$(brew --repo)"
git remote set-url origin https://github.com/Homebrew/brew.git
```



### Homebrew Core 源使用帮助

#### 地址

https://mirrors.ustc.edu.cn/homebrew-core.git/

#### 说明

Homebrew 核心软件仓库

#### 使用说明

替换 USTC 镜像：

```
cd "$(brew --repo)/Library/Taps/homebrew/homebrew-core"
git remote set-url origin https://mirrors.ustc.edu.cn/homebrew-core.git
```



重置为官方地址：

```
cd "$(brew --repo)/Library/Taps/homebrew/homebrew-core"
git remote set-url origin https://github.com/Homebrew/homebrew-core.git
```



### Homebrew Bottles 源使用帮助

#### 地址

https://mirrors.ustc.edu.cn/homebrew-bottles/

#### 说明

Homebrew 预编译二进制软件包

#### 收录仓库

homebrew/homebrew-core
homebrew/homebrew-dupes
homebrew/homebrew-php
homebrew/homebrew-science
homebrew/homebrew-nginx
homebrew/homebrew-apache
homebrew/homebrew-portable

#### 使用说明

请在运行 brew 前设置环境变量 HOMEBREW_BOTTLE_DOMAIN ，值为 https://mirrors.ustc.edu.cn/homebrew-bottles 。

对于 bash 用户：

```
echo 'export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.ustc.edu.cn/homebrew-bottles' >> ~/.bash_profile
source ~/.bash_profile
```



对于 zsh 用户：

```
echo 'export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.ustc.edu.cn/homebrew-bottles' >> ~/.zshrc
source ~/.zshrc
```



### Homebrew Cask 源使用帮助

#### 地址

https://mirrors.ustc.edu.cn/homebrew-cask.git/

#### 说明

Homebrew cask 软件仓库，提供 macOS 应用和大型二进制文件

#### 使用说明

替换为 USTC 镜像：

```
cd "$(brew --repo)"/Library/Taps/homebrew/homebrew-cask
git remote set-url origin https://mirrors.ustc.edu.cn/homebrew-cask.git
```



重置为官方地址：

```
cd "$(brew --repo)"/Library/Taps/homebrew/homebrew-cask
git remote set-url origin https://github.com/Homebrew/homebrew-cask.git
```



注解Caskroom 的 Git 地址在 2018 年 5 月 25 日从 https://github.com/caskroom/homebrew-cask 迁移到了 https://github.com/Homebrew/homebrew-cask 。

- **本文作者：** chad
- **本文链接：** https://chad-it.github.io/2018/06/21/HomeBrew更换国内镜像/
- **版权声明：** 本博客所有文章除特别声明外，均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)许可协议。转载请注明出处！

[上一篇](https://chad-it.github.io/2018/06/25/Mac开启原生NTFS读写功能/)[下一篇](https://chad-it.github.io/2018/06/14/Hexo集成Gitment评论系统/)

 Like[Issue Page](https://chad-it.github.io/2018/06/21/HomeBrew更换国内镜像/undefined)

Error: API rate limit exceeded for 116.136.20.187. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)



Write Preview

[Login](https://github.com/login/oauth/authorize?scope=public_repo&redirect_uri=https%3A%2F%2Fchad-it.github.io%2F2018%2F06%2F21%2FHomeBrew%E6%9B%B4%E6%8D%A2%E5%9B%BD%E5%86%85%E9%95%9C%E5%83%8F%2F&client_id=2165b3a08aed8f3f8445&client_secret=0fb670dd59e1afadc4dd33a3cfc9c1d54f0bbe52) with GitHub



[Styling with Markdown is supported](https://guides.github.com/features/mastering-markdown/)Comment

Powered by [Gitment](https://github.com/imsun/gitment)

本站已安全运行 488 天 08 小时 28 分 08 秒

本站总访问量次 本站访客数人次 本文总阅读量次

© 2018 - 2019 [chad](https://chad-it.github.io/), powered by [Hexo](https://hexo.io/) and [hexo-theme-apollo](https://github.com/pinggod/hexo-theme-apollo).
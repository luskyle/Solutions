# MAC Dock显示/隐藏 不再有延迟

使用下面的方法可以消除这个延迟：

输入如下代码并回车：

```
defaults write com.apple.Dock autohide-delay -float 0 && killall Dock
```

如果想要恢复原来默认的延迟速度，就在终端输入如下代码并回车即可：

```bash
defaults delete com.apple.Dock autohide-delay && killall Dock
```


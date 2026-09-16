在其他地方点击之后,pop1并不是自动关闭了,而是跑到其他控件后面去了   所以你再让它打开,它其实已经是打开的,而且已经在后面,所以看不到了.   你先让它关闭,再打开,就又跑到前面来了

##### 解决办法

```c#
private void border_MouseEnter(object sender, System.Windows.Input.MouseEventArgs e)
{
    pop1.IsOpen = false;
    pop1.IsOpen = true;
}
```


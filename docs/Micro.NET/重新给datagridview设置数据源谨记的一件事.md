#### 重新给datagridview设置数据源谨记的一件事

`那就是把先前的数据源给替换掉。`

假如我们给datagridview绑定了table0，而在执行某些操作后需要把它替换成table1。在得到table1后，应该执行此行代码

```csharp
dataGridView1.DataSource = table1;
```

但这仅仅是告诉程序，`datagridview`的数据来源现在是`table1`了。但是很不幸，datagridview绑定的数据源并不会因为执行了这行代码而改变，它仍然以`table0`作数据源。只不过因为这行代码而让datagridview呈现出table1中的数据罢了。所以，按道理有两种解决方法：

1、强行通过某种方式让它真的以新表为数据源

2、让旧表引用新表

第2种方法大概这样

```csharp
table0 = table1;
```

第一种方法想想就很麻烦，绝不是一行代码可以解决的。
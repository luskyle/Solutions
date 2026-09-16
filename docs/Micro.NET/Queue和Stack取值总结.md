#### Queue和Stack取值总结

用Queue或者Stack存储了一组内容：如Queue如此存

```c#
Queue<string> que = new Queue<string>();
```

Stack如此存

```c#
Stack<string> stk = new Stack<string>();
```

之后取存下的值，均不能正向循环取值，应反向循环取值(若边取值边改变`Stack`或`Queue`的元素个数)，且不能用foreach方式循环取值

```c#
//Queue
string str = "";
for (int i = que.Count; i > 0; i--)
{
	str += que.Dequeue();
}

//Stack
string str = "";
for (int i = stk.Count; i > 0; i--)
{
	str += stk.Pop();
}

```

这样，Queue便得到正序值，Stack便得到逆序值。（序：存顺）
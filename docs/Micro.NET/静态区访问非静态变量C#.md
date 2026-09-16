#### 静态区访问非静态变量

```csharp
class A
{
	public static void F()//静态
    {
        G();//错误
    }
    public void G()//非静态
    {
    }  
}
一般情况F()不能调用G()，但是你可以增加一个静态成员
class A
{
  private static A instance=new A();
  public static void F()//静态
  {
	A.G();//正确
  }
  public void G()//非静态
  {
  }  
}
```
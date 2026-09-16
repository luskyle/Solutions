#### C#遍历Queue的正确姿势

首先，`	using System.Collections.Generic;`

然后，

```csharp
Queue<string> vList = new Queue<string>();

string str = "";
foreach (var item in vList)
{
	str += item+" ";
}

```


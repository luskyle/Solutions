#### C#从路径中获得文件名的正确写法

一行代码足矣

```csharp
this.filePath = openFileDialog.FileName.Split('\\').Last();
```


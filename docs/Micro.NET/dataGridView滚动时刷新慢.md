#### dataGridView滚动时刷新慢

解决办法：利用`System.Reflection`缓冲刷新。

```csharp
    public static class CSVReaderHelper
    {
        /// <summary>
        /// 缓冲以使滑动滚轮时不卡
        /// </summary>
        /// <param name="dgv"></param>
        /// <param name="setting"></param>
        public static void DoubleBuffered(this DataGridView dgv, bool setting)
        {
            Type dgvType = dgv.GetType();
            PropertyInfo pi = dgvType.GetProperty("DoubleBuffered", BindingFlags.Instance | BindingFlags.NonPublic);

            pi.SetValue(dgv, setting, null);
        }

    }

```

如此调用

```csharp
dataGridView1.DoubleBuffered(true);
```


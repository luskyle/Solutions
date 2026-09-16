# Tensorflow 用训练好的模型预测时出现TypeError ufunc 'matmul' did not contain a loop with signature matching types dtype('U32') dtype('U32') dtype('U32')

需要用astype() 把结果的类型转为适当的。

```python
def GetDataBlock(offset, limit):
    """"
        从指定位置开始查询 limit 条 Data 记录
    """
    with sqlite3.connect("mnist_test.db3") as conn:
        cur = conn.cursor()

        sql = f"SELECT DATA from DATA limit {limit} offset {offset}"
        cur.execute(sql)
        ds = cur.fetchall()
        ds = np.array(ds)

        result = []
        for row in ds:
            for item in row:
                words = str(item)[1:-1].split(' ')
                result.append(words)

        result = np.array(result).astype('float32')

    return result
```


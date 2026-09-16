# Python操作sqlite

```python
import  sqlite3
import numpy as np

def GetNext(offset, limit):
    return GetDataBlock(offset, limit),GetMeanBlock(offset, limit)


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


def GetMeanBlock(offset, limit):
    """"
        从指定位置开始查询 limit 条 Mean 记录
    """
    with sqlite3.connect("mnist_test.db3") as conn:
        cur = conn.cursor()

        sql = f"SELECT MEAN from DATA limit {limit} offset {offset}"
        cur.execute(sql)
        ds = cur.fetchall()
        ds = np.array(ds)

        result = []
        for item in ds:
            row = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            index = item[0]
            row[index] = 1
            result.append(row)

        result = np.array(result).astype('float32')

    return result
```


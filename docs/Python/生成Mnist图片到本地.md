# 生成Mnist图片到本地

```python
import numpy as np
import struct
import matplotlib.pyplot as plt
import os
from PIL import Image

filename = 'train-images.idx3-ubyte'
# filename = 't10k-images.idx3-ubyte'
binfile = open(filename, 'rb')
buf = binfile.read()

index = 0
magic, numImages, numRows, numColumns = struct.unpack_from('>IIII', buf, index)
index += struct.calcsize('IIII')
images = []
for i in range(numImages):
    imgVal = struct.unpack_from('>784B', buf, index)
    index += struct.calcsize('>784B')
    imgVal = list(imgVal)
    for j in range(len(imgVal)):
        if imgVal[j] > 1:
            imgVal[j] = 1

    images.append(imgVal)
arrX = np.array(images)

# 读取标签
binFile = open('train-labels.idx1-ubyte', 'rb')
# binFile = open('t10k-labels.idx1-ubyte','rb')
buf = binFile.read()
binFile.close()
index = 0
magic, numItems = struct.unpack_from('>II', buf, index)
index += struct.calcsize('>II')
labels = []
for x in range(numItems):
    im = struct.unpack_from('>1B', buf, index)
    index += struct.calcsize('>1B')
    labels.append(im[0])
arrY = np.array(labels)
print(np.shape(arrY))

# print(np.shape(trainX))
# 以下内容是将图像保存到本地文件中
path_trainset = "imgs_train"
path_testset = "imgs_test"
if not os.path.exists(path_trainset):
    os.mkdir(path_trainset)

for i in range(10):
    if not os.path.exists(path_trainset + "\\" + str(i)):
        os.mkdir(path_trainset + "\\" + str(i))

if not os.path.exists(path_testset):
    os.mkdir(path_testset)

for i in range(60000):
    img = np.array(arrX[i])
    img = np.reshape(img, [28, 28])
    img = Image.fromarray(img*256).convert('L') ## 用PIL处理图像

    outfile = str(i) + "_" + str(arrY[i]) + ".png"
    img.save(path_trainset + "/" + str(arrY[i]) + "/" + outfile)
    print("save" + str(i+1) + "张")

```

​	用PIL处理图像到原因是为保证得到到图像是28*28，位深是1（即图像矩阵是28×28×1=784个元素）的png图片。这样处理是为了确保进行分类的图片（矩阵）与训练时用到图片（矩阵）是相同形状的。
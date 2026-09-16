# 用Cython将Python源码封装

首先配置setup.py文件，用于指定Python源文件的名称，位置。

```python
from distutils.core import setup
from Cython.Build import cythonize
setup(
    name='a py',
    ext_modules=cythonize('a.py')
)
```

之后运行命令

```shell
python setup.py build
```

完成后将会在build目录下生成pyd文件。将pyd文件和该项目的必要引用（用到的资源）Copy到其它目录，创建run.py文件，当然可以是任意的名称。

```python
from a import *
```

想要执行时执行命令

```
python run.py
```

这样就实现了运行源码相同的功能，并且源码对外不可见。
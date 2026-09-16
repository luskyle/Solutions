#### 编译安装PHP

```shell

#安装依赖
yum install gcc bison bison-devel zlib-devel libmcrypt-devel mcrypt mhash-devel openssl-devel libxml2-devel libcurl-devel bzip2-devel readline-devel libedit-devel sqlite-devel jemalloc jemalloc-devel

#进入解压后的php源码目录下
#编译命令，执行后在源码目录的父目录下生成编译后的子目录
./configure --prefix=/ \
--with-config-file-path=/ \
--enable-inline-optimization \
--disable-debug \
--disable-rpath \
--enable-shared \
--enable-opcache \
--enable-fpm \
--with-mysqli \
--with-pdo-mysql \
--with-gettext \
--enable-mbstring \
--with-iconv \
--with-mcrypt \
--with-mhash \
--with-openssl \
--enable-bcmath \
--enable-soap \
--with-libxml-dir \
--enable-pcntl \
--enable-shmop \
--enable-sysvmsg \
--enable-sysvsem \
--enable-sysvshm \
--enable-sockets \
--with-curl \
--with-zlib \
--enable-zip \
--with-bz2 \
--with-gd \
--with-freetype-dir \
--with-jpeg-dir \
--with-png-dir


##如果出现 libpng not found
yum install libpng
yum -y install libpng-devel


##如果出现 libjpeg not found
yum install libjpeg
yum -y install libjpeg-devel

##如果出现 freetype-config not found.
yum -y install freetype-devel.x86_64


#清理编译
make clean

#编译安装
make && make install
#或 
make all install
```


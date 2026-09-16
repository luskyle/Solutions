# 关于TCP

其中C代表Client，S代表Server。

### 1、建立连接

C：我连了啊（SYN）

S：好（SYN+ACK）

C：嗯（ACK）

### 2、传输数据

C：给你包

S：收到（ACK）

### 3、断开连接

C：我断了啊（FIN）

S：好，稍等下哈（ACK）

S：断吧（FIN）

C：好（ACK）
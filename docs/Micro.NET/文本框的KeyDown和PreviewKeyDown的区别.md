#### 文本框的`KeyDown`和`PreviewKeyDown`事件的区别

区别就在于`KeyDown`可检测的建没有`PreviewKeyDown`的多。后者可检测所有键，而前者只能检测特殊按键，不包括方向键。
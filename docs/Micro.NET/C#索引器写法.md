# C#索引器写法

```c#
    class Images
    {
        private ImageList imgList = null;

        public Images(ImageList imgs)
        {
            imgList = imgs;
        }

        public Image this[int index]
        {
            get
            {
                return imgList.Images[index];
            }
            set
            {
                imgList.Images[index] = value;
            }
        }
    }

```


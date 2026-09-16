2018/12/18 重载OnSizeChanged事件重设窗体

        /// <summary>
        /// 窗体大小改变事件
        /// </summary>
        /// <param name="e"></param>
        protected override void OnSizeChanged(EventArgs e)
        {
            //如启动后窗体未显示完成前不执行调用否则会出现错误
            if (!shown) return;
            //计算放大或缩小的比例
            float newX = (float)this.Width / iniFormSize.Width;
            float newY = (float)this.Height / iniFormSize.Height;
            //设置控件参数
            setControlAndChild(this, newX, newY);
            //调用基函数
            base.OnSizeChanged(e);
        }

        /// <summary>
        /// 设置控件大小
        /// </summary>
        /// <param name="ctr">控件名称</param>
        /// <param name="newX">x放大缩小倍数</param>
        /// <param name="newY">y放大缩小倍数</param>
        private void setControlAndChild(Control ctr, float newX, float newY)
        {
            //递归调用设置控件大小的函数把所有控件和子控件的大小设置一遍
            foreach (Control childCtr in ctr.Controls)
            {
                setControl(childCtr, newX, newY);
                if (childCtr.Controls.Count > 0)
                    setControlAndChild(childCtr, newX, newY);
            }
        }

        /// <summary>
        /// 设置控件大小
        /// </summary>
        /// <param name="ctr">控件名称</param>
        /// <param name="newX">x放大缩小倍数</param>
        /// <param name="newY">y放大缩小倍数</param>
        private void setControl(Control ctr, float newX, float newY)
        {
            //将tag中的数据通过“：”符号分开
            string[] para = ctr.Tag.ToString().Split(':');
            //将大小、位置和字号都按比例放大缩小
            int x = (int)(Convert.ToSingle(para[0]) * newX);
            int y = (int)(Convert.ToSingle(para[1]) * newY);
            int width = (int)(Convert.ToSingle(para[2]) * newX);
            int height = (int)(Convert.ToSingle(para[3]) * newY);
            Single fontSize = Convert.ToSingle(para[4]) * newY;
            //设置控件的大小、位置和字号
            ctr.Location = new Point(x, y);
            ctr.Size = new Size(width, height);
            ctr.Font = new Font(ctr.Font.Name, fontSize, ctr.Font.Style, ctr.Font.Unit);
        }

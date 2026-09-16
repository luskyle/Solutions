#### C#`Winform`自定义`DataGridView` 附源码

以下代码可实现这样的效果，不解释了：

![MyGif ](C:\Users\Administrator\Desktop\MyBlogs-ING\C#\images\MyGif .gif)



```csharp
    public partial class PersonalAccountForm : Form
    {
        private DataGridView dataGridView = new DataGridView();
        private VScrollBar scrollBar = new VScrollBar();        
        public static double result;//用于指示计算结果-数字
        public static double[] resultArray = null;//存放计算结果的数组

        public PersonalAccountForm()
        {
            InitializeComponent();

            //设置scrollBar属性
            scrollBar.Width = 5;
            scrollBar.Maximum = dataGridView.RowCount;//设scrollBar最大值为dataGridView的行数
            scrollBar.SmallChange = 1;
            scrollBar.LargeChange = 1;
            scrollBar.Dock = DockStyle.Right;//设置scrollBar在父控件的右侧    
            scrollBar.Hide();
            
            //scrollBar事件
            scrollBar.MouseEnter += scrollBar_MouseEnter;
            scrollBar.MouseLeave += scrollBar_MouseLeave;
            scrollBar.Scroll += scrollBar_Scroll;

            //将scrollBar添加到dataGridView中
            dataGridView.Controls.Add(scrollBar);

            //设置dataGridView属性
            dataGridView.Dock = DockStyle.Fill;
            dataGridView.ScrollBars = ScrollBars.None;            
            dataGridView.SelectionMode = DataGridViewSelectionMode.CellSelect;//一次选择一个单元格
            dataGridView.MultiSelect = false;
            dataGridView.BackgroundColor =SystemColors.Control;
            dataGridView.BorderStyle = BorderStyle.None;
            dataGridView.GridColor = Color.LightGray;
            dataGridView.RowHeadersVisible = false;//这样左侧空白列就没有了
            dataGridView.AllowUserToResizeColumns = false;
            dataGridView.AllowUserToResizeRows = false;
            dataGridView.ColumnHeadersHeightSizeMode = DataGridViewColumnHeadersHeightSizeMode.DisableResizing;//这样就禁止拖动标题行
            dataGridView.ColumnHeadersDefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleCenter;//这样标题行内容在垂直水平方向均居中
            dataGridView.DefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleCenter;//这样所有单元格内容在垂直水平方向均居中
            dataGridView.ColumnHeadersHeight = 30;//设置列标题行高为30
            dataGridView.RowTemplate.Height = 23;//设置单元格行高为23
            dataGridView.ColumnHeadersDefaultCellStyle.Font = new Font("微软雅黑",9, FontStyle.Bold);
            dataGridView.RowsDefaultCellStyle.Font = new Font("微软雅黑",8.2F, FontStyle.Regular);
            dataGridView.ColumnHeadersBorderStyle = DataGridViewHeaderBorderStyle.Single;
            dataGridView.AllowUserToAddRows = false;//这样默认就没有额外的空行
            
            //dataGridView事件
            dataGridView.KeyUp += dataGridView_KeyUp;
            dataGridView.MouseWheel += dataGridView_MouseWheel;
            dataGridView.MouseEnter += dataGridView_MouseEnter;
            dataGridView.MouseClick += dataGridView_Click;

            //dataGridView添加两列
            dataGridView.Columns.Add("column1", "");
            dataGridView.Columns.Add("column2", "花销");

            //设置dataGridView各列的属性
            dataGridView.Columns[0].Width = panel1.Width / 4;
            dataGridView.Columns[1].Width = 3*panel1.Width / 4;
            dataGridView.Columns[0].ReadOnly = true;//此列不可被用户编辑
            dataGridView.Columns[0].SortMode = DataGridViewColumnSortMode.NotSortable;//禁止第一列排序
            dataGridView.Columns[1].SortMode = DataGridViewColumnSortMode.NotSortable;//禁止第二列排序

            //设置第一行的属性
            dataGridView.Rows.Add("1");

            //将dataGridView添加到panel1中
            panel1.Controls.Add(dataGridView);

        }

        /// <summary>
        /// dataGridView鼠标点击事件
        /// </summary>
        private void dataGridView_Click(object sender, MouseEventArgs e)
        {
            ContextMenuStrip strip = new ContextMenuStrip();
            strip.ShowImageMargin = false;//设置右击菜单属性
            strip.Items.Add("删除选定行");
            strip.Items.Add("添加行");

            strip.Items[0].Click += stripItems0_Click;//弹出菜单第一项点击事件
            strip.Items[1].Click += stripItems1_Click;//弹出菜单第二项点击事件

            if (e.Button == MouseButtons.Right)//右键点击
            {
                strip.Show(this.dataGridView, e.Location);//弹出菜单
            }
        }

        /// <summary>
        /// 弹出菜单第二项点击事件
        /// </summary>
        private void stripItems1_Click(object sender, EventArgs e)
        {
            rowNo++;
            dataGridView.Rows.Add(rowNo.ToString());
            if (rowNo > 15)
            {
                scrollBarMaxinum++;
                scrollBar.Maximum = scrollBarMaxinum;
            }
        }

        /// <summary>
        /// stripItem0点击事件-删除选中行
        /// </summary>
        private void stripItems0_Click(object sender, EventArgs e)
        {
            dataGridView.Rows.RemoveAt(dataGridView.CurrentRow.Index);//删除选中行

            //给第一列（编号列）重新编号
            for (int i = 0; i < dataGridView.Rows.Count; i++)
            {
                dataGridView.Rows[i].Cells[0].Value = i+1;
            }

            rowNo = dataGridView.RowCount;//使rowNo值为当前行数

            if (scrollBarMaxinum>0)
            {
                scrollBarMaxinum--;
                scrollBar.Maximum = scrollBarMaxinum;
            }
        }

        /// <summary>
        /// 滚动条滚动事件
        /// </summary>
        private void scrollBar_Scroll(object sender, ScrollEventArgs e)
        {
            if (e.NewValue>=rowNo)//若当前值不小于行号，则不执行后面代码
            {
                return;
            }
            dataGridView.FirstDisplayedScrollingRowIndex = e.NewValue;            
        }

        /// <summary>
        /// 鼠标进入dataGridView区域事件
        /// </summary>
        private void dataGridView_MouseEnter(object sender, EventArgs e)
        {
            scrollBar.Show();

            timer.Interval = 1000;//设置时钟间隔为1s
            timer.Start();
            timer.Tick += timer_Tick;
        }

        /// <summary>
        /// 鼠标离开scrollBar事件
        /// </summary>
        private void scrollBar_MouseLeave(object sender, EventArgs e)
        {
            mouseEnterScrollBar = false;
            timer.Start();
        }

        private bool mouseEnterScrollBar = false;//该值指示鼠标是否进入scrollBar范围
        /// <summary>
        /// 鼠标进入scrollBar范围事件
        /// </summary>
        private void scrollBar_MouseEnter(object sender, EventArgs e)
        {
            mouseEnterScrollBar = true;
        }

        /// <summary>
        /// 声明一计时工具
        /// </summary>
        private Timer timer = new Timer();
        /// <summary>
        /// 鼠标滑轮滚动事件
        /// </summary>
        private void dataGridView_MouseWheel(object sender, MouseEventArgs e)
        {
            scrollBar.Show();
            timer.Interval = 1000;//设置时钟间隔为1s
            timer.Start();
            timer.Tick += timer_Tick;
        }
        
        int count = 0;//计数，指示当前是计时器开始后的第几秒
        /// <summary>
        /// Timer周期事件，每1s发生一次
        /// </summary>
        private void timer_Tick(object sender, EventArgs e)
        {
            count++;
            if (count>4)
            {
                timer.Stop();
                count = 0;
                if (!mouseEnterScrollBar)
                {
                    scrollBar.Hide();
                }
            }
        }

        int rowNo = 1;//设置最后一行的编号
        int scrollBarMaxinum = 0;//scrollBar的最大值
        /// <summary>
        /// dataGridView按键事件
        /// </summary>
        private void dataGridView_KeyUp(object sender, KeyEventArgs e)
        {
            if(e.KeyValue==13)
            {
                rowNo++;
                dataGridView.Rows.Add(rowNo.ToString());
                if (rowNo>15)
                {
                    scrollBarMaxinum++;
                    scrollBar.Maximum = scrollBarMaxinum;
                }
            }
        }

        /// <summary>
        /// Button按钮点击事件
        /// </summary>
        private void button1_Click(object sender, EventArgs e)
        {
            bool errorAccured = false;//此值指示是否检测到错误

            #region 输入验证
            for (int i = 0; i < dataGridView.RowCount; i++)
            {
                string cellValue = "";
                if (dataGridView.Rows[i].Cells[1].Value!=null)
                {
                    cellValue = dataGridView.Rows[i].Cells[1].Value.ToString();
                }
                else
                {
                    cellValue = "";
                }
                string validPattern = "^[0-9]+(.[0-9]+)?$";//匹配的类型有：0，0.0，0.00...，00.0.0.00
                string inValidPattern1 = "^[0.]{2,}$";//匹配的类型有：00，.. 
                string inValidPattern2 = "^0([0-9]){1,}.*$";//匹配的类型有：00，000，000.，000..

                if (Regex.IsMatch(cellValue, inValidPattern1))
                {
                    dataGridView.Rows[i].Cells[1].Style.BackColor = Color.FromArgb(255, 240, 240);
                    errorAccured = true;
                }
                else
                {
                    dataGridView.Rows[i].Cells[1].Style.BackColor = Color.White;
                }

                if (Regex.IsMatch(cellValue, inValidPattern2))
                {
                    dataGridView.Rows[i].Cells[1].Style.BackColor = Color.FromArgb(255, 240, 240);
                    errorAccured = true;
                }
                else
                {
                    dataGridView.Rows[i].Cells[1].Style.BackColor = Color.White;
                }

                if (!Regex.IsMatch(cellValue, validPattern))
                {
                    dataGridView.Rows[i].Cells[1].Style.BackColor = Color.FromArgb(255, 240, 240);
                    errorAccured = true;
                }
                else
                {
                    dataGridView.Rows[i].Cells[1].Style.BackColor = Color.White;
                }
            }

            #endregion

            if (errorAccured)//检测到错误则不执行后面代码
            {
                return;
            }

            double result =0;//记录数字结果
            resultArray = new double[dataGridView.RowCount];//声明一double型的数组，记录每行结果
            for (int i = 0; i < dataGridView.RowCount; i++)
            {
                result += double.Parse(dataGridView.Rows[i].Cells[1].Value.ToString());
                resultArray[i] = double.Parse(dataGridView.Rows[i].Cells[1].Value.ToString());
            }

            PersonalAccountForm.result = result;//赋值

            this.Close();//关闭当前窗体
        }

        /// <summary>
        /// 窗体加载事件
        /// </summary>
        private void PersonalAccountForm_Load(object sender, EventArgs e)
        {
            if (!(resultArray is null))
            {
                dataGridView.Rows[0].Cells[1].Value = resultArray[0];
                for (int i = 1; i < resultArray.Length; i++)
                {
                    dataGridView.Rows.Add((i + 1).ToString(), resultArray[i]);//根据记录的数组添加行
                }
            }
        }
    }

```


## 计算Excel某列是第几列

Excel列是按照`[A-Z]+`的规则编列的。往往很难算清某列是第几列。以下代码仅算两位Excel列是第几列

```csharp
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace WindowsFormsApplication1
{
    public partial class Form2 : Form
    {
        public Form2()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            Queue<int> qu = new Queue<int>();

            for (int l = 0; l < textBox1.Text.Count(); l++)
            {
                qu.Enqueue(GetChLoc(textBox1.Text[l]));
            }

            if (qu.Count == 1)
            {
                label1.Text = qu.Peek().ToString();
            }
            else
            {
                int[] vArr = qu.ToArray();

                label1.Text = (vArr[0] * 26 + vArr[1]).ToString();
            }

        }


        private int GetChLoc(char ch)
        {
            int loc = 0;

            switch (ch)
            {
                case 'A':
                    loc = 1;
                    break;
                case 'B':
                    loc = 2;
                    break;
                case 'C':
                    loc = 3;
                    break;
                case 'D':
                    loc = 4;
                    break;
                case 'E':
                    loc = 5;
                    break;
                case 'F':
                    loc = 6;
                    break;
                case 'G':
                    loc = 7;
                    break;
                case 'H':
                    loc = 8;
                    break;
                case 'I':
                    loc = 9;
                    break;
                case 'J':
                    loc = 10;
                    break;
                case 'K':
                    loc = 11;
                    break;
                case 'L':
                    loc = 12;
                    break;
                case 'M':
                    loc = 13;
                    break;
                case 'N':
                    loc = 14;
                    break;
                case 'O':
                    loc = 15;
                    break;
                case 'P':
                    loc = 16;
                    break;
                case 'Q':
                    loc = 17;
                    break;
                case 'R':
                    loc = 18;
                    break;
                case 'S':
                    loc = 19;
                    break;
                case 'T':
                    loc = 20;
                    break;
                case 'U':
                    loc = 21;
                    break;
                case 'V':
                    loc = 22;
                    break;
                case 'W':
                    loc = 23;
                    break;
                case 'X':
                    loc = 24;
                    break;
                case 'Y':
                    loc = 25;
                    break;
                case 'Z':
                    loc = 26;
                    break;

                default:
                    break;
            }

            return loc;

        }

        private void button1_Click_1(object sender, EventArgs e)
        {
            button1_Click(sender, e);
        }
    }
}

```


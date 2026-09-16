#### Code39码和扩展的Code39码C#源码

```csharp
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;
using System.Drawing.Drawing2D;
using System.IO;
using System.Drawing.Imaging;
using System.Runtime.Serialization.Formatters.Binary;
using System.Runtime.Serialization;
using System.Drawing.Printing;



namespace JHEMR.MRCATALOGWS
{
    /// </summary>
    public partial class frmBarCodePrint : Form
    {
        PrinterSettings printerSet;//打印机设置
        PageSettings pageSet; //页面设置
        Barcode b = new Barcode();
        public string m_nPatient_id = "";
        public string m_nVisit_id = "";
        public string m_strInp_N0 = "";
        public string m_strName = "";


        int m_nPrintCount = 2;
        public int m_nAutoPrint = 0;
        string m_strWidth = "600";
        string m_strHeight = "300";
        public frmBarCodePrint()
        {
            InitializeComponent();
        }

        public void InitData(string InpNo, string strName)
        {
            m_strInp_N0 = InpNo;
            m_strName = strName;
        }

        public void printBar()
        {
            txtInp_No.Text = m_strInp_N0;
            txtName.Text = m_strName;
            this.txtPrintCount.Text = "2";
            Bitmap temp = new Bitmap(1, 1);
            temp.SetPixel(0, 0, this.BackColor);
            barcode.Image = (Image)temp;

            int W = Convert.ToInt32(m_strWidth);
            int H = Convert.ToInt32(m_strHeight);
            try
            {
                b.IncludeLabel = true;
                b.m_strName = this.txtName.Text;
                //barcode.Image = b.Encode("Code 39", this.txtData.Text.Trim(), this.btnForeColor.BackColor, this.btnBackColor.BackColor, W, H);
                if (MRCatalogDAL.CommonJudge("20150527HL001"))//增加配置可以打印patient_id+visit_id  胡磊  20150527
                {
                    barcode.Image = b.Encode("Code 39", m_nPatient_id + m_nVisit_id, Color.Black, Color.White, W, H);
                }
                else
                {
                    barcode.Image = b.Encode("Code 39", this.txtInp_No.Text.Trim(), Color.Black, Color.White, W, H);
                }
                barcode.Width = barcode.Image.Width;
                barcode.Height = barcode.Image.Height;
                //barcode.Location = new Point((this.groupBox2.Location.X-this.groupBox1.Location.X + this.groupBox2.Width / 2) - barcode.Width / 2, (this.groupBox2.Location.Y + this.groupBox2.Height / 2) - barcode.Height / 2);
                barcode.Location = new Point((this.groupBox1.Location.X + this.groupBox2.Width / 2) - barcode.Width / 2, (this.groupBox2.Location.Y + this.groupBox2.Height / 2) - barcode.Height / 2);
                button1_Click(this, null);
            }//try
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }
        private void frmBarCodePrint_Load(object sender, EventArgs e)
        {
            txtInp_No.Text = m_strInp_N0;
            txtName.Text = m_strName;
            //txtInp_No.Text = m_nPatient_id;
            //txtName.Text = m_strName;
            //Bitmap temp = new Bitmap(1, 1);
            //temp.SetPixel(0, 0, this.BackColor);
            //barcode.Image = (Image)temp;

            //int W = Convert.ToInt32(m_strWidth);
            //int H = Convert.ToInt32(m_strHeight);
            //try
            //{
            //    b.IncludeLabel = true;
            //    b.m_strName = this.txtName.Text;
            //    //barcode.Image = b.Encode("Code 39", this.txtData.Text.Trim(), this.btnForeColor.BackColor, this.btnBackColor.BackColor, W, H);
            //    barcode.Image = b.Encode("Code 39", this.txtInp_No.Text.Trim(), Color.Black, Color.White, W, H);

            //    barcode.Width = barcode.Image.Width;
            //    barcode.Height = barcode.Image.Height;
            //    //barcode.Location = new Point((this.groupBox2.Location.X-this.groupBox1.Location.X + this.groupBox2.Width / 2) - barcode.Width / 2, (this.groupBox2.Location.Y + this.groupBox2.Height / 2) - barcode.Height / 2);
            //    barcode.Location = new Point((this.groupBox1.Location.X + this.groupBox2.Width / 2) - barcode.Width / 2, (this.groupBox2.Location.Y + this.groupBox2.Height / 2) - barcode.Height / 2);
            //}//try
            //catch (Exception ex)
            //{
            //    MessageBox.Show(ex.Message);
            //}
            if (m_strName.Trim() == "" || m_strInp_N0.Trim() == "")
                return;
            btnEncode_Click(this, null);
        }//Form1_Load

        private void btnEncode_Click(object sender, EventArgs e)//生成按钮
        {
            if (!MRCatalogDAL.getSqlLimt(groupBox1))
                return;
            if (txtInp_No.Text.Trim() != "")
            {
                string strSQL = "SELECT NAME FROM PAT_MASTER_INDEX WHERE INP_NO='" + txtInp_No.Text.Trim() + "'";
                object objTemp = JHEMR.EmrSysDAL.DALUse.GetSingle(strSQL);
                if (objTemp != null && objTemp.ToString() != "")
                {
                    txtName.Text = objTemp.ToString();
                }
                else
                {
                    MessageBox.Show("没有该病案号");
                    txtName.Text = "";
                    return;
                }
            }

            
            
            m_nPrintCount = Int32.Parse(txtPrintCount.Text);
            int W = Convert.ToInt32(m_strWidth);
            int H = Convert.ToInt32(m_strHeight);
            try{
                    b.IncludeLabel = true;
                    b.m_strName = this.txtName.Text;
                    //barcode.Image = b.Encode("Code 39", this.txtData.Text.Trim(), this.btnForeColor.BackColor, this.btnBackColor.BackColor, W, H);
                    if (MRCatalogDAL.CommonJudge("20150527HL001"))//增加配置可以打印patient_id+visit_id  胡磊  20150527
                    {
                        barcode.Image = b.Encode("Code 39", m_nPatient_id+m_nVisit_id, Color.Black, Color.White, W, H);
                    }
                    else
                    {
                        barcode.Image = b.Encode("Code 39", this.txtInp_No.Text.Trim(), Color.Black, Color.White, W, H);
                    }
                    barcode.Width = barcode.Image.Width;
                    barcode.Height = barcode.Image.Height;
                    //barcode.Location = new Point((this.groupBox2.Location.X-this.groupBox1.Location.X + this.groupBox2.Width / 2) - barcode.Width / 2, (this.groupBox2.Location.Y + this.groupBox2.Height / 2) - barcode.Height / 2);
                    barcode.Location = new Point((this.groupBox1.Location.X + this.groupBox2.Width / 2) - barcode.Width / 2, (this.groupBox2.Location.Y + this.groupBox2.Height / 2) - barcode.Height / 2);
            }//try
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }//catch
        }//btnEncode_Click

       

        //private void splitContainer1_SplitterMoved(object sender, SplitterEventArgs e)
        //{
        //    barcode.Location = new Point((this.groupBox2.Location.X + this.groupBox2.Width / 2) - barcode.Width / 2, (this.groupBox2.Location.Y + this.groupBox2.Height / 2) - barcode.Height / 2);
        //}//splitContainer1_SplitterMoved


        private void button1_Click(object sender, EventArgs e)
        {
            m_nPrintCount = Int32.Parse(txtPrintCount.Text);//设置打印份数
            PrintDocument pd = new PrintDocument();
            PrintSet myObj = new PrintSet();
            string strPath = System.AppDomain.CurrentDomain.BaseDirectory;

            //申明并实例化PageSetupDialog
            PageSetupDialog psDlg = new PageSetupDialog();
            //申明并实例化PrintDialog供选择打印机  胡磊 20151022
            PrintDialog pdi = new PrintDialog();
            PrintSet obj = null;
            if (pageSet == null)
            {
                try
                {
                    //反序列化获取PrintSet.bin中打印机设置
                    IFormatter formatter = new BinaryFormatter();
                    Stream stream = new FileStream(strPath + "BarPrintSetting.bin", FileMode.Open,
                    FileAccess.Read, FileShare.Read);
                    obj = (PrintSet)formatter.Deserialize(stream);
                    stream.Close();
                    pageSet = obj.PageSet;
                    printerSet = obj.PrinterSet;


                }
                catch
                {
                }
            }
            if (pageSet == null)
            {
                try
                {
                    pd.PrinterSettings.Copies = 1;
                    //相关文档及文档页面默认设置
                    psDlg.Document = pd;
                    psDlg.PageSettings = pd.DefaultPageSettings;
                    psDlg.PrinterSettings = pd.PrinterSettings;
                    psDlg.PageSettings.Margins.Top = 0;
                    
                    //显示对话框
                    if (psDlg.ShowDialog() == DialogResult.OK)
                    {
                        
                        pd.DefaultPageSettings = psDlg.PageSettings;
                        pd.PrinterSettings = psDlg.PrinterSettings;
                        pageSet = psDlg.PageSettings;
                        printerSet = psDlg.PrinterSettings;
                        try
                        {
                            //序列化保存打印机设置到PrintSet.bin文件中
                            
                            myObj.PrinterSet = printerSet;
                            myObj.PageSet = pageSet;
                            IFormatter formatter = new BinaryFormatter();
                            Stream stream = new FileStream(strPath + "BarPrintSetting.bin", FileMode.Create,
                            FileAccess.Write, FileShare.None);
                            formatter.Serialize(stream, myObj);
                            stream.Close();
                        }
                        catch
                        {
                            return;
                        }

                    }
                    else
                    {
                        return;
                    }
                }
                catch (System.Drawing.Printing.InvalidPrinterException ed)
                {
                    MessageBox.Show("未安装打印机，请进入系统控制面版添加打印机！", "打印", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                }
                catch (Exception ex)
                {
                    MessageBox.Show(ex.Message, "打印", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                }
            }
            if (printerSet == null)
            {
                try
                {
                    printerSet = obj.PrinterSet;
                    pageSet = obj.PageSet;
                }
                catch
                {
                }
            }

            //设置边距
            //Margins margin = new Margins(20, 20, 20, 20);
            //pd.DefaultPageSettings.Margins = margin;
            if (printerSet == null)
            {
                return;
            }
            else
            {
                pd.PrinterSettings = printerSet;
                pd.DefaultPageSettings = pageSet;
                //设置打印条形码大小
                pd.DefaultPageSettings.PaperSize = new System.Drawing.Printing.PaperSize("custum", (int)printerSet.DefaultPageSettings.PrintableArea.Width + 1, (int)printerSet.DefaultPageSettings.PrintableArea.Height + 1);

            }

            //打印事件设置
            pd.PrintPage += new PrintPageEventHandler(this.pd_PrintPage);
            try
            {
                //打印张数
                int index=0;
                for(index=0;index<m_nPrintCount;index++)
                    pd.Print();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "打印出错", MessageBoxButtons.OK, MessageBoxIcon.Error);
                pd.PrintController.OnEndPrint(pd, new PrintEventArgs());
            }

        }
        //打印事件处理
        private void pd_PrintPage(object sender, PrintPageEventArgs e)
        {
            //e.HasMorePages = true;
            
            int x = e.MarginBounds.X;
            int y = e.MarginBounds.Y;
            int width = barcode.Image.Width;
            int height = barcode.Image.Height;
            Rectangle destRect = new Rectangle(x, y, width, height);
            e.Graphics.DrawImage(barcode.Image, destRect, 0, 0, barcode.Image.Width, barcode.Image.Height, System.Drawing.GraphicsUnit.Pixel);
        }

        private void txtInp_No_KeyDown(object sender, KeyEventArgs e)
        {
            if(e.KeyCode==Keys.Enter)
            {
                if (txtInp_No.Text.Trim() != "")
                {
                    string strSQL = "SELECT NAME FROM PAT_MASTER_INDEX WHERE INP_NO='" + txtInp_No.Text.Trim() + "'";
                    object objTemp = JHEMR.EmrSysDAL.DALUse.GetSingle(strSQL);
                    if (objTemp != null && objTemp.ToString() != "")
                    {
                        txtName.Text = objTemp.ToString();
                        btnEncode.Focus();
                    }
                    else
                    {
                        MessageBox.Show("没有该病案号");
                        txtName.Text = "";
                    }
                }
            }
        }

       
    }//class


    class Code39 : BarcodeCommon, IBarcode
    {
        private System.Collections.Hashtable C39_Code = new System.Collections.Hashtable(); //is initialized by init_Code39()
        private System.Collections.Hashtable ExtC39_Translation = new System.Collections.Hashtable();
        private bool _AllowExtended = false;
        
        /// <summary>
        /// Encodes with Code39.
        /// </summary>
        /// <param name="input">Data to encode.</param>
        public Code39(string input)
        {
            Raw_Data = input;
        }//Code39

        /// <summary>
        /// Encodes with Code39.
        /// </summary>
        /// <param name="input">Data to encode.</param>
        /// <param name="AllowExtended">Allow Extended Code 39 (Full Ascii mode).</param>
        public Code39(string input, bool AllowExtended)
        {
            Raw_Data = input;
            _AllowExtended = AllowExtended;
        }

        /// <summary>
        /// Encode the raw data using the Code 39 algorithm.
        /// </summary>
        private string Encode_Code39()
        {
            this.init_Code39();
            this.init_ExtendedCode39();

            string strFormattedData = "*" + Raw_Data.Replace("*", "") + "*";

            if (_AllowExtended)
                InsertExtendedCharsIfNeeded(ref strFormattedData);

            this.FormattedData = strFormattedData;

            string result = "";
            foreach (char c in this.FormattedData)
            {
                try
                {
                    result += C39_Code[c].ToString();
                    result += "0";//whitespace
                }//try
                catch
                {
                    if (_AllowExtended)
                        throw new Exception("EC39-1: Invalid data.");
                    else
                        throw new Exception("EC39-1: Invalid data. (Try using Extended Code39)");
                }//catch
            }//foreach

            result = result.Substring(0, result.Length - 1);

            //clear the hashtable so it no longer takes up memory
            this.C39_Code.Clear();

            return result;
        }//Encode_Code39
        private void init_Code39()
        {
            C39_Code.Clear();
            C39_Code.Add('0', "101001101101");
            C39_Code.Add('1', "110100101011");
            C39_Code.Add('2', "101100101011");
            C39_Code.Add('3', "110110010101");
            C39_Code.Add('4', "101001101011");
            C39_Code.Add('5', "110100110101");
            C39_Code.Add('6', "101100110101");
            C39_Code.Add('7', "101001011011");
            C39_Code.Add('8', "110100101101");
            C39_Code.Add('9', "101100101101");
            C39_Code.Add('A', "110101001011");
            C39_Code.Add('B', "101101001011");
            C39_Code.Add('C', "110110100101");
            C39_Code.Add('D', "101011001011");
            C39_Code.Add('E', "110101100101");
            C39_Code.Add('F', "101101100101");
            C39_Code.Add('G', "101010011011");
            C39_Code.Add('H', "110101001101");
            C39_Code.Add('I', "101101001101");
            C39_Code.Add('J', "101011001101");
            C39_Code.Add('K', "110101010011");
            C39_Code.Add('L', "101101010011");
            C39_Code.Add('M', "110110101001");
            C39_Code.Add('N', "101011010011");
            C39_Code.Add('O', "110101101001");
            C39_Code.Add('P', "101101101001");
            C39_Code.Add('Q', "101010110011");
            C39_Code.Add('R', "110101011001");
            C39_Code.Add('S', "101101011001");
            C39_Code.Add('T', "101011011001");
            C39_Code.Add('U', "110010101011");
            C39_Code.Add('V', "100110101011");
            C39_Code.Add('W', "110011010101");
            C39_Code.Add('X', "100101101011");
            C39_Code.Add('Y', "110010110101");
            C39_Code.Add('Z', "100110110101");
            C39_Code.Add('-', "100101011011");
            C39_Code.Add('.', "110010101101");
            C39_Code.Add(' ', "100110101101");
            C39_Code.Add('$', "100100100101");
            C39_Code.Add('/', "100100101001");
            C39_Code.Add('+', "100101001001");
            C39_Code.Add('%', "101001001001");
            C39_Code.Add('*', "100101101101");
        }//init_Code39
        private void init_ExtendedCode39()
        {
            ExtC39_Translation.Clear();
            ExtC39_Translation.Add(Convert.ToChar(0).ToString(), "%U");
            ExtC39_Translation.Add(Convert.ToChar(1).ToString(), "$A");
            ExtC39_Translation.Add(Convert.ToChar(2).ToString(), "$B");
            ExtC39_Translation.Add(Convert.ToChar(3).ToString(), "$C");
            ExtC39_Translation.Add(Convert.ToChar(4).ToString(), "$D");
            ExtC39_Translation.Add(Convert.ToChar(5).ToString(), "$E");
            ExtC39_Translation.Add(Convert.ToChar(6).ToString(), "$F");
            ExtC39_Translation.Add(Convert.ToChar(7).ToString(), "$G");
            ExtC39_Translation.Add(Convert.ToChar(8).ToString(), "$H");
            ExtC39_Translation.Add(Convert.ToChar(9).ToString(), "$I");
            ExtC39_Translation.Add(Convert.ToChar(10).ToString(), "$J");
            ExtC39_Translation.Add(Convert.ToChar(11).ToString(), "$K");
            ExtC39_Translation.Add(Convert.ToChar(12).ToString(), "$L");
            ExtC39_Translation.Add(Convert.ToChar(13).ToString(), "$M");
            ExtC39_Translation.Add(Convert.ToChar(14).ToString(), "$N");
            ExtC39_Translation.Add(Convert.ToChar(15).ToString(), "$O");
            ExtC39_Translation.Add(Convert.ToChar(16).ToString(), "$P");
            ExtC39_Translation.Add(Convert.ToChar(17).ToString(), "$Q");
            ExtC39_Translation.Add(Convert.ToChar(18).ToString(), "$R");
            ExtC39_Translation.Add(Convert.ToChar(19).ToString(), "$S");
            ExtC39_Translation.Add(Convert.ToChar(20).ToString(), "$T");
            ExtC39_Translation.Add(Convert.ToChar(21).ToString(), "$U");
            ExtC39_Translation.Add(Convert.ToChar(22).ToString(), "$V");
            ExtC39_Translation.Add(Convert.ToChar(23).ToString(), "$W");
            ExtC39_Translation.Add(Convert.ToChar(24).ToString(), "$X");
            ExtC39_Translation.Add(Convert.ToChar(25).ToString(), "$Y");
            ExtC39_Translation.Add(Convert.ToChar(26).ToString(), "$Z");
            ExtC39_Translation.Add(Convert.ToChar(27).ToString(), "%A");
            ExtC39_Translation.Add(Convert.ToChar(28).ToString(), "%B");
            ExtC39_Translation.Add(Convert.ToChar(29).ToString(), "%C");
            ExtC39_Translation.Add(Convert.ToChar(30).ToString(), "%D");
            ExtC39_Translation.Add(Convert.ToChar(31).ToString(), "%E");
            ExtC39_Translation.Add("!", "/A");
            ExtC39_Translation.Add("\"", "/B");
            ExtC39_Translation.Add("#", "/C");
            ExtC39_Translation.Add("$", "/D");
            ExtC39_Translation.Add("%", "/E");
            ExtC39_Translation.Add("&", "/F");
            ExtC39_Translation.Add("'", "/G");
            ExtC39_Translation.Add("(", "/H");
            ExtC39_Translation.Add(")", "/I");
            ExtC39_Translation.Add("*", "/J");
            ExtC39_Translation.Add("+", "/K");
            ExtC39_Translation.Add(",", "/L");
            ExtC39_Translation.Add("/", "/O");
            ExtC39_Translation.Add(":", "/Z");
            ExtC39_Translation.Add(";", "%F");
            ExtC39_Translation.Add("<", "%G");
            ExtC39_Translation.Add("=", "%H");
            ExtC39_Translation.Add(">", "%I");
            ExtC39_Translation.Add("?", "%J");
            ExtC39_Translation.Add("[", "%K");
            ExtC39_Translation.Add("\\", "%L");
            ExtC39_Translation.Add("]", "%M");
            ExtC39_Translation.Add("^", "%N");
            ExtC39_Translation.Add("_", "%O");
            ExtC39_Translation.Add("{", "%P");
            ExtC39_Translation.Add("|", "%Q");
            ExtC39_Translation.Add("}", "%R");
            ExtC39_Translation.Add("~", "%S");
            ExtC39_Translation.Add("`", "%W");
            ExtC39_Translation.Add("@", "%V");
            ExtC39_Translation.Add("a", "+A");
            ExtC39_Translation.Add("b", "+B");
            ExtC39_Translation.Add("c", "+C");
            ExtC39_Translation.Add("d", "+D");
            ExtC39_Translation.Add("e", "+E");
            ExtC39_Translation.Add("f", "+F");
            ExtC39_Translation.Add("g", "+G");
            ExtC39_Translation.Add("h", "+H");
            ExtC39_Translation.Add("i", "+I");
            ExtC39_Translation.Add("j", "+J");
            ExtC39_Translation.Add("k", "+K");
            ExtC39_Translation.Add("l", "+L");
            ExtC39_Translation.Add("m", "+M");
            ExtC39_Translation.Add("n", "+N");
            ExtC39_Translation.Add("o", "+O");
            ExtC39_Translation.Add("p", "+P");
            ExtC39_Translation.Add("q", "+Q");
            ExtC39_Translation.Add("r", "+R");
            ExtC39_Translation.Add("s", "+S");
            ExtC39_Translation.Add("t", "+T");
            ExtC39_Translation.Add("u", "+U");
            ExtC39_Translation.Add("v", "+V");
            ExtC39_Translation.Add("w", "+W");
            ExtC39_Translation.Add("x", "+X");
            ExtC39_Translation.Add("y", "+Y");
            ExtC39_Translation.Add("z", "+Z");
            ExtC39_Translation.Add(Convert.ToChar(127).ToString(), "%T"); //also %X, %Y, %Z 
        }
        private void InsertExtendedCharsIfNeeded(ref string FormattedData)
        {
            string output = "";
            foreach (char c in Raw_Data)
            {
                try
                {
                    string s = C39_Code[c].ToString();
                    output += c;
                }//try
                catch
                {
                    //insert extended substitution
                    object oTrans = ExtC39_Translation[c.ToString()];
                    output += oTrans.ToString();
                }//catch
            }//foreach

            FormattedData = output;
        }

        #region IBarcode Members

        public string Encoded_Value
        {
            get { return Encode_Code39(); }
        }

        #endregion
    }//class

    abstract class BarcodeCommon
    {
        protected string Raw_Data = "";
        protected string Formatted_Data = "";

        public string RawData
        {
            get { return this.Raw_Data; }
        }

        public string FormattedData
        {
            get { return this.Formatted_Data; }
            set { this.Formatted_Data = value; }
        }
    }

    public class Barcode : IDisposable
    {
        public string m_strName = "";
        #region Variables
        private string Raw_Data = "";
        private string Formatted_Data = "";
        private string Encoded_Value = "";
        private string _Country_Assigning_Manufacturer_Code = "N/A";
        private string Encoded_Type = "Code 39";
        private Image _Encoded_Image = null;
        private Color _ForeColor = Color.Black;
        private Color _BackColor = Color.White;
        private int _Width = 300;
        private int _Height = 150;
        private bool _IncludeLabel = false;
        private double _EncodingTime = 0;
        //private ImageFormat _ImageFormat = ImageFormat.Jpeg;
        #endregion

        #region Constructors
        /// <summary>
        /// Default constructor.  Does not populate the raw data.  MUST be done via the RawData property before encoding.
        /// </summary>
        public Barcode()
        {
            //constructor
        }//Barcode
        /// <summary>
        /// Constructor. Populates the raw data. No whitespace will be added before or after the barcode.
        /// </summary>
        /// <param name="data">String to be encoded.</param>
        public Barcode(string data)
        {
            //constructor
            this.Raw_Data = data;
        }//Barcode
        public Barcode(string data, string iType)
        {
            this.Raw_Data = data;
            this.Encoded_Type = iType;
        }
        #endregion

        #region Properties
        /// <summary>
        /// Gets the formatted data.
        /// </summary>
        public string FormattedData
        {
            get { return Formatted_Data; }
        }//FormattedData
        /// <summary>
        /// Gets or sets the raw data to encode.
        /// </summary>
        public string RawData
        {
            get { return Raw_Data; }
            set { Raw_Data = value; }
        }//RawData
        /// <summary>
        /// Gets the encoded value.
        /// </summary>
        public string EncodedValue
        {
            get { return Encoded_Value; }
        }//EncodedValue
        /// <summary>
        /// Gets the Country that assigned the Manufacturer Code.
        /// </summary>
        public string Country_Assigning_Manufacturer_Code
        {
            get { return _Country_Assigning_Manufacturer_Code; }
        }//Country_Assigning_Manufacturer_Code
        /// <summary>
        /// Gets or sets the Encoded Type (ex. UPC-A, EAN-13 ... etc)
        /// </summary>
        public string EncodedType
        {
            set { Encoded_Type = value; }
            get { return Encoded_Type; }
        }//EncodedType
        /// <summary>
        /// Gets the Image of the generated barcode.
        /// </summary>
        public Image EncodedImage
        {
            get
            {
                return _Encoded_Image;
            }
        }//EncodedImage
        /// <summary>
        /// Gets or sets the color of the bars. (Default is black)
        /// </summary>
        public Color ForeColor
        {
            get { return this._ForeColor; }
            set { this._ForeColor = value; }
        }//ForeColor
        /// <summary>
        /// Gets or sets the background color. (Default is white)
        /// </summary>
        public Color BackColor
        {
            get { return this._BackColor; }
            set { this._BackColor = value; }
        }//BackColor
        /// <summary>
        /// Gets or sets the width of the image to be drawn. (Default is 300 pixels)
        /// </summary>
        public int Width
        {
            get { return _Width; }
            set { _Width = value; }
        }
        /// <summary>
        /// Gets or sets the height of the image to be drawn. (Default is 150 pixels)
        /// </summary>
        public int Height
        {
            get { return _Height; }
            set { _Height = value; }
        }
        /// <summary>
        /// Gets or sets whether a label should be drawn below the image.
        /// </summary>
        public bool IncludeLabel
        {
            set { this._IncludeLabel = value; }
            get { return this._IncludeLabel; }
        }
        /// <summary>
        /// Gets or sets the amount of time in milliseconds that it took to encode and draw the barcode.
        /// </summary>
        public double EncodingTime
        {
            get { return _EncodingTime; }
            set { _EncodingTime = value; }
        }
        /// Gets or sets the image format to use when encoding and returning images. (Jpeg is default)
        /// </summary>
        //public ImageFormat ImageFormat
        //{
        //    get { return _ImageFormat; }
        //    set { _ImageFormat = value; }
        //}
        #endregion

        #region Functions
        #region General Encode
        /// <summary>
        /// Encodes the raw data into binary form representing bars and spaces.  Also generates an Image of the barcode.
        /// </summary>
        /// <param name="iType">Type of encoding to use.</param>
        /// <param name="StringToEncode">Raw data to encode.</param>
        /// <param name="Width">Width of the resulting barcode.(pixels)</param>
        /// <param name="Height">Height of the resulting barcode.(pixels)</param>
        /// <returns>Image representing the barcode.</returns>
        public Image Encode(string iType, string StringToEncode, int Width, int Height)
        {
            this.Width = Width;
            this.Height = Height;
            return Encode(iType, StringToEncode);
        }//Encode(TYPE, string, int, int)
        /// <summary>
        /// Encodes the raw data into binary form representing bars and spaces.  Also generates an Image of the barcode.
        /// </summary>
        /// <param name="iType">Type of encoding to use.</param>
        /// <param name="StringToEncode">Raw data to encode.</param>
        /// <param name="DrawColor">Foreground color</param>
        /// <param name="BackColor">Background color</param>
        /// <param name="Width">Width of the resulting barcode.(pixels)</param>
        /// <param name="Height">Height of the resulting barcode.(pixels)</param>
        /// <returns>Image representing the barcode.</returns>
        public Image Encode(string iType, string StringToEncode, Color ForeColor, Color BackColor, int Width, int Height)
        {
            this.Width = Width;
            this.Height = Height;
            return Encode(iType, StringToEncode, ForeColor, BackColor);
        }//Encode(TYPE, string, Color, Color, int, int)
        /// <summary>
        /// Encodes the raw data into binary form representing bars and spaces.  Also generates an Image of the barcode.
        /// </summary>
        /// <param name="iType">Type of encoding to use.</param>
        /// <param name="StringToEncode">Raw data to encode.</param>
        /// <param name="DrawColor">Foreground color</param>
        /// <param name="BackColor">Background color</param>
        /// <returns>Image representing the barcode.</returns>
        public Image Encode(string iType, string StringToEncode, Color ForeColor, Color BackColor)
        {
            this.BackColor = BackColor;
            this.ForeColor = ForeColor;
            return Encode(iType, StringToEncode);
        }//(Image)Encode(Type, string, Color, Color)
        /// <summary>
        /// Encodes the raw data into binary form representing bars and spaces.  Also generates an Image of the barcode.
        /// </summary>
        /// <param name="iType">Type of encoding to use.</param>
        /// <param name="StringToEncode">Raw data to encode.</param>
        /// <returns>Image representing the barcode.</returns>
        public Image Encode(string iType, string StringToEncode)
        {
            Raw_Data = StringToEncode;
            return Encode(iType);
        }//(Image)Encode(TYPE, string)
        /// <summary>
        /// Encodes the raw data into binary form representing bars and spaces.  Also generates an Image of the barcode.
        /// </summary>
        /// <param name="iType">Type of encoding to use.</param>
        internal Image Encode(string iType)
        {
            Encoded_Type = iType;
            return Encode();
        }//Encode()
        /// <summary>
        /// Encodes the raw data into binary form representing bars and spaces.
        /// </summary>
        internal Image Encode()
        {
            DateTime dtStartTime = DateTime.Now;

            //make sure there is something to encode
            if (Raw_Data.Trim() == "")
                throw new Exception("EENCODE-1: Input data not allowed to be blank.");

            //if (this.EncodedType == TYPE.UNSPECIFIED) 
            //    throw new Exception("EENCODE-2: Symbology type not allowed to be unspecified.");

            this.Encoded_Value = "";
            this._Country_Assigning_Manufacturer_Code = "N/A";

            IBarcode ibarcode;
            ibarcode = new Code39(Raw_Data);
            this.Encoded_Value = ibarcode.Encoded_Value;
            this.Raw_Data = ibarcode.RawData;
            this.Formatted_Data = ibarcode.FormattedData;
            this._EncodingTime = ((TimeSpan)(DateTime.Now - dtStartTime)).TotalMilliseconds;
            _Encoded_Image = (Image)Generate_Image();



            return EncodedImage;
        }//Encode
        #endregion

        #region Image Functions
        /// <summary>
        /// Gets a bitmap representation of the encoded data.
        /// </summary>
        /// <returns>Bitmap of encoded value.</returns>
        private Bitmap Generate_Image()
        {
            if (Encoded_Value == "") throw new Exception("EGENERATE_IMAGE-1: Must be encoded first.");
            Bitmap b = null;


            b = new Bitmap(Width, Height);

            int iBarWidth = 1;//Width / Encoded_Value.Length+1;
            int shiftAdjustment = (Width % Encoded_Value.Length) / 2;

            if (iBarWidth <= 0)
                throw new Exception("EGENERATE_IMAGE-2: Image size specified not large enough to draw image. (Bar size determined to be less than 1 pixel)");

            //draw image
            int pos = 0;
            //Label_GenericUp((Image)b);
            using (Graphics g = Graphics.FromImage(b))
            {
                //clears the image and colors the entire background
                g.Clear(BackColor);

                //lines are fBarWidth wide so draw the appropriate color line vertically
                Pen pen = new Pen(ForeColor, iBarWidth);
                pen.Alignment = PenAlignment.Right;


                while (pos < Encoded_Value.Length)
                {
                    if (Encoded_Value[pos] == '1')
                        g.DrawLine(pen, new Point(pos * iBarWidth + 170, 90), new Point(pos * iBarWidth + 170, 110));//条形码左右位置
                        //g.DrawLine(pen, new Point(pos * iBarWidth + shiftAdjustment, 20), new Point(pos * iBarWidth + shiftAdjustment, Height));
                    
                    pos++;
                }//while
            }//using

            //if (IncludeLabel)
            //    Label_Generic((Image)b);
            if (IncludeLabel)
                Label_Generic((Image)b);

            //_Encoded_Image = (Image)b;

            return b;
        }//Generate_Image



        #endregion

        #region Label Generation
        
        private Image Label_Generic(Image img)
        {
            try
            {
                System.Drawing.Font font = new Font("Microsoft Sans Serif", 56, FontStyle.Bold);//编号大小
                System.Drawing.Font font1 = new Font("Microsoft Sans Serif", 15, FontStyle.Regular);//姓名字体大小

                using (Graphics g = Graphics.FromImage(img))
                {
                    g.DrawImage(img, (float)0, (float)0);

                    g.SmoothingMode = SmoothingMode.HighQuality;
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    g.CompositingQuality = CompositingQuality.HighQuality;

                    //draw datastring under the barcode image

                    //color a background color box at the bottom of the barcode to hold the string of data
                    g.FillRectangle(new SolidBrush(this.BackColor), new Rectangle(0, img.Height - 16, img.Width, 16));

                    //draw datastring under the barcode image
                    StringFormat f = new StringFormat();
                    f.Alignment = StringAlignment.Center;

                    int iBarWidth = iBarWidth = Width / Encoded_Value.Length;
                    int shiftAdjustment = (Width % Encoded_Value.Length) / 2;
                    string strLabelText = (this.FormattedData.Trim() != "") ? this.FormattedData : this.RawData;
                    strLabelText = strLabelText.Replace("*", "");
                    //g.DrawString(strLabelText, font, new SolidBrush(this.ForeColor), (float)(img.Width / 2), img.Height - 16, f);
                    g.DrawString(strLabelText, font, new SolidBrush(this.ForeColor), (float)(img.Width /2), 10, f);
                    g.DrawString(m_strName, font1, new SolidBrush(this.ForeColor), (float)(90), 90, f);//姓名的位置
                    g.Save();
                }//using
                return img;
            }//try
            catch (Exception ex)
            {
                throw new Exception("ELABEL_GENERIC-1: " + ex.Message);
            }//catch
        }//Label_Generic
        private Image Label_GenericUp(Image img)
        {
            try
            {
                System.Drawing.Font font = new Font("Microsoft Sans Serif", 10, FontStyle.Bold);

                using (Graphics g = Graphics.FromImage(img))
                {
                    g.DrawImage(img, (float)0, (float)0);

                    g.SmoothingMode = SmoothingMode.HighQuality;
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    g.CompositingQuality = CompositingQuality.HighQuality;

                    //color a background color box at the bottom of the barcode to hold the string of data
                    g.FillRectangle(new SolidBrush(this.BackColor), new Rectangle(0, 0, img.Width, 16));

                    //draw datastring under the barcode image
                    StringFormat f = new StringFormat();
                    f.Alignment = StringAlignment.Center;

                    string strLabelText = (this.FormattedData.Trim() != "") ? this.FormattedData : this.RawData;

                    //g.DrawString(strLabelText, font, new SolidBrush(this.ForeColor), (float)(img.Width / 2), img.Height - 16, f);
                    g.DrawString("woshiwo", font, new SolidBrush(this.ForeColor), (float)(img.Width / 2), img.Height - 16, f);
                    g.Save();
                }//using
                return img;
            }//try
            catch (Exception ex)
            {
                throw new Exception("ELABEL_GENERIC-1: " + ex.Message);
            }//catch
        }//Label_Generic
        #endregion
        #endregion

        #region IDisposable Members

        public void Dispose()
        {
            try
            {
            }//try
            catch (Exception ex)
            {
                throw new Exception("EDISPOSE-1: " + ex.Message);
            }//catch
        }

        #endregion
    }//Barcode Class

    interface IBarcode
    {
        string Encoded_Value
        {
            get;
        }//Encoded_Value

        string RawData
        {
            get;
        }//Raw_Data

        string FormattedData
        {
            get;
        }//FormattedData
    }

    [Serializable]
    class PrintSet
    {
        PrinterSettings printerSet;   //打印机设置

        public PrinterSettings PrinterSet
        {
            get { return printerSet; }
            set { printerSet = value; }
        }
        PageSettings pageSet; //页面设置

        public PageSettings PageSet
        {
            get { return pageSet; }
            set { pageSet = value; }
        }


    }
}
```




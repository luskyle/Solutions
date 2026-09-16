##### 主机名称 and IP 地址

```c#
using System.Net;	
void Button2_Click(System.Object sender, System.EventArgs e)
{
  IPHostEntry ipEntry = Dns.GetHostByName (Dns.GetHostName());
  IPAddress [] addr = ipEntry.AddressList;
          
  for (int i = 0; i < addr.Length; i++)
  {
    MessageBox.Show ("Host name: "+Environment.UserName+"\r\n"+"IP-            
    Addresse: "+addr[i].ToString ());
   }
 }

```

##### 置位/复位/切换寄存器的位

```c#
void btnSetBit0_Click(System.Object sender, System.EventArgs e)
{
	Globals.Tags.MB0.Value |= 1;	// Set Bit 0 in Tag “MB0”		
}

void btnReSetBit1_Click(System.Object sender, System.EventArgs e)
{
	Globals.Tags.MB0.Value &= ~2;	// Reset Bit 1 in Tag “MB0”			
}

void btnToggleBit2_Click(System.Object sender, System.EventArgs e)
{
	Globals.Tags.MB0.Value ^= 4;	// Toggle Bit 2 in Tag “MB0”		
}

```

##### 平台检查

```c#
if (System.Environment.OSVersion.Platform == PlatformID.WinCE)
```

#####  TimeSpan TS时间间隔 

```c#
TimeSpan TS;
DateTime myDate;

private void OnTimerTick(Object sender, EventArgs e)
{        
	TS = myDate - DateTime.Parse(DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));
	anRestzeit.Text = TS.TotalSeconds.ToString();
}

```

##### 定时同步PLC屏 

```c#
using System.Runtime.InteropServices;

public partial class SCM_TimeSync
{
	private struct SYSTEMTIME
	{
		public short wYear,wMonth,wDayOfWeek,wDay,wHour,wMinute,wSecond,wMilliseconds;
	}

	// Windows CE (dll)
	[DllImport("coredll.dll", SetLastError = true)]
	static extern bool SetLocalTime(ref SYSTEMTIME time);

	[DllImport("coredll.dll", SetLastError = true)]
	static extern bool GetLocalTime(ref SYSTEMTIME time);

	#region //Synchronization PLC -> Panel
	public bool SetHMITime(int Year, int Month, int Day, int Hour, int Minute, int Seconds)
	{
		try
		{
			SYSTEMTIME st = new SYSTEMTIME();
			
			GetLocalTime(ref st);

			st.wYear = (short)(2000 + Year);
			st.wMonth = (short)(Month);
			st.wDay = (short)(Day);
			st.wHour = (short)(Hour);
			st.wMinute = (short)(Minute);
			st.wSecond = (short)(Seconds);
			st.wMilliseconds = 0;
				
			SetLocalTime(ref st);
		
		return (true);
		}
		catch
		{
			return(false);
		}
	}
	#endregion
}

```

##### 读文件/写文件到Textbox 

```c#
using System.IO;
    
    public partial class ScriptModule1
    {
		public string ReadText(string path)
		{
			string text = "";
			try
			{
			 using (StreamReader reader = new StreamReader(path))
				{
				 text = reader.ReadToEnd();
				}
			}
			catch{
				MessageBox.Show("Error accessing file");
			}
			return text;
		}
		
     public void WriteText(string path, string text)
	   {
		  try {
			 using (StreamWriter writer = new StreamWriter(path))
			 {
			  writer.Write(text);
			 }
			}
			catch{
				MessageBox.Show("Error accessing file");
			}
	    }
	}
}

```

##### 保存对话框

```c#
using System.IO;

void btnSaveAs_Click(System.Object sender, System.EventArgs e)
{
string path = string.Empty;
	SaveFileDialog sfd1 = new SaveFileDialog();
	sfd1.InitialDirectory = "c:\\" ;
	sfd1.Filter = "INI Files (*.ini)|*.ini|All Files (*.*)|*.*";
	sfd1.Title = "Choose File Path" ;
	sfd1.ShowDialog();
	path = sfd1.FileName;

	if (sfd1.FileName != String.Empty)
	{
		TextWriter writer = new StreamWriter(path);
		foreach (string Item in lbFileContent.Items)
		writer.Write(Item + "\r\n");
		writer.Close();
	}
}


```

##### 发邮件 

```c#
using System.Net.Mail;
			
void Button1_Click(System.Object sender, System.EventArgs e)
{
  MailMessage sm = new MailMessage();
			
  try 
  {	        
    sm.From = new MailAddress ("iX@cb.de");
    sm.To.Add ("receiver@testdomain.de");
    sm.Subject = "Value of 'MailValue' is too high!";
    sm.Body = "Value of 'MailValue' is: "+Globals.Tags.MailValue.Value;
			
    SmtpClient smtp = new SmtpClient("127.0.0.1");
    smtp.Send (sm);
  }
  catch (Exception ex)
  {
    MessageBox.Show("Attention! "+ex.ToString());
  }
}

```

##### 访问Access数据库

```c#
using System.Data.OleDb;
using System.Data;
public partial class Screen2
{
 OleDbConnection odbc;
void Button1_Click(System.Object sender, System.EventArgs e)
	{		
	  try 
	  {	        
	    odbc = new OleDbConnection("Provider=Microsoft.Jet.OLEDB.4.0; Data
                     Source=c:\\db1.mdb");
	    odbc.Open();
				
	    OleDbCommand cmd = new OleDbCommand("SELECT * FROM Datenbank", odbc);    
	    OleDbDataAdapter odbda = new OleDbDataAdapter(cmd);

           DataTable dt=new DataTable();
	    odbda.Fill(dt);

	    DataGridView1.DataSource = dt;
	   }
	   catch (Exception ex)
	   {
	    MessageBox.Show("Fehler in der Datenbankverbindung\r\n\n" +ex.ToString());
  	   }
	   finally
	   {
	    odbc.Close();	
	   }
	}
}

```

##### 通过“itextsharp.dll”创建带有图片的PDF文件 

##### 

```c#
using iTextSharp.text.pdf;
using iTextSharp.text;
using System.IO;
 
void CreatePDF_Click(System.Object sender, System.EventArgs e)
{
 Document doc = new Document(iTextSharp.text.PageSize.LETTER, 10, 10, 42, 35);
   try
   {
      string pdfFilePath = "C:/myPdf.pdf";
      PdfWriter wri = PdfWriter.GetInstance(doc, new FileStream(pdfFilePath,
      FileMode.Create));
     
      doc.Open();
      Paragraph paragraph = new Paragraph("TEST STRING");
           
      string imageFilePath = "C:/Sunset.jpg";
      iTextSharp.text.Image jpg = iTextSharp.text.Image.GetInstance(imageFilePath);

      jpg.ScaleToFit(280f, 260f);
      jpg.SpacingBefore = 30f;
      jpg.SpacingAfter = 1f;
      jpg.Alignment = Element.ALIGN_CENTER;

      doc.Add(paragraph);             
      doc.Add(jpg);
    }
    catch (Exception ex)
    {
       MessageBox.Show("Exception ausgelöst!\r\n\n" +ex.ToString());
    }
    finally
    {
     doc.Close();
    }
}

```

##### 通过“itextsharp.dll”创建带有图片的PDF文件 

```
using iTextSharp.text.pdf;
using iTextSharp.text;
using System.IO;
 
void CreatePDF_Click(System.Object sender, System.EventArgs e)
{
 Document doc = new Document(iTextSharp.text.PageSize.LETTER, 10, 10, 42, 35);
   try
   {
      string pdfFilePath = "C:/myPdf.pdf";
      PdfWriter wri = PdfWriter.GetInstance(doc, new FileStream(pdfFilePath,
      FileMode.Create));
     
      doc.Open();
      Paragraph paragraph = new Paragraph("TEST STRING");
           
      string imageFilePath = "C:/Sunset.jpg";
      iTextSharp.text.Image jpg = iTextSharp.text.Image.GetInstance(imageFilePath);

      jpg.ScaleToFit(280f, 260f);
      jpg.SpacingBefore = 30f;
      jpg.SpacingAfter = 1f;
      jpg.Alignment = Element.ALIGN_CENTER;

      doc.Add(paragraph);             
      doc.Add(jpg);
    }
    catch (Exception ex)
    {
       MessageBox.Show("Exception ausgelöst!\r\n\n" +ex.ToString());
    }
    finally
    {
     doc.Close();
    }
}

```

##### 用带有页码号的指定PDF查看器打开PDF 文件

```c#
void OpenPDF_Click(System.Object sender, System.EventArgs e)
{
 	System.Diagnostics.Process openpdf = new System.Diagnostics.Process();
 	openpdf.StartInfo.FileName = @"C:\Program Files\Adobe\Reader 9.0\Reader\AcroRd32.exe";
openpdf.StartInfo.Arguments = @"/a ""page=3"" c:\testpdf.pdf"; 
openpdf.StartInfo.CreateNoWindow = false;
openpdf.Start();
}

```

##### 调用虚拟键盘

```c#
void btnNumKB_Click(System.Object sender, System.EventArgs e)
{
IKeyboardHelper helper = new Neo.ApplicationFramework.Common.Keyboard.KeyboardHelperCF();
			helper.ShowNumericKeyboard(new Rectangle(0, 0, 0, 0));
}
		
void btnFullKB_Click(System.Object sender, System.EventArgs e)
{
IKeyboardHelper helper = new Neo.ApplicationFramework.Common.Keyboard.KeyboardHelperCF();
			helper.ShowFullKeyboard(new Rectangle(0, 0, 0, 0));
}

```

##### 生成要打印的图片

```c#
int width, height;
width = System.Windows.Forms.SystemInformation.PrimaryMonitorSize.Width;
height = System.Windows.Forms.SystemInformation.PrimaryMonitorSize.Height;

try
{	        
    Bitmap printscreen = new Bitmap(width, height);  	
    Graphics graphics = Graphics.FromImage(printscreen as Image);  
    graphics.CopyFromScreen(0, 0, 0, 0, printscreen.Size);  
    printscreen.Save(@"C:\Printscreen.jpg", ImageFormat.Jpeg);  
}
catch (Exception ex)
{
	MessageBox.Show("Error: "+ex.ToString());
}


```

##### 通过脚本打印图片

```c#
using System.Diagnostics

void btnPrint_Click(System.Object sender, System.EventArgs e)
{
	Process printJob = new Process();
	printJob.StartInfo.FileName = "C:\\Printscreen.jpg";
	printJob.StartInfo.UseShellExecute = true;
	printJob.StartInfo.Verb = "print";
	printJob.Start();

	printJob.WaitForExit(5000);
	printJob.CloseMainWindow();
printJob.Close();
}

```

##### WPF旋转

```c#
using System.Windows.Media;
using System.Windows;    
    
    public partial class Effects
    {
		public void ApplyAnimation(object control, int angle)
		{
			FrameworkElement element = control as FrameworkElement;
			// If the element wasn't a FrameworkElement, abort.
			if(element == null)
				return;
			
			RotateTransform rotateTransform = new RotateTransform(angle);
			element.RenderTransform = rotateTransform;	
		}
    }

```

##### 写数据库的内容到CSV文件

```c#
using (StreamWriter sw = new StreamWriter("C:\\test.csv", false, System.Text.Encoding.Default))
{
	int numberOfColumns = dt.Columns.Count;
					
	for (int i = 0; i < numberOfColumns; i++)
	{
		sw.Write(dt.Columns[i]);
		if (i < numberOfColumns - 1)
			sw.Write(";");
	}
	sw.Write(sw.NewLine);
						

	foreach (DataRow dr in dt.Rows)
	{
		for (int i = 0; i < numberOfColumns; i++)
		{
			sw.Write(dr[i].ToString());
			if (i < numberOfColumns - 1)
				sw.Write(";");
		}
		sw.Write(sw.NewLine);
	}
}

```


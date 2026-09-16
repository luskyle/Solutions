2018/12/20 NPOI导Excel参考

using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using NPOI.HSSF.Util;
using System.IO;
using System.Collections.Generic;
using System;
using System.Data;

namespace Project202
{
    class DataOut
    {

        /// <summary>
        /// 
        /// </summary>
        public DataOut()
        {

        }
        /// <summary>
        /// 
        /// </summary>
        /// <param name="dt"></param>
        /// <param name="headLine"></param>
        /// <returns></returns>
        public int Save(DataTable dt, string[] headLine)
        {
            FileStream fileExcel;
            HSSFWorkbook workBook = new HSSFWorkbook();
            HSSFSheet Sheet1;

            ////设计文件名形如20170630-1，不存在时建立20170630-1文件，若文件无法打开则存为20170630-2文件，以此类推
            int largestNum = 0;
            string fileName;
            if(dt.TableName =="Data")
                fileName = DateTime.Now.ToString("导出数据(yyyyMMdd-HH时mm分ss秒)");//文件名的前六位设为当前日期
            else
                fileName = DateTime.Now.ToString("导出日志(yyyyMMdd-HH时mm分ss秒)");


            if (Directory.Exists(Setting.savePath) == false)
                Directory.CreateDirectory(Setting.savePath);//建立路径
            else
            {
                DirectoryInfo di = new DirectoryInfo(Setting.savePath);
                foreach (FileInfo file in di.GetFiles("*.xls"))//获取所有后缀为.xls的文件
                {
                    if (file.Name.StartsWith(fileName))//检索名以当天日期开头的文件
                    {
                        int tempNum;
                        try
                        {
                            tempNum = int.Parse(file.Name.Substring(7, (int)file.Name.Length - 11));//获取现存文件中日期20170630-1中-后的序号
                            largestNum = tempNum > largestNum ? tempNum : largestNum;//在largestNum中记录序号的最大值
                        }
                        catch
                        {
                            largestNum = 1;
                        }
                    }
                }

            }
            fileName = Setting.savePath + fileName;

            if (++largestNum > 1)
                fileName += "-" + (largestNum - 1).ToString() + ".xls";
            else
                fileName += ".xls";
            if (workBook.GetSheet("数据") == null)
            {
                Sheet1 = (HSSFSheet)workBook.CreateSheet("数据");
            }
            else
                Sheet1 = (HSSFSheet)workBook.GetSheet("数据");

            Sheet1.CreateRow(Sheet1.LastRowNum);
            Sheet1.SetColumnWidth(0, 24 * 256);
            Sheet1.SetColumnWidth(1, 13 * 256);
            Sheet1.SetColumnWidth(2, 13 * 256);
            HSSFRow sheetRow = (HSSFRow)Sheet1.GetRow(Sheet1.LastRowNum);
            HSSFCell[] sheetCell = new HSSFCell[dt.Columns.Count];

            if (Sheet1.LastRowNum == 0)
            {
                HSSFCellStyle headStyle = workBook.CreateCellStyle() as HSSFCellStyle;
                headStyle.Alignment = NPOI.SS.UserModel.HorizontalAlignment.Center;
                HSSFFont headFont = workBook.CreateFont() as HSSFFont;
                headFont.FontHeightInPoints = 10;
                headFont.Boldweight = 700;
                headStyle.SetFont(headFont);

                HSSFCell[] headCell = new HSSFCell[headLine.Length];
                for (int j = 0; j < headLine.Length; j++)
                {
                    headCell[j] = (HSSFCell)sheetRow.CreateCell(j);
                    headCell[j].SetCellValue(headLine[j]);
                    headCell[j].CellStyle = headStyle;
                }

                Sheet1.CreateRow(Sheet1.LastRowNum + 1);
                sheetRow = (HSSFRow)Sheet1.GetRow(Sheet1.LastRowNum);
            }

            ICellStyle cellStyle = workBook.CreateCellStyle();
            cellStyle.Alignment = HorizontalAlignment.Center;
            //IFont font = workBook.CreateFont();
            //font.FontHeightInPoints = 10;
            //cellStyle.SetFont(font);
            ICellStyle cellStyleText = workBook.CreateCellStyle();
            cellStyleText.Alignment = HorizontalAlignment.Center;
            //cellStyleText.SetFont(font);
            cellStyleText.DataFormat = HSSFDataFormat.GetBuiltinFormat("text");
            HSSFCellStyle rowStyle = workBook.CreateCellStyle() as HSSFCellStyle;
            Sheet1.SetDefaultColumnStyle(3, cellStyle);
            Sheet1.SetDefaultColumnStyle(0, cellStyleText);
            Sheet1.SetDefaultColumnStyle(1, cellStyleText);
            Sheet1.SetDefaultColumnStyle(2, cellStyleText);
            
            ICellStyle tempStyle = workBook.CreateCellStyle();
            tempStyle.CloneStyleFrom(cellStyleText);
            //tempStyle.FillForegroundColor = HSSFColor.Grey25Percent.Index;
            //tempStyle.FillPattern = FillPattern.SolidForeground;
            IFont tempFont = workBook.CreateFont();
            tempFont.Color = HSSFColor.Red.Index;
            tempStyle.SetFont(tempFont);

            for (int i = 0;i<dt.Rows.Count;++i)
            {
                for (int j = 0; j < headLine.Length; j++)
                {
                    sheetCell[j] = (HSSFCell)sheetRow.CreateCell(j);
                    string strValue = dt.Rows[i][j].ToString();

                    switch (dt.Columns[j].DataType.ToString())
                    {
                        case "System.Int16": //整型  
                        case "System.Int32":
                        case "System.Int64":
                            int intV = 0;
                            int.TryParse(strValue, out intV);
                            sheetCell[j].SetCellValue(intV);
                            break;
                        default:
                            sheetCell[j].SetCellValue(strValue);
                            if (strValue == "True")
                                sheetCell[j].CellStyle = tempStyle;
                            break;
                    }
                }

                if (Sheet1.LastRowNum < 65535)
                    Sheet1.CreateRow(Sheet1.LastRowNum + 1);

                sheetRow = (HSSFRow)Sheet1.GetRow(Sheet1.LastRowNum);

            }
            lock (this)
            {

                fileExcel = new FileStream(fileName, FileMode.Create, FileAccess.ReadWrite);
                workBook.Write(fileExcel);
                fileExcel.Close();
                return Sheet1.LastRowNum-1;
            }
        }
    }
}


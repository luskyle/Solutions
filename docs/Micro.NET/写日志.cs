2019/3/23 –¥»’÷æ

        public static void WriteLog(string str)
        {
            string path = Application.StartupPath + @"\a.txt";

            using (StreamWriter sw = new StreamWriter(path, true, System.Text.Encoding.UTF8))
            {
                sw.WriteLine(str);
                sw.Flush();
                sw.Close();
                sw.Dispose();
            }
        }

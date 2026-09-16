# C#深度总结-文件IO

```csharp
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IO
{
    class Program
    {
        static void Main(string[] args)
        {
            string path = @"C:\Users\Administrator\Desktop\练习\files\新建文本文档.txt";

            ReadFile(path);
            WriteFile(@"C:\Users\Administrator\Desktop\练习\files\新建文本文档 - 副本.txt", "hello world");
            AppendContent(path, "append a line");
            ClearFile(path);
            CreateFile(@"C:\Users\Administrator\Desktop\练习\files\a.xxx");

            Console.ReadKey();
        }

        /// <summary>
        /// 读文件
        /// </summary>
        static void ReadFile(string path)
        {
            using (StreamReader sr = new StreamReader(path))
            {
                Console.WriteLine(sr.ReadToEnd());
            }

            ////逐行读取
            //while (!sr.EndOfStream)
            //    Console.WriteLine(sr.ReadLine());
        }

        /// <summary>
        /// 写文件
        /// </summary>
        static void WriteFile(string path, string content)
        {
            StreamWriter sw = new StreamWriter(path);

            sw.WriteLine(content);
            sw.Flush();
            sw.Close();

            ////或
            //File.WriteAllText(path, content);
        }

        /// <summary>
        /// 追加一行数据
        /// </summary>
        static void AppendContent(string path, string content)
        {
            using (StreamWriter sw = new StreamWriter(path, true))
            {
                sw.WriteLine(content);
            }
        }

        /// <summary>
        /// 清空文件
        /// </summary>
        static void ClearFile(string path)
        {
            FileStream fs = new FileStream(path, FileMode.Truncate);
            fs.Flush();
            fs.Close();
        }

        /// <summary>
        /// 创建文件
        /// </summary>
        /// <param name="path"></param>
        static void CreateFile(string path)
        {
            File.Create(path);
        }

        /// <summary>
        /// 删除文件
        /// </summary>
        /// <param name="path"></param>
        static void DeleteFile(string path)
        {
            File.Delete(path);
        }
    }
}

//不推荐其它方式
```


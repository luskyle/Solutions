# C#深度总结-文件目录搜索

```csharp
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SearchFiles
{
    class Program
    {
        static void Main()
        {
            string path = @"C:\Users\Administrator\Desktop\练习\files";
            GetAllDirectorys(path, false);
            GetAllFiles(path, false);
            GetFiles(path, ".txt");
            Console.ReadKey();
        }

        /// <summary>
        /// 获取路径下所有目录
        /// </summary>
        static void GetAllDirectorys(string path, bool fullName = true)
        {
            DirectoryInfo directoryInfo = new DirectoryInfo(path);
            DirectoryInfo[] directories = directoryInfo.GetDirectories();

            foreach (var item in directories)
            {
                if (fullName)
                    Console.WriteLine(item.FullName);
                else
                    Console.WriteLine(item);
            }
        }

        /// <summary>
        /// 获取路径下所有文件
        /// </summary>
        static void GetAllFiles(string path, bool fullName = true)
        {
            DirectoryInfo directoryInfo = new DirectoryInfo(path);
            FileSystemInfo[] fileSystemInfo = directoryInfo.GetFileSystemInfos();

            foreach (FileSystemInfo item in fileSystemInfo)
            {
                if (item is DirectoryInfo)
                {
                    GetAllFiles(item.FullName, fullName);
                }
                else
                {
                    if (fullName)
                        Console.WriteLine(item.FullName);
                    else
                        Console.WriteLine(item);
                }
            }           
        }

        /// <summary>
        /// 获取目录下所有指定后缀的文件
        /// </summary>
        static void GetFiles(string path, string ext, bool fullName = true)
        {
            DirectoryInfo directoryInfo = new DirectoryInfo(path);
            FileSystemInfo[] fileSystemInfos = directoryInfo.GetFileSystemInfos();

            foreach (var item in fileSystemInfos)
            {
                if (item.Extension == ext)
                {
                    if (fullName)
                        Console.WriteLine(item.FullName);
                    else
                        Console.WriteLine(item);
                }
            }

        }

    }
}

```


2019/3/25 字节数组转16进制字符串

   public static string ByteToString(byte[] b)
   {
      string str = "";
      for (int i = 0; i < b.Length; i++)
      {
        str += Convert.ToString(b[i], 16).PadLeft(2, '0').ToUpper() + " ";
      }
      return str;
   }
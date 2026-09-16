
2018/12/18 注册表操作

    public static class Register
    {
        private const string Path = "SOFTWARE\\Biological Monitor";
        public static void ReadAll()
        {
            RegistryKey key = Registry.LocalMachine.OpenSubKey(Path);
            if (key == null) return;
            string[] subKeyName = key.GetValueNames();
            Type t = typeof(Setting);
            foreach (string keyName in subKeyName)
            {
                foreach(FieldInfo fi in t.GetFields())
                {
                    if (fi.Name == keyName)
                        if (fi.FieldType == typeof(bool))
                            fi.SetValue(null, bool.Parse(key.GetValue(keyName).ToString()));
                        else if (fi.FieldType == typeof(int))
                            fi.SetValue(null, int.Parse(key.GetValue(keyName).ToString()));//读取整型变量的值
                        else if (fi.FieldType == typeof(double))
                            fi.SetValue(null, double.Parse(key.GetValue(keyName).ToString()));
                        else
                            fi.SetValue(null, key.GetValue(keyName).ToString());//读取字符串变量的值
                }
            }
        }

        /// <summary>
        /// 
        /// </summary>
        public static void Write()
        {
            RegistryKey key = Registry.LocalMachine.CreateSubKey(Path);
            Type t = typeof(Setting);
            foreach (FieldInfo fi in t.GetFields())
            {
                if (fi.GetValue(null) != null)
                    key.SetValue(fi.Name, fi.GetValue(null));
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="ItemName"></param>
        /// <param name="Item"></param>
    public static void WriteSingle(string ItemName,object Item)
        {

            RegistryKey key = Registry.LocalMachine.CreateSubKey(Path);
            key.SetValue(ItemName, Item);

        }
    }



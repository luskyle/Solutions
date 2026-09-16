2018/12/20 反射获取某个结构中所有公开的字段

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

public struct Setting
{
	public static int PMLimit;
	public static int PMLimit1;
	public static int MMLimit;
	public static string savePath;
	public static bool ShowCode;
	public static string Password;

	public static void RecoverDefault()
	{
		savePath = Application.StartupPath + "\\生物战剂报警监测软件数据\\";
		PMLimit = 5000;
		PMLimit1 = 5000;
		MMLimit = 5000;
		ShowCode = false;
		Password = "123456";
	}
}

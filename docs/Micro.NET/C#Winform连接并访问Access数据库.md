#### C#`Winform`连接并访问Access数据库

Access新建了一个名为user的数据库，其中有张名为`UserInfor`的表。将之添入项目中后，访问数据表中数据。这样做：

```c#
OleDbConnection mycon = null;
OleDbDataReader myReader = null;
string str = "";
try
{
  string strcon = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=user.mdb;";
  mycon = new OleDbConnection(strcon);
  mycon.Open();
  string sql = "SELECT * FROM UserInfor";
  OleDbCommand mycom = new OleDbCommand(sql, mycon);
  myReader = mycom.ExecuteReader();
  while (myReader.Read())
  {
  str += myReader.GetString(0) + " " + myReader.GetString(1);
  }

  MessageBox.Show(str);
}
finally
{
  myReader.Close();
  mycon.Close();
}

```


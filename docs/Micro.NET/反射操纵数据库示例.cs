2018/12/18 反射操纵数据库示例

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Reflection;
using System.Data.SQLite;
using System.Data;

namespace Project202
{
    /// <summary>
    /// 将查询、插入数据的操作转换成SQL语句，采用反射新建表时无需改动，但 BuildTable()函数需要增加创建表的SQL语句
    /// </summary>
    /// <typeparam name="T">实体类类型</typeparam>
    static class DAL<T> where T :Model
    {
        public static bool Add(T model)
        {
            StringBuilder sb = new StringBuilder(150);
            string tableName = typeof(T).Name;
            sb.Append("insert into "+tableName.Substring(0, tableName.Length -5)+"(");

            Type t = typeof(T);
            int count=0;
            
            foreach (PropertyInfo pi in t.GetProperties())
            {
                if (pi.GetValue(model, null) != null)
                    sb.Append((count++==0? null: ",") + pi.Name);
            }
            
            sb.Append(") values(");
            SQLiteParameter[] parameters = new SQLiteParameter[count+1];
            
           count = 0;
            foreach (PropertyInfo pi in t.GetProperties())
            {
                if (pi.GetValue(model, null) != null)
                {
                    parameters[count] = new SQLiteParameter("@" + pi.Name, pi.GetType());
                    parameters[count].Value = pi.GetValue(model, null);
                    sb.Append((count++ == 0 ? "@" : ",@") + pi.Name);
                }
            }
            sb.Append(");");
            try
            {
                int rows = DbHelper.ExecuteSql(sb.ToString(), parameters);
                if (rows > 0)
                    return true;
                else
                    return false;
            }

            catch (SQLiteException e)
            {
                if (e.Message.IndexOf("no such table") >= 0 )
                    BuildTable();

                return Add(model);
            }


        }

        /// <summary>
        /// 用于创建表
        /// </summary>
        public static void BuildTable()
        {
            string sqlCmd="";
            if (typeof(T).Name == "DataModel")
                sqlCmd = @"CREATE TABLE Data(number integer primary key,recordTime string not null ,device integer not null,alarm boolean default(0),dataValue integer not null); ";
            else if (typeof(T).Name == "LogModel")
                sqlCmd = @"CREATE TABLE Log(number integer primary key,recordTime string not null ,device integer not null,content string);";
          //  sqlCmd = @"CREATE TABLE Data(number integer primary key,recordTime datatime not null default(datetime('now', 'localtime')),device integer not null,alarm boolean default(0),dataValue integer not null); ";


            DbHelper.ExecuteSql(sqlCmd);
        }


        public static bool Delete(T equalModel = default(T), T greaterModel = default(T), T lessModel = default(T))
        {
            StringBuilder sb = new StringBuilder(150);
            string tableName = typeof(T).Name;
            sb.Append("delete from " + tableName.Substring(0, tableName.Length - 5) + " where 1=1");

            
            Type t = typeof(T);
            SQLiteParameter[] parameters = new SQLiteParameter[t.GetProperties().Count()*3];
            int count = 0;
            if (equalModel != null)
                foreach (PropertyInfo pi in t.GetProperties())
                {
                    if (pi.GetValue(equalModel, null) != null)
                    {
                        sb.Append((" and ") + pi.Name + "=@" +pi.Name);
                        parameters[count] = new SQLiteParameter("@" + pi.Name, pi.GetType());
                        parameters[count++].Value = pi.GetValue(equalModel, null);

                    }
                }

            if (greaterModel != null)
                foreach (PropertyInfo pi in t.GetProperties())
                {
                    if (pi.GetValue(greaterModel, null) != null)
                    {
                        sb.Append((" and ") + pi.Name + ">=@" + pi.Name);
                        parameters[count] = new SQLiteParameter("@" + pi.Name, pi.GetType());
                        parameters[count++].Value = pi.GetValue(greaterModel, null);
                    }
                }

            if (lessModel != null)
                foreach (PropertyInfo pi in t.GetProperties())
                {
                    if (pi.GetValue(lessModel, null) != null)
                    {
                        sb.Append((" and ") + pi.Name + "<=@" + pi.Name);
                        parameters[count] = new SQLiteParameter("@" + pi.Name, pi.GetType());
                        parameters[count++].Value = pi.GetValue(lessModel, null);
                    }
                }

            int rows = DbHelper.ExecuteSql(sb.ToString(), parameters);
            if (rows > 0)
                return true;
            else
                return false;

        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="equalModel"></param>
        /// <param name="greaterModel"></param>
        /// <param name="lessModel"></param>
        /// <returns></returns>
        public static DataSet Query(T equalModel=default(T),T greaterModel= default(T), T lessModel= default(T))
        {
            StringBuilder sb = new StringBuilder(150);
            string tableName = typeof(T).Name;

            sb.Append("select * from "+tableName.Substring(0, tableName.Length -5)+" where 1=1");

            Type t = typeof(T);
            SQLiteParameter[] parameters = new SQLiteParameter[t.GetProperties().Count() * 3];
            int count = 0;
            if (equalModel != null)
            foreach (PropertyInfo pi in t.GetProperties())
            {
                    if (pi.GetValue(equalModel, null) != null)
                    {
                        sb.Append(" and " + pi.Name + "=" + pi.GetValue(equalModel, null));
                        parameters[count] = new SQLiteParameter("@" + pi.Name, pi.GetType());
                        parameters[count++].Value = pi.GetValue(equalModel, null);
                    }
            }

            if (greaterModel != null)
                foreach (PropertyInfo pi in t.GetProperties())
            {
                    if (pi.GetValue(greaterModel, null) != null)
                    {
                        sb.Append(" and " + pi.Name + ">=" + pi.GetValue(greaterModel, null));
                        parameters[count] = new SQLiteParameter("@" + pi.Name, pi.GetType());
                        parameters[count++].Value = pi.GetValue(greaterModel, null);
                    }
            }

            if (lessModel != null)
                foreach (PropertyInfo pi in t.GetProperties())
            {
                    if (pi.GetValue(lessModel, null) != null)
                    {
                        sb.Append(" and " + pi.Name + "<=" + pi.GetValue(lessModel, null));
                        parameters[count] = new SQLiteParameter("@" + pi.Name, pi.GetType());
                        parameters[count++].Value = pi.GetValue(lessModel, null);
                    }
            }
            try
            {
                return DbHelper.Query(sb.ToString(), parameters);
            }
            catch(SQLiteException e)
            {
                if (e.Message.IndexOf("no such table") >= 0)
                    BuildTable();
                return Query(equalModel, greaterModel, lessModel);
            }
        }



    }

    
}

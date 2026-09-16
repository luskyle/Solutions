```c#
            //保存了手术统计报表信息的表
            DataTable dt = new DataTable();
            dt.Columns.Add("operation_name", Type.GetType("System.String"));
            dt.Columns.Add("daoci", Type.GetType("System.String"));
            dt.Columns.Add("deadthCount", Type.GetType("System.String"));
            dt.Columns.Add("avgDaysInHospital", Type.GetType("System.String"));
            dt.Columns.Add("avgCosts", Type.GetType("System.String"));

            //新添一行数据到数据集中
            DataRow dr0 = dt.NewRow();
            dr0["operation_name"] = textBox1.Text;//手术名称
            dr0["daoci"] = daoci;//倒次
            dr0["deadthCount"] = deadthCount;//死亡人次
            dr0["avgDaysInHospital"] = string.Format("{0:F2}", avgDaysInHospital);//平均住院天数
            dr0["avgCosts"] = string.Format("{0:F2}", avgCosts);//平均住院费用
            dt.Rows.Add(dr0);

            gvOperationSheetInfo.DataSource = dt;
```

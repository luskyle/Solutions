# DataGridView 实战：产线界面的"钉子户"

!!! note "状态"
    已定稿（2026-09-16）。

产线客户端里出现频率最高的控件没有之一：工单列表、参数表、记录明细、花销录入全用它。多行数据 + 就地编辑 + 排序 + 行操作，十几年积累的 16 篇笔记整理成一篇，按"编辑、行、列、数据源、排序、滚动"六个维度讲透，每段都给可抄代码。

## 一、编辑与数据源：两个"改了没生效"的真相

### 真相一：单元格改完了，DataTable 可能没变

这是最阴的一篇。用户在 DataGridView 里改了某个单元格，程序从绑定的 DataTable 取值去更新数据库——结果发现**数据根本没改**。

原因：单元格还处于编辑状态时，DataGridView 的显示值并没有同步回绑定的 DataTable。只有"结束编辑"（焦点离开/按 Enter）才同步。

解药就一行——**在取数/更新数据库之前，先 `EndEdit()`**：

```csharp
// 用户改完单元格后，不点别处直接按"保存"，改了的数据不会进 DataTable
// 取数前强制让所有单元格结束编辑，值才真正同步
private void btnSave_Click(object sender, EventArgs e)
{
    dataGridView1.EndEdit();          // 关键：先结束编辑
    DataTable dt = SaveData(dataGridView1);   // 再取数
    // 接下来用 dt 更新数据库就不会漏改
}
```

> 原笔记原话：`EndEdit()` 用于让 DataGridView 控件所有单元格结束编辑状态、失去焦点。这一步不做，"看起来改过了，实际上 DataTable 还是旧值"。

### 真相二：`DataSource = 新表` 之后，旧引用没换

原笔记记了一个很妙的坑：给 DataGridView 绑定 `table0`，执行某些操作后想换成 `table1`，写了 `dataGridView1.DataSource = table1`，界面确实显示新表了——但如果你在代码里还用着 `table0` 去操作"当前数据"，操作的其实是旧表。

原笔记给出的解法是**让旧引用指向新表**：

```csharp
table0 = table1;   // 让 old 引用指向新表，后续所有对 table0 的操作都作用于新表
```

现在的标准做法（设置 `DataSource` 会重建绑定，多数场景有效），但**这两种写法最稳的组合是**：先 `table0 = table1` 保持引用一致，再 `dgv.DataSource = table0` 刷新界面。核心原则一句话：**界面显示和数据引用要指向同一个对象，别让它们各说各话。**

### 工具：DataGridView 转 DataTable 标准写法

```csharp
private DataTable SaveData(DataGridView dgv)
{
    DataTable dt = new DataTable();

    // 用列名建列（不是列索引，防止顺序被挪乱）
    foreach (DataGridViewColumn item in dgv.Columns)
        dt.Columns.Add(item.Name);

    foreach (DataGridViewRow item in dgv.Rows)
    {
        DataRow dr = dt.NewRow();
        foreach (DataGridViewCell cell in item.Cells)
            dr[cell.ColumnIndex] = cell.Value;
        dt.Rows.Add(dr);
    }
    return dt;
}
```

## 二、单元格编辑的三大拦截

### 1. 判断"数据到底改没改"（Enter 监听）

思路：`CellBeginEdit` 记下旧值，`CellEndEdit` 比较新值，变了就标色提醒：

```csharp
object oldValue = null;

private void DataGridView1_CellBeginEdit(object sender, DataGridViewCellCancelEventArgs e)
{
    oldValue = dataGridView1.CurrentCell.Value;      // 开始编辑前记住旧值
}

private void DataGridView1_CellEndEdit(object sender, DataGridViewCellEventArgs e)
{
    if (!Equals(oldValue, dataGridView1.CurrentCell.Value))
    {
        dataGridView1.CurrentCell.Style.BackColor = Color.Pink;   // 改动过，标出来
    }
}
```

（原笔记用 `!=` 比较，注意引用类型用 `Equals` 更稳。）

### 2. 只允许编辑 CheckBox 列

```csharp
grid.CellBeginEdit += Grid_CellBeginEdit;

private void Grid_CellBeginEdit(object sender, DataGridViewCellCancelEventArgs e)
{
    // 不是 CheckBox 列的单元格，取消编辑
    if (grid.Columns[e.ColumnIndex].CellType != typeof(DataGridViewCheckBoxCell))
    {
        e.Cancel = true;
    }
}
```

### 3. ComboBox 列取值

```csharp
// 就一行，注意列名（这里 treat_result 是 ComboBox 列名）
string value = dgr.Cells["treat_result"].Value.ToString();
```

### 附：遍历一列数据，记得判空

```csharp
foreach (DataGridViewRow dgr in dataGridView1.Rows)
{
    if (dgr.Cells["Column1"].Value == null)
        break;                       // 末尾的空行 value 为 null，直接 ToString 会异常
    result += dgr.Cells["Column1"].Value.ToString();
}
```

## 三、行操作：移动、复制、删除

### 1. 上移/下移：DataTable 版本（推荐）

直接挪 DataGridView 的行（逐个 Cell 交换）很啰嗦，还限死列数。先动 DataTable 再回绑，干净利落：

```csharp
// 下移
private void btnDown_Click(object sender, EventArgs e)
{
    if (dtCopy == null) return;
    int currentRow = dataGridView1.CurrentCell.RowIndex;
    if (currentRow == dtCopy.Rows.Count - 1 || currentRow == -1) return;

    DataRow tempRow = dtCopy.NewRow();
    for (int i = 0; i < dtCopy.Columns.Count; i++)
        tempRow[i] = dtCopy.Rows[currentRow][i];

    dtCopy.Rows.InsertAt(tempRow, currentRow + 2);   // 插到下一行后面
    dtCopy.Rows.RemoveAt(currentRow);                // 删掉原位
    dataGridView1.Rows[currentRow + 1].Selected = true;
    dataGridView1.CurrentCell = dataGridView1.Rows[currentRow + 1].Cells[0];
}

// 上移：把 InsertAt/RemoveAt 改成 currentRow - 1 / currentRow + 1 即可
```

（原笔记另有"逐个 Cell 拷贝交换"的版本——列固定为 4 列时可用，通用性不如 DataTable 版。）

### 2. 复制最后一行并标色

```csharp
int lstRow = dataGridView1.Rows.Count - 1;
for (int i = 0; i < dataGridView1.Columns.Count; i++)
{
    dataGridView1.Rows[lstRow].Cells[i].Value = dataGridView1.Rows[lstRow - 1].Cells[i].Value;
    dataGridView1.Rows[lstRow].Cells[i].Style.BackColor = Color.YellowGreen;   // 新行标色
}
dataGridView1.CurrentCell = dataGridView1.Rows[lstRow].Cells[0];
```

### 3. 删除行 + 重新编号（右键菜单版）

自绘示例里的经典组合拳：右键弹菜单 → 删除选中行 → 第一列（编号列）重新从 1 排：

```csharp
private void dataGridView_Click(object sender, MouseEventArgs e)
{
    if (e.Button != MouseButtons.Right) return;

    ContextMenuStrip strip = new ContextMenuStrip();
    strip.ShowImageMargin = false;
    strip.Items.Add("删除选定行");
    strip.Items.Add("添加行");
    strip.Items[0].Click += (s, ev) => RemoveSelectedRow();
    strip.Items[1].Click += (s, ev) => dataGridView1.Rows.Add((dataGridView1.RowCount + 1).ToString());
    strip.Show(dataGridView1, e.Location);
}

private void RemoveSelectedRow()
{
    dataGridView1.Rows.RemoveAt(dataGridView1.CurrentRow.Index);

    // 删完重新编号：第一列 = 行号
    for (int i = 0; i < dataGridView1.Rows.Count; i++)
        dataGridView1.Rows[i].Cells[0].Value = i + 1;
}
```

## 四、排序：三种情况三种打法

### 0. 明确正解：系统自带排序

Microsoft 自己做好了——**要排序时显式调 `Sort`，别自己写排序逻辑**：

```csharp
int selcol = dataGridView1.CurrentCell.ColumnIndex;
dataGridView1.Sort(dataGridView1.Columns[selcol], ListSortDirection.Ascending);
```

### 1. 数字列排序的坑：字符串排序 10 < 9

列内容都是数字（工号、序号、数量），默认字符串排序会排成 `1, 10, 11, 2, ...`。原笔记的解法：先探测列里**没有字母**，再按 `int.Parse` 数字排序，空行置底：

```csharp
int selcol = dataGridView1.CurrentCell.ColumnIndex;

// 探测：该列是否含字母（含字母就当文本列，跳过数字排序）
var hasLetter = dtCopy.Select()
    .Any(item => Regex.IsMatch(item.ItemArray[selcol]?.ToString() ?? "", @"[A-Za-z]"));

if (!hasLetter)
{
    // 数字排序：空行置底，非空行按数值升序
    dtCopy = dtCopy.Clone();
    foreach (var item in dtCopy.Select().Where(r => r[selcol].ToString() == ""))
        dtCopy.ImportRow(item);                       // 空行先放进来
    foreach (var item in dtCopy.Select().Where(r => r[selcol].ToString() != "")
                                      .OrderBy(r => int.Parse(r[selcol].ToString())))
        dtCopy.ImportRow(item);                       // 再按数字排非空行
    dataGridView1.DataSource = dtCopy;
}
```

> 这是原笔记思路的压缩版（原版用两段 LINQ 查询逐行复制）。要点：**空值永远置底**、**数值排序必须 parse**。

### 2. 判断列是否含英文字母

独立小工具，也常用于"这列到底是文本还是数字"的判定：

```csharp
int selcol = dataGridView1.CurrentCell.ColumnIndex;
var dr = dtCopy.Select()
    .Where(item => Regex.IsMatch(item.ItemArray[selcol]?.ToString() ?? "", @"[A-Za-z]"));
if (dr.Count() == 0)
{
    // 没有字母 → 可按数字处理
}
```

## 五、选择：点列头选中整列

```csharp
private void DataGridView1_CellClick(object sender, DataGridViewCellEventArgs e)
{
    if (e.RowIndex == -1)   // 点的是列头（行号为 -1）
    {
        dataGridView1.SelectionMode = DataGridViewSelectionMode.ColumnHeaderSelect;
        dataGridView1.Columns[e.ColumnIndex].Selected = true;   // 立刻选中整列
        selectedColumn = e.ColumnIndex;
    }
    else
    {
        dataGridView1.SelectionMode = DataGridViewSelectionMode.CellSelect;   // 回到单格选择
    }
    dataGridView1.BeginEdit(false);
}
```

**坑**：切回 `CellSelect` 一定要切，否则一直停留在整列选择模式，后面点单元格会连同整列一起选。

## 六、自定义滚动条：默认滚动条"不听话"时

自绘示例的场景：行高不一、跨行内容需要精细控制滚动时，系统滚动条满足不了，就自己上一个：

```csharp
VScrollBar scrollBar = new VScrollBar();
scrollBar.Dock = DockStyle.Right;
scrollBar.Width = 5;
dataGridView1.Controls.Add(scrollBar);          // 滚动条叠到 Grid 上
dataGridView1.ScrollBars = ScrollBars.None;     // 关掉系统滚动条

// 滚动条拖动 → 程序化滚动
private void scrollBar_Scroll(object sender, ScrollEventArgs e)
{
    dataGridView1.FirstDisplayedScrollingRowIndex = e.NewValue;
}

// 鼠标移入 Grid 显示滚动条，离开数秒后自动隐藏（原笔记的 Timer 玩法）
```

配套的界面属性也很有用（自绘示例里都有）：`RowHeadersVisible = false` 去掉左侧空白列、`AllowUserToResizeColumns/Rows = false` 锁列宽、`DefaultCellStyle.Alignment = MiddleCenter` 内容居中、`ColumnHeadersHeight` 控制标题行高、`AllowUserToAddRows = false` 去掉末尾空行。

**坑**：自定义滚动条要维护 `Maxium` 与行数同步（增删行时手动加/减，原笔记里就有这个逻辑）；只监听 `Scroll` 不够，滚轮也要接（`MouseWheel` → 同步 `FirstDisplayedScrollingRowIndex`），否则滚轮和滚动条各滚各的。

## 结语

DataGridView 的使用守则三句话：

1. **编辑先 `EndEdit`**，否则取数取到旧值；
2. **排序认准 `Sort`**，数字列手动排必须 parse + 空值置底；
3. **行操作先动 DataTable**，别逐 Cell 拷贝。

## 参考资料（本站素材）

- [dataGridView EndEdit方法作用](../ETC/dataGridView%20EndEdit方法作用.md)
- [重新给datagridview设置数据源谨记的一件事](../Micro.NET/重新给datagridview设置数据源谨记的一件事.md)
- [datagridview数据转DataTable标准写法](../Micro.NET/datagridview数据转DataTable标准写法.md)
- [最简单按下Enter时判断datagridView单元格数据是否改变方法](../Micro.NET/最简单按下Enter时判断datagridView单元格数据是否改变方法.md)
- [Datagridview只允许编辑CheckBox列](../Micro.NET/Datagridview只允许编辑CheckBox列.md)
- [获取DataGridView中ComboBox列某格的值](../Micro.NET/获取DataGridView中ComboBox列某格的值.md)
- [循环遍历DataGridView各行某列数据](../Micro.NET/循环遍历DataGridView各行某列数据.md)
- [连续移动datagridview某行](../Micro.NET/连续移动datagridview某行.md)
- [移动DataGridView选中行](../Micro.NET/移动DataGridView选中行.md)
- [复制datagridview最后一行数据并设置颜色标出](../Micro.NET/复制datagridview最后一行数据并设置颜色标出.md)
- [DataGridView编辑完某个单元格自动根据某列排序](../Micro.NET/DataGridView编辑完某个单元格自动根据某列排序.md)
- [datagridview排序列值可空的数字列LINQ](../Micro.NET/datagridview排序列值可空的数字列LINQ.md)
- [LINQ判断datagridview选中列是否有英文字母](../Micro.NET/LINQ判断datagridview选中列是否有英文字母.md)
- [点击DataGridView列头立刻选中此列](../Micro.NET/点击DataGridView列头立刻选中此列.md)
- [C#Winform自定义DataGridView 附源码](../Micro.NET/C%23Winform自定义DataGridView%20附源码.md)
- [C#Winform实现拉动滚动条时dataGridView项也滚动](../Micro.NET/C%23Winform实现拉动滚动条时dataGridView项也滚动.md)
#### dataGridView EndEdit()方法作用

`EndEdit()`用于让dataGridView控件所有单元格结束编辑状态，失去焦点。

这个操作很关键，在实际开发中，往往会将DataGridView中的数据与内存中的某`DataTable`关联（绑定）起来。用户在与`DataGridView`控件交互完（修改单元格数据）后，如果不再点击下`DataGridView`其它位置，或是让程序的其它控件获得焦点，那么这个单元格内被修改后的数据就没有与内存中的`DataTable`某行某列的值对应成功。也就是看起来好像`DataGridView`中这个位置的数据改过了，但是实际上`DataTable`对应的值还是未修改之前的值。假如要跟数据库进行交互（从DataTable取值，然后更新数据库中相应表），那么就会出现数据没有被修改的现象。

所以，最好的办法是在执行更新数据库操作前，让`DataTable`中的值确实与`DataGridView`控件值同步。`DataGridView`控件的 `EndEdit()`就是这个作用。
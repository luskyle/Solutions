#### 利用user32.dll拖动窗体

```c#
private void Form1_MouseDown(object sender, MouseEventArgs e)
{
    if (e.Button== MouseButtons.Left)
    {
        ReleaseCapture();
        SendMessage(base.Handle, 0x112, 0xf012, 0);
    }
}

[DllImport("user32.dll")]
public static extern bool ReleaseCapture();

[DllImport("user32.dll")]
public static extern bool SendMessage(IntPtr hwnd, int wMsg, int wParam, int IParam);

```


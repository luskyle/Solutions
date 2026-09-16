# powershell 打开记事本并输入内容


```powershell
Write-Output("=========================================================")

$x = [Win32Invoke.Win32API]::ProcessLaunched('notepad')
if ($x -gt 0)
{
    Write-Output('notepad already launched, kill....')
    Stop-Process -Name notepad
}
Start-Process notepad
Start-Sleep(2)
$notepad_ptr = [Win32Invoke.Win32API]::FindWindowByName("无标题 - 记事本")
Write-Output('Parent Window Ptr：' + $notepad_ptr)

$notepad_input_ptr = [Win32Invoke.Win32API]::FindWindowChild("无标题 - 记事本", '')
Write-Output('Child Window Ptr：' + $notepad_input_ptr)

$result = [Win32Invoke.Win32API]::SendMessage($notepad_input_ptr, [int]0x000C, 'helloxxxxx')

if ($result -gt 0)
{
    Write-Output('文本发送成功')
}
 else
 {
      Write-Output('文本发送失败')
 }
Write-Output("=========================================================")
```


# Powershell 终止某个端口所在进程

```Powershell
function Shutdown
{
  param
  (
    [Parameter(Mandatory=$true,ValueFromPipeline=$true)]
    [Object[]]
    $InputObject
  )
   
  process
  {  	
    $InputObject | ForEach-Object {
      $element = $_
	
    if (!$element.ToString().Equals("")){
        echo "-------------------------------"
        echo "Closing Port $element ..."
	    $infor = netstat -ano|findstr $element       

        if($infor -ne $null){
            $array = $infor.split(" ",[StringSplitOptions]::RemoveEmptyEntries)
            $portProcessID = $array[4]
		    echo "Kill Process $portProcessID ..."
		    taskkill /pid $portProcessID /f
            echo "Press Enter to Exit..."
        }else{
            echo "No Port Exist. Press Enter to Exit..."
        }
	 }else{
        echo "No Port to Close.Press Enter to Exit..."
     }			
    }
  }
}

netstat -ano

echo "------------------------------------"
echo "Input the port you want to close"

Read-Host|Shutdown

Read-Host|Out-Null
```
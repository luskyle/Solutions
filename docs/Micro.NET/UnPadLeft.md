# UnPadLeft


``` C#

private string UnPadLeft(string str)
{
    int index = 0;
    for (int i = 0; i < str.Length; i++)
    {
        if (str[i] == '0')
        {
            continue;
        }
        else
        {
            index = i;
            break;
        }
    }

    if (index == 0)
    {
        return "0";
    }
    else
    {
        return str.Substring(index, str.Length - index);
    }
}

```

00000 => 0

001000 => 1000

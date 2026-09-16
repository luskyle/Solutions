# 想google到东西，还用什么代理？

## Examples

*Note: the demo Heroku app runs on a free dyno which sleep after idle. A request to sleeping dyno may take even 30 seconds.*

**The most minimal example, render google.com**

https://url-to-pdf-api.herokuapp.com/api/render?url=http://google.com

**The most minimal example, render google.com as PNG image**

https://url-to-pdf-api.herokuapp.com/api/render?output=screenshot&url=http://google.com

**Use the default @media print instead of @media screen.**

https://url-to-pdf-api.herokuapp.com/api/render?url=http://google.com&emulateScreenMedia=false

**Use scrollPage=true which tries to reveal all lazy loaded elements. Not perfect but better than without.**

https://url-to-pdf-api.herokuapp.com/api/render?url=http://www.andreaverlicchi.eu/lazyload/demos/lazily_load_lazyLoad.html&scrollPage=true

**Render only the first page.**

https://url-to-pdf-api.herokuapp.com/api/render?url=https://en.wikipedia.org/wiki/Portable_Document_Format&pdf.pageRanges=1

**Render A5-sized PDF in landscape.**

https://url-to-pdf-api.herokuapp.com/api/render?url=http://google.com&pdf.format=A5&pdf.landscape=true

**Add 2cm margins to the PDF.**

https://url-to-pdf-api.herokuapp.com/api/render?url=http://google.com&pdf.margin.top=2cm&pdf.margin.right=2cm&pdf.margin.bottom=2cm&pdf.margin.left=2cm

**Wait for extra 1000ms before render.**

https://url-to-pdf-api.herokuapp.com/api/render?url=http://google.com&waitFor=1000

**Download the PDF with a given attachment name**

https://url-to-pdf-api.herokuapp.com/api/render?url=http://google.com&attachmentName=google.pdf

**Wait for an element macthing the selector input appears.**

https://url-to-pdf-api.herokuapp.com/api/render?url=http://google.com&waitFor=input

**Render HTML sent in JSON body**

```
curl -o html.pdf -XPOST -d'{"html": "<body>test</body>"}' -H"content-type: application/json" https://url-to-pdf-api.herokuapp.com/api/render
```

**Render HTML sent as text body**

```
curl -o html.pdf -XPOST -d@page.html -H"content-type: text/html" https://url-to-pdf-api.herokuapp.com/api/render
```

```
https://url-to-pdf-api.herokuapp.com/api/render?url=http://google.com/search?q=要搜索的内容
```

![屏幕快照 2019-10-05 下午8.48.01](images/屏幕快照 2019-10-05 下午8.48.01.png)


<?xml version="1.0" encoding="ISO-8859-1"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
  <html>
  <body>
    <h2>PLC Commands</h2>
    <table border="1">
    <tr bgcolor="#9acd32">
      <th align="left">Name</th>
      <th align="left">Address</th>
    </tr>
    <xsl:for-each select="PLCOperationConfig/OperateList/OperateItem">
<xsl:sort select="@ItemName"/>
    <tr>
      <td><xsl:value-of select="@ItemName"/></td>
       <td><xsl:value-of select="@Addr"/></td>
    </tr>
    </xsl:for-each>
    </table>
  </body>
  </html>
</xsl:template>
</xsl:stylesheet>
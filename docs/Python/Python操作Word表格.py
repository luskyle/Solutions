
import sys
sys.path.append("lib")

def GetTableResult():
	import lib.docx.Document

	docx = Document(r"C:\Users\lzh\Desktop\mulu.docx")
	table = docx.tables[0]

	result = ""
	cells = []
	for row in table.rows:
		for cell in row.cells:
			if(cell not in cells):
				result += cell.text + " "
				cells.append(cell)
		result += "\n"
	return result

with open('word.txt', 'w') as f:
	f.write(GetTableResult())
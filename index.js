const fonts = {
  IpaMincho: {
    normal: 'fonts/ipam.ttf',
    bold: 'fonts/ipam.ttf',
    italics: 'fonts/ipam.ttf',
    bolditalics: 'fonts/ipam.ttf'
  }
}

var PdfPrinter = require('pdfmake')
var printer = new PdfPrinter(fonts)
var fs = require('fs')

var docDefinition = {
  content: [
    'First paragraph',
    'Another paragraph, this time a little bit longer to make sure, this line will be divided into at least two lines',
    '日本語'
  ],
  defaultStyle: {
    font: 'IpaMincho'
  }
}

var pdfDoc = printer.createPdfKitDocument(docDefinition)
pdfDoc.pipe(fs.createWriteStream('pdfs/basics.pdf'))
pdfDoc.end()

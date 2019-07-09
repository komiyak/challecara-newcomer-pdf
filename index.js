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

const locationName = '博多会場'
const schoolName = 'Fukuoka College'
const studentName = '田中 太郎'
const qrCodeData = 'https://example.com/'

const content = []

for (let i = 0; i < 5; i++) {
  const pageContent = [
    { image: 'images/logo_border.png', width: 260 },
    { text: `会場: ${locationName}`, fontSize: 20 },
    { text: `\n所属: ${schoolName}`, fontSize: 26 },
    { text: `${studentName} さん`, fontSize: 26 },
    '\n\nようこそチャレキャラへ！',
    'これから半年間、よろしくお願いします！',
    '\nお手持ちのスマホで、この用紙に記載されている QR コードを読み取ってください。',
    'チャレキャラを始めるためのツール等のセットアップを行います。\n\n\n',
    { qr: qrCodeData, fit: 140, alignment: 'center' },
    '\n\n・これはあなた専用の QR コードなので、他人と共有しないでください',
    '・セットアップ完了後は不要になりますので、破棄してください。',
    { text: '', pageBreak: 'after' }
  ]

  content.push(pageContent)
}

var docDefinition = {
  content: [].concat.apply([], content),
  defaultStyle: {
    font: 'IpaMincho'
  }
}

var pdfDoc = printer.createPdfKitDocument(docDefinition)
pdfDoc.pipe(fs.createWriteStream('pdfs/basics.pdf'))
pdfDoc.end()

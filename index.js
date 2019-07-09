require('dotenv').config()

const admin = require('firebase-admin')

admin.initializeApp({
  credential: admin.credential.applicationDefault()
})

const pj = (obj) => {
  return JSON.stringify(obj)
}

const ppj = (obj) => {
  return JSON.stringify(obj, null, 2)
}

const fetchDocuments = async (documentName) => {
  const result = {}
  const db = admin.firestore()

  await db.collection(documentName).get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        result[doc.id] = doc.data()
      })
    })
    .catch((err) => {
      console.log('Error getting documents', err)
    })

  return result
}

const buildContentData = async () => {
  const db = admin.firestore()
  const result = {}

  const locations = await fetchDocuments('locations')
  const schools = await fetchDocuments('schools')

  for (let key in locations) {
    const location = locations[key]
    const studentsRef = db.collection('students')

    const data = []
    await studentsRef.where('location', '==', db.collection('locations').doc(key)).get().then(snapshot => {
      snapshot.forEach(doc => {
        const documentId = doc.id
        const name = doc.data().sei + ' ' + doc.data().mei
        const school = doc.data().school

        data.push({
          documentId: documentId,
          name: name,
          schoolName: schools[school.id].name
        })
      })
    })

    result[key] = {
      name: location.name,
      data: data
    }
  }
  return result
}

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

const util = require('util')

buildContentData().then(result => {
  for (let key in result) {
    const item = result[key]
    const pdfName = item.name

    const content = []

    for (let student of item.data) {
      const qrCodeData = util.format(process.env.APP_URL, student.documentId)

      const pageContent = [
        { image: 'images/logo_border.png', width: 260 },
        { text: `会場: ${item.name}`, fontSize: 20 },
        { text: `\n所属: ${student.schoolName}`, fontSize: 26 },
        { text: `${student.name} さん`, fontSize: 26 },
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
    pdfDoc.pipe(fs.createWriteStream(`pdfs/${pdfName}.pdf`))
    pdfDoc.end()
  }
})

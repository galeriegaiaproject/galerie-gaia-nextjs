const fs = require('fs/promises')
const path = require('path')
const matter = require('gray-matter')
const { GoogleSpreadsheet } = require('google-spreadsheet')

const PAGES_DIR = path.resolve(__dirname, '..', 'content')

;(async function() {
  const works = []

  for (const w of await fs.readdir(path.resolve(PAGES_DIR, 'works'))) {
    const { data: work } = matter(await fs.readFile(path.resolve(PAGES_DIR, 'works', w), 'utf-8'))
    const { data: artist } = matter(await fs.readFile(path.resolve(__dirname, '..', work.artist), 'utf-8'))

    works.push({
      ...work,
      artist: artist.title,
      fields: (work.fields || []).join(','),
      styles: (work.styles || []).join(','),
      height: work.dimensions?.height,
      width: work.dimensions?.width,
      depth: work.dimensions?.depth
    })
  }

  const doc = new GoogleSpreadsheet('1FaDn9wbsw6VznJMgL_pabP-RDtT4K7nqB1R1JZaOm9s')

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    private_key: process.env.GOOGLE_PRIVATE_KEY || '',
  })

  await doc.loadInfo()
  const sheet = doc.sheetsByIndex[0]
  await sheet.setHeaderRow(Object.keys(works.reduce((acc, curr) => ({ ...acc, ...curr }), {})))
  await sheet.clearRows()
  await sheet.addRows(works)
}())

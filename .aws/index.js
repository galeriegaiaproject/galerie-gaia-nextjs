const path = require('path')
const AWS = require('aws-sdk')
const sharp = require('sharp')
const potrace = require('potrace')
const slug = require('slug')

const s3 = new AWS.S3()

exports.handler = async (event, context, callback) => {
  let tina, high, thumbnail, trace
  const Bucket = event.Records[0].s3.bucket.name
  const file = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '))

  if (!file.startsWith('tina/uploads/')) {
    console.log('Image is not from tina/uploads folder')
    return
  }

  const ext = path.extname(file).toLowerCase()
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) {
    console.log(`Unsupported image type: ${ext}`)
    return
  }

  const type = `image/${{ '.png': 'png', '.jpg': 'jpeg', '.jpeg': 'jpeg' }[ext]}`

  try {
    console.log('S3 getObject', { Bucket, Key: file })
    tina = (await s3.getObject({ Bucket, Key: file }).promise()).Body
  } catch (error) {
    console.log(error)
    return
  }

  const slugified = `${file.slice(0, -ext.length).split('/').map(str => slug(str, { lower: true })).join('/')}${ext}`

  try {
    high = await sharp(tina).resize(1920).toBuffer()
    console.log('S3 putObject', { Bucket, Key: `${slugified.replace('tina/uploads/', 'tina/_/high/')}` })
    await s3.putObject({ Bucket, Key: `${slugified.replace('tina/uploads/', 'tina/_/high/')}`, Body: high, ContentType: type, ACL: 'public-read' }).promise()
    console.log(`Successfully resized ${Bucket}/${file} and uploaded to ${Bucket}/${slugified.replace('tina/uploads/', 'tina/_/high/')}`)
  } catch (error) {
    console.log(error)
    return
  }

  try {
    thumbnail = await sharp(high).resize(512).toBuffer()
    console.log('S3 putObject', { Bucket, Key: `${slugified.replace('tina/uploads/', 'tina/_/thumbnail/')}` })
    await s3.putObject({ Bucket, Key: `${slugified.replace('tina/uploads/', 'tina/_/thumbnail/')}`, Body: thumbnail, ContentType: type, ACL: 'public-read' }).promise()
    console.log(`Successfully thumbnailed ${Bucket}/${file} and uploaded to ${Bucket}/${slugified.replace('tina/uploads/', 'tina/_/thumbnail/')}`)
  } catch (error) {
    console.log(error)
    return
  }

  try {
    trace = await new Promise((resolve, reject) => potrace.trace(thumbnail, {
      color: 'lightgray',
      optTolerance: 0.4,
      turdSize: 100,
      turnPolicy: potrace.Potrace.TURNPOLICY_MAJORITY,
    }, (err, svg) => err ? reject(err) : resolve(Buffer.from(svg))))
    console.log('S3 putObject', { Bucket, Key: `${slugified.replace('tina/uploads/', 'tina/_/trace/').slice(0, -ext.length)}.svg` })
    await s3.putObject({ Bucket, Key: `${slugified.replace('tina/uploads/', 'tina/_/trace/').slice(0, -ext.length)}.svg`, Body: trace, ContentType: 'image/svg+xml', ACL: 'public-read' }).promise()
    console.log(`Successfully traced ${Bucket}/${file} and uploaded to ${Bucket}/${slugified.replace('tina/uploads/', 'tina/_/trace/').slice(0, -ext.length)}.svg`)
  } catch (error) {
    console.log(error)
    return
  }
}

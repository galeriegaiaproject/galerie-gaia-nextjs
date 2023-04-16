import slugify from '@/utils/slugify'

export function fromFilesystem2Url (input) {
  return `/${input.replace(/content\/(.*?)\.md$/, (match, url) => url)}`
}

export function fromFilesystem2S3 (input = '', source = 'high') {
  return input.replace(/\/tina\/uploads\/(.*?)$/, (match, image) => {
    const ext = source === 'trace' ? '.svg' : `.${image.split('.').pop().toLocaleLowerCase()}`
    return `/tina/_/${source}/${(image).slice(0, -ext.length).split('/').map(str => slugify(str)).join('/')}${ext}`
  })
}

export default {
  fromFilesystem2S3,
  fromFilesystem2Url,
}

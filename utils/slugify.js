import slug from 'slug'

export default (string) => slug((string || '').replace(/°/, 'degree'), { lower: true })

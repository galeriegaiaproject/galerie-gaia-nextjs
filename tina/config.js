import { defineConfig } from 'tinacms'
import schema from './schema'

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || 'main'

export default defineConfig({
  branch,
  clientId: 'b7353ecc-6ae7-4629-ac8c-94dca69666a7', // Get this from tina.io
  token: 'e4b5008c49d5df10ab2f345ea78d87e93e2d8f74', // Get this from tina.io
  media: {
    loadCustomStore: async () => {
      const pack = await import('next-tinacms-s3')
      return pack.TinaCloudS3MediaStore
    },
  },
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  schema,
})

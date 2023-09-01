import { Fragment } from 'react'
import Head from 'next/head'
import { NextSeo } from 'next-seo'
import { fromFilesystem2S3 } from '@/utils/resolve'

const SEO = ({ title, description, type, url, image, metadata }) => (
  <Fragment>
    <Head>
      <meta charSet='utf-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      <meta name='google' content='notranslate' />
    </Head>
    <NextSeo
      title={title}
      description={description}
      openGraph={{
        title,
        description,
        type: type || 'website',
        locale: 'fr_FR',
        siteName: metadata?.title,
        url: `${metadata?.siteUrl}${url}`,
        ...(image ? { image: fromFilesystem2S3(image) } : {}),
      }}
      twitter={{
        cardType: 'summary_large_image',
      }}
    />
  </Fragment>
)

export default SEO

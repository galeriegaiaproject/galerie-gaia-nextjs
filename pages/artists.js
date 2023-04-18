import { useTina } from 'tinacms/dist/react'
import client from '@/tina/__generated__/client'
import SEO from '@/components/SEO'
import Layout from '@/components/Layout'
import Work from '@/components/Work'
import Heading from '@/components/Heading'
import { fromFilesystem2Url } from '@/utils/resolve'
import theme from '@/theme'

export const getStaticProps = async ({ params }) => {
  const page = await client.queries.page_artists({ relativePath: 'index.md' })
  page.data.page_artists.artists = page.data.page_artists.artists.map(({ artist: { id, title, image, work, expose }, ...rest }) => ({ ...rest, artist: { id, title, image: image || null, work: { image: work?.image || null }, expose } }))

  try {
    return {
      props: {
        tina: {
          page,
          metadata: await client.queries.metadata({ relativePath: 'index.md' }),
        }
      },
    }
  } catch (e) {
    return { props: {} }
  }
}

const Artists = ({ tina, scrollPosition, ...props }) => {
  const { data: { page_artists: page } } = useTina(tina.page)
  const { data: { metadata } } = useTina(tina.metadata)

  const artists = page.artists.filter(({ artist }) => artist.expose)

  return (
    <Layout metadata={metadata} {...props}>
      <SEO
        title={page.seo.title}
        description={page.seo.description}
        url='/artists'
        image={page.seo.image || artists[0]?.artist?.work?.image}
        metadata={metadata}
      />
      <section css={Artists.styles.element}>
        <Heading>{page.seo.heading}</Heading>
        <div css={Artists.styles.grid}>
          {artists.map(({ artist }) => (
            <article key={artist.id} css={Artists.styles.article}>
              <Work
                title={artist.title}
                image={artist.image || artist.work?.image}
                url={fromFilesystem2Url(artist.id)}
              />
            </article>
          ))}
        </div>
      </section>
    </Layout>
  )
}

Artists.styles = {
  element: {
    flex: 1,
    padding: '2em',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, 16em)',
    gridGap: '2rem',
    justifyContent: 'space-between',
    [theme.medias.small]: {
      justifyContent: 'center',
    },
    [theme.medias.medium]: {
      justifyContent: 'center',
    },
  },
  article: {
    height: '19em',
    width: '16em',
  },
}

export default Artists

import { useState, useEffect, useMemo } from 'react'
import { useTina } from 'tinacms/dist/react'
import client from '@/tina/__generated__/client'
import SEO from '@/components/SEO'
import Layout from '@/components/Layout'
import Carousel from '@/components/Carousel'
import Heading from '@/components/Heading'
import Work from '@/components/Work'
import theme from '@/theme'

export const getStaticProps = async ({ params }) => {
  try {
    return {
      props: {
        tina: {
          page: await client.queries.page_home({ relativePath: 'index.md' }),
          actualites: await client.queries.page_actualites({ relativePath: 'index.md' }),
          metadata: await client.queries.metadata({ relativePath: 'index.md' }),
        }
      },
    }
  } catch (e) {
    console.warn(e)
    return { props: {} }
  }
}

const Home = ({ tina, ...props }) => {
  const { data: { page_home: page } } = useTina(tina.page)
  const { data: { page_actualites: actualites } } = useTina(tina.actualites)
  const { data: { metadata } } = useTina(tina.metadata)

  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(true)
  }, [])

  const article = useMemo(() => actualites.articles.slice(-1).pop(), [])

  return (
    <Layout metadata={metadata} {...props}>
      <SEO
        title={page.seo.title}
        description={page.seo.description}
        url='/'
        image={page.carousel[0]?.work?.image}
        metadata={metadata}
      />
      <section css={Home.styles.element} style={{ opacity: ready ? 1 : 0 }}>
        <Heading>{page.seo.heading}</Heading>
        <Carousel slides={page.carousel} />
      </section>
      <section css={Home.styles.works}>
        <Work
          title={article.title}
          image={article.image}
          url="/actualites"
        />
        <Work
          title="Dossier de Presse"
          image="https://galerie-gaia.s3.eu-west-3.amazonaws.com/forestry/assets-presse.jpg"
          url="https://galerie-gaia.s3.eu-west-3.amazonaws.com/forestry/Dossier+de+Presse+-+Galerie+Gai%CC%88a.pdf"
        />
        <Work
          title="Catalogue"
          image="https://galerie-gaia.s3.eu-west-3.amazonaws.com/forestry/assets-catalogue.jpg"
          url="/catalogue"
        />
      </section>
    </Layout>
  )
}

Home.styles = {
  element: {
    height: '70vh',
    width: '100%',
    transition: 'opacity ease-in-out 400ms',
  },
  carousel: {
    height: '100%',
    width: '100%',
    '>div': {
      height: '100%',
      width: '100%',
      '>div': {
        height: '100%',
        width: '100%',
        '>ul': {
          height: '100%',
          width: '100%',
          '>li': {
            height: '100%',
            width: '100%',
          },
        },
      },
    },
  },
  slide: {
    img: {
      height: '100%',
      width: '100%',
      objectFit: 'cover',
    },
  },
  works: {
    display: 'flex',
    justifyContent: 'space-between',
    height: '30%',
    fontSize: '0.875em',
    margin: '2em',
    '>a': {
      margin: '2em 1em',
      height: '256px',
      width: '256px',
    },
    [theme.medias.small]: {
      flexDirection: 'column',
      alignItems: 'center',
      height: 'auto',
    },
  },
}

export default Home

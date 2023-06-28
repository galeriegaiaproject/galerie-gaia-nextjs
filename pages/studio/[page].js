import { useTina } from 'tinacms/dist/react'
import client from '@/tina/__generated__/client'
import SEO from '@/components/SEO'
import Layout from '@/components/Layout'
import RichText from '@/components/RichText'
import Contact from '@/components/Contact'
import theme from '@/theme'

export const getStaticProps = async ({ params }) => {
  try {
    return {
      props: {
        tina: {
          page: await client.queries.pages({ relativePath: `${params.page}.md` }),
          metadata: await client.queries.metadata({ relativePath: 'index.md' }),
        }
      },
    }
  } catch (e) {
    return { props: {} }
  }
}

export const getStaticPaths = async () => {
  const pagesListData = await client.request({
    query: `query pagesConnection($first: Float) {
      pagesConnection(first: $first) {
        edges {
          cursor
          node {
            ... on Document {
              _sys {
                filename
              }
            }
          }
        }
      }
    }`,
    variables: { first: -1 },
  })

  return {
    paths: pagesListData.data.pagesConnection.edges.map((page) => ({
      params: { page: page.node._sys.filename },
    })),
    fallback: false,
  }
}

const Studio = ({ tina, ...props }) => {
  const { data: { pages: page } } = useTina(tina.page)
  const { data: { metadata } } = useTina(tina.metadata)

  return (
    <Layout metadata={metadata} {...props}>
      <SEO
        title={page.seo.title}
        description={page.seo.description}
        image={page.seo.image}
        url={`/studio/${page._sys.filename}`}
        metadata={metadata}
      />
      <section css={Studio.styles.element}>
        <h1>{page.seo.heading}</h1>
        <div>
          {page.content.map(({ column, contact }, index) => (
            <article key={index}>
              <RichText children={column} />
              {contact?.display && (
                <Contact
                  id="uT-oykFnR_MeNQndwoxtc"
                  button={contact.button}
                  placeholder={contact.placeholder}
                  toggle={true}
                  inputs={[
                    {
                      name: 'subject',
                      value: page.title,
                    }
                  ]}
                />
              )}
            </article>
          ))}
        </div>
      </section>
    </Layout>
  )
}

Studio.styles = {
  element: {
    padding: '2rem',
    '>div': {
      display: 'flex',
      [theme.medias.small]: {
        flexDirection: 'column',
      },
      '>article': {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        padding: '0 1rem',
        fontSize: '1rem',
        lineHeight: '1.5',
        ':first-of-type': {
          paddingLeft: 0,
        },
        ':last-of-type': {
          paddingRight: 0,
        },
        [theme.medias.small]: {
          padding: 0,
        },
      },
    }
  },
}

export default Studio

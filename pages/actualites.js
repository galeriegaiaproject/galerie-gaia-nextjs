import { useEffect, Fragment, useMemo, useState, useRef } from 'react'
import { useTina } from 'tinacms/dist/react'
import client from '@/tina/__generated__/client'
import usePagination from '@/hooks/use-pagination'
import SEO from '@/components/SEO'
import Layout from '@/components/Layout'
import Icon from '@/components/Icon'
import RichText from '@/components/RichText'
import Image from '@/components/Image'
import Heading from '@/components/Heading'
import theme from '@/theme'

export const getStaticProps = async ({ params }) => {
  try {
    return {
      props: {
        tina: {
          page: await client.queries.page_actualites({ relativePath: 'index.md' }),
          metadata: await client.queries.metadata({ relativePath: 'index.md' }),
        }
      },
    }
  } catch (e) {
    return { props: {} }
  }
}

const Actualites = ({ tina, scrollPosition, ...props }) => {
  const { data: { page_actualites: page } } = useTina(tina.page)
  const { data: { metadata } } = useTina(tina.metadata)
  const ref = useRef(null)

  const articles = useMemo(() => [...page.articles].reverse(), [page.articles])
  const pagination = usePagination(articles, 10, { initial: (typeof history !== 'undefined' && history.state?.page) || 0 })

  useEffect(() => {
    if (page > 0) {
      history.pushState({ page }, document.title)
    }
  }, [page])

  const movePage = (page) => {
    if (ref.current) {
      ref.current.scrollIntoView()
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    setTimeout(() => {
      pagination.setPage(page)
    }, 1000)
  }

  return (
    <Layout metadata={metadata} {...props}>
      <SEO
        title={page.seo.title}
        description={page.seo.description}
        url='/news'
        image={pagination.pieces[0]?.image}
        metadata={metadata}
      />
      <Heading>{page.seo.heading}</Heading>
      <section ref={ref} css={Actualites.styles.element}>
        <Heading>{page.seo.heading}</Heading>
        <div css={Actualites.styles.results}>
          {pagination.pieces.map((article, index) => (
            <Fragment key={article.title}>
              <article css={Actualites.styles.article}>
                <Image src={article.image} source='thumbnail' />
                <div>
                  <h2>{article.title}</h2>
                  <p>
                    {article.categories.join(', ')}
                    {!!article.date ? ` - ${new Date(article.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` : ''}
                  </p>
                  <RichText children={article.content} />
                </div>
              </article>
              <hr />
            </Fragment>
          ))}
          {!pagination.pieces.length && (
            <div css={Actualites.styles.empty}>
              Désolé, aucune oeuvres ne correspond à vos critères pour le moment
            </div>
          )}
        </div>
        {pagination.total > 1 && (
          <nav>
            <button disabled={pagination.page === 0} onClick={() => movePage(pagination.page - 1)}>
              <Icon children="arrow" direction="left" />
            </button>
            <span>{pagination.page + 1} / {pagination.total}</span>
            <button disabled={(pagination.page + 1) === pagination.total} onClick={() => movePage(pagination.page + 1)}>
              <Icon children="arrow" direction="right" />
            </button>
          </nav>
        )}
      </section>
    </Layout>
  )
}

Actualites.styles = {
  element: {
    flex: 1,
    padding: '2em',
    '>nav': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 0 2em',
      '>button': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 1rem',
        paddingRight: '0.33em',
      },
    },
  },
  results: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: '2em 2em 0',
  },
  article: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    [theme.medias.small]: {
      flexDirection: 'column',
    },
    '>span': {
      flex: 0,
      alignItems: 'center',
      minHeight: '20rem',
      minWidth: '15rem',
      maxWidth: '50%',
      [theme.medias.small]: {
        flex: 1,
        height: '15rem',
        maxHeight: 'unset',
        minWidth: 'unset',
        maxWidth: 'unset',
        margin: '0 0 2rem 0',
      },
      '>img': {
        objectFit: 'contain',
      },
    },
    '>div': {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      margin: '0 0 0 2rem',
      [theme.medias.small]: {
        margin: 0,
      },
      '>p': {
        margin: 0,
        fontStyle: 'italic',
        textDecoration: 'underline',
      },
      '>div': {
        lineHeight: '1.5',
      },
    },
  },
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4em 0',
    textAlign: 'center',
  },
}

export default Actualites

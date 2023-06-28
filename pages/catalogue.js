import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { useTina } from 'tinacms/dist/react'
import client from '@/tina/__generated__/client'
import usePagination from '@/hooks/use-pagination'
import Link from '@/components/Link'
import SEO from '@/components/SEO'
import Layout from '@/components/Layout'
import RichText from '@/components/RichText'
import Carousel from '@/components/Carousel'
import Reinsurance from '@/components/Reinsurance'
import Icon from '@/components/Icon'
import Work from '@/components/Work'
import Heading from '@/components/Heading'
import Options from '@/components/Options'
import shuffle from '@/utils/shuffle'
import { useCacheContext } from '@/contexts/Cache'
import { fromFilesystem2Url } from '@/utils/resolve'

export const getStaticProps = async ({ params }) => {
  const artists = await client.queries.artistsConnection({ first: -1 })

  try {
    return {
      props: {
        tina: {
          page: await client.queries.page_catalogue({ relativePath: 'index.md' }),
          metadata: await client.queries.metadata({ relativePath: 'index.md' }),
          artists: artists.data.artistsConnection.edges.map(({ node }) => ({
            id: node.id,
            expose: node.expose,
            title: node.title,
            fields: node.fields,
            styles: node.styles,
            works: node.works,
            works: (node.works || [])
              .map(({ work }) => ({
                sold: work.sold,
                styles: work.styles,
                fields: work.fields,
                price: work.price,
                dimensions: work.dimensions,
                title: work.title,
                image: work.image,
                id: work.id,
              }))
          })).filter(({ expose, works }) => expose && works.some(work => !work.sold))
        }
      },
    }
  } catch (e) {
    return { props: {} }
  }
}

const Catalogue = ({ tina, scrollPosition, ...props }) => {
  const { data: { page_catalogue: page } } = useTina(tina.page)
  const { data: { metadata } } = useTina(tina.metadata)
  const artists = tina.artists

  const ref = useRef(null)
  
  const [cache, setCache] = useCacheContext()
  const values = cache.catalogue || {}
  const setValues = useCallback(cb => setCache(cache => ({ ...cache, catalogue: { ...cb(cache.catalogue || {}), page: 0 } })), [setCache])

  const fields = useMemo(() => Array.from(new Set(artists
    .reduce((acc, curr) => [...acc, ...(curr.fields || [])], [])
    .filter(field => !['Séléction'].includes(field))
  )), [])

  const styles = useMemo(() => Array.from(new Set(artists
    .reduce((acc, curr) => [...acc, ...(curr.styles || [])], [])
  )), [])

  const shuffled = useMemo(() => shuffle(
    artists.filter(artist => !artist.fields.includes('Séléction')),
    new Date(new Date().setHours(0,0,0,0)).getTime()
  ), [])

  const carousel = useMemo(() => (shuffled
    .map(page => page.works.filter(work => !work.sold)[0])
    .filter(work => !!work)
    .slice(0, 5)
  ), [])

  const options = useMemo(() => ({
    // TODO: Add `color`
    styles: {
      type: 'select',
      transform: (artist, styles) => !styles.length ? artist : ({
        ...artist,
        works: (artist.works || []).filter(work => (
          (styles.some(style => (artist.styles || []).includes(style.value)) && (work.styles || []).length === 0)
          || styles.some(style => (work.styles || []).includes(style.value))
        )),
      }),
      props: {
        label: 'Styles Artistiques',
        isMulti: true,
        options: styles.map(style => ({
          value: style,
          label: style,
        })),
      },
    },
    fields: {
      type: 'select',
      transform: (artist, fields) => !fields.length ? artist : ({
        ...artist,
        works: (artist.works || []).filter(work => (
          (fields.some(field => (artist.fields || []).includes(field.value)) && (work.fields || []).length === 0)
          || fields.some(field => (work.fields || []).includes(field.value))
        )),
      }),
      props: {
        label: 'Techniques Artistiques',
        isMulti: true,
        options: fields.map(field => ({
          value: field,
          label: field,
        })),
      },
    },
    artists: {
      type: 'select',
      transform: (artist, artists) => !artists.length ? artist : ({
        ...artist,
        works: artists.map(artist => artist.value).includes(artist.title) ? (artist.works || []) : [],
      }),
      props: {
        label: 'Artistes',
        isMulti: true,
        isSearchable: true,
        options: artists.map(artist => ({
          value: artist.title,
          label: artist.title,
        }))
      }
    },
    price: {
      type: 'checkbox',
      default: [],
      transform: (artist, prices) => !prices.length ? artist : ({
        ...artist,
        works: (artist.works || []).filter(work => prices.some(([min, max]) => (work.price * 1.05) >= min && (work.price * 1.05) <= max)),
      }),
      props: {
        label: 'Prix',
        options: [
          { id: '1-500', value: [1, 500], label: '1 - 500€' },
          { id: '500-2500', value: [500, 2500], label: '500 - 2 500€' },
          { id: '2500-5000', value: [2500, 5000], label: '2 500 - 5 000€' },
          { id: '5000+', value: [5000, Infinity], label: '5 000€ +' },
        ],
      }
    },
    format: {
      type: 'checkbox',
      default: [],
      transform: (artist, formats) => !formats.length ? artist : ({
        ...artist,
        works: (artist.works || []).filter(work => formats.some(([min, max]) => (
          (work.dimensions?.height && work.dimensions?.width)
          && (
            work.dimensions?.height >= min && work.dimensions?.height <= max
            || work.dimensions?.width >= min && work.dimensions?.width <= max
          )
        ))),
      }),
      props: {
        label: 'Formats',
        options: [
          { id: 'small', value: [0, 50], label: 'Petit (0 - 50cm)' },
          { id: 'medium', value: [50, 100], label: 'Moyen (50 - 100cm)' },
          { id: 'large', value: [100, Infinity], label: 'Grand (100cm +)' },
        ],
      }
    },
    orientation: {
      type: 'checkbox',
      default: [],
      transform: (artist, orientations) => !orientations.length ? artist : ({
        ...artist,
        works: (artist.works || []).filter(work => orientations.some((orientation) => (work.dimensions?.height && work.dimensions?.width) && ({
          portrait: work.dimensions?.height > work.dimensions?.width,
          landscape: work.dimensions?.height < work.dimensions?.width,
          square: work.dimensions?.height === work.dimensions?.width,
        }[orientation]))),
      }),
      props: {
        label: 'Orientations',
        options: [
          { id: 'portrait', value: 'portrait', label: 'Portrait' },
          { id: 'landscape', value: 'landscape', label: 'Paysage' },
          { id: 'square', value: 'square', label: 'Carré' },
        ],
      }
    },
  }), [])

  const entities = useMemo(() => (shuffled
    .map(artist => Object.keys(values).filter(key => !['page'].includes(key)).reduce((acc, key) => options[key].transform(acc, values[key]), {
      ...artist,
      works: (artist.works || []).filter(work => !work.sold),
    }))
    .filter(artist => (artist.works || []).filter(work => !work.sold).length)
  ), [shuffled, values])

  const pagination = usePagination(entities, 10, { initial: values.page || 0 })

  const setPage = useCallback((page) => {
    setCache(cache => ({ ...cache, catalogue: { ...(cache.catalogue || {}), page } }))
    pagination.setPage(page)
  }, [values, pagination.setPage])

  const movePage = useCallback((page) => {
    if (ref.current) {
      ref.current.scrollIntoView()
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    setTimeout(() => {
      setPage(page)
    }, 1000)
  }, [setPage])

  useEffect(() => {
    return () => setCache(({ catalogue, ...cache }) => cache)
  }, [])

  return (
    <Layout metadata={metadata} {...props}>
      <SEO
        title={page.seo.title}
        description={page.seo.description}
        image={pagination.pieces[0]?.works?.filter(work => !work.sold).shift()?.image}
        url={'/catalogue'}
        metadata={metadata}
      />
      <section ref={ref} css={Catalogue.styles.element}>
        <Heading>{page.seo.heading}</Heading>
        <div css={Catalogue.styles.carousel}>
          <Carousel slides={carousel} />
        </div>
        <h1>{page.title}</h1>
        <RichText children={page.description} />
        {!!pagination.pieces.length && (
          <small css={Catalogue.styles.resume}>
            <code>
              <strong>{entities.length}</strong> Artistes // <strong>{entities.reduce((acc, curr) => acc + curr.works.length, 0)}</strong> Oeuvres
            </code>
          </small>
        )}
        <Options options={options} setPage={setPage} values={values} setValues={setValues} />
        <div css={Catalogue.styles.results}>
          {pagination.pieces
            .map(artist => (
              <article key={artist.id} css={Catalogue.styles.artist}>
                <label><Link to={fromFilesystem2Url(artist.id)}>{artist.title}</Link></label>
                <div css={Catalogue.styles.row}>
                  {(artist.works || []).filter(work => !work.sold).map((work, index) => (
                    <div css={Catalogue.styles.work} key={index}>
                      <Work
                        title={work.title}
                        image={work.image}
                        url={{
                          pathname: fromFilesystem2Url(artist.id),
                          query: { work: fromFilesystem2Url(work.id).replace('/works/', '') },
                        }}
                      />
                    </div>
                  ))}
                </div>
              </article>
            ))
          }
          {!pagination.pieces.length && (
            <div css={Catalogue.styles.empty}>
              Désolé, aucune oeuvres ne correspond à vos critères pour le moment
            </div>
          )}
        </div>
        {!!pagination.total && (
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
        <div css={Catalogue.styles.reinsurance}>
          <Reinsurance />
        </div>
      </section>
    </Layout>
  )
}

Catalogue.styles = {
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
  carousel: {
    height: '15rem',
    margin: '0 0 2rem',
  },
  results: {
  },
  resume: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1em 0',
    textAlign: 'center',
  },
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4em 0',
    textAlign: 'center',
  },
  artist: {
    padding: '0 0 2em 0',
    '>label': {
      fontWeight: 'bold',
      fontSize: '1.25em'
    }
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    overflowY: 'auto',
  },
  work: {
    flexShrink: 0,
    fontSize: '0.875em',
    height: '20em',
    width: '20em',
    padding: '2em',
  },
  reinsurance: {
    margin: '2rem 0 0 0',
  }
}

export default Catalogue

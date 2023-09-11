import { Fragment, useState, useMemo, useEffect } from 'react'
import Router, { useRouter } from 'next/router'
import { useTina } from 'tinacms/dist/react'
import client from '@/tina/__generated__/client'
import Carousel, { Dots } from '@brainhubeu/react-carousel'
import '@brainhubeu/react-carousel/lib/style.css'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import SEO from '@/components/SEO'
import Breadcrumb from '@/components/Breadcrumb'
import Layout from '@/components/Layout'
import RichText from '@/components/RichText'
import Reinsurance from '@/components/Reinsurance'
import Contact from '@/components/Contact'
import Contextual from '@/components/Contextual'
import Image from '@/components/Image'
import Icon from '@/components/Icon'
import slugify from '@/utils/slugify'
import theme from '@/theme'
import { fromFilesystem2S3, fromFilesystem2Url } from '@/utils/resolve'
import { useSnipcartContext } from '@/contexts/Snipcart'

export const getStaticProps = async ({ params }) => {
  try {
    return {
      props: {
        tina: {
          page: await client.queries.artists({ relativePath: `${params.artist}.md` }),
          metadata: await client.queries.metadata({ relativePath: 'index.md' }),
        }
      },
    }
  } catch (e) {
    return { props: {} }
  }
}

export const getStaticPaths = async () => {
  const artistsListData = await client.request({
    query: `query artistsConnection($first: Float) {
      artistsConnection(first: $first) {
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
    paths: artistsListData.data.artistsConnection.edges.map((artist) => ({
      params: { artist: artist.node._sys.filename },
    })),
    fallback: false,
  }
}

const SHIPPING_RULES = {
  'Oeuvre sur papier': [
    { size: [0, Infinity], weight: 50 },
  ],
  'Dessin': [
    { size: [0, Infinity], weight: 50 },
  ],
  'Peinture': [
    { size: [100, Infinity], weight: 350 },
    { size: [50, 100], weight: 250 },
    { size: [0, 50], weight: 150 },
  ],
  'Photographie': [
    { size: [100, Infinity], weight: 350 },
    { size: [50, 100], weight: 250 },
    { size: [0, 50], weight: 150 },
  ],
  'Textile': [
    { size: [100, Infinity], weight: 350 },
    { size: [50, 100], weight: 250 },
    { size: [0, 50], weight: 150 },
  ],
  'Design': [
    { size: [100, Infinity], weight: 350 },
    { size: [50, 100], weight: 250 },
    { size: [0, 50], weight: 150 },
  ],
  'Sculpture': [
    { size: [100, Infinity], weight: 650 },
    { size: [50, 100], weight: 550 },
    { size: [0, 50], weight: 450 },
  ],
  'Céramique': [
    { size: [100, Infinity], weight: 650 },
    { size: [50, 100], weight: 550 },
    { size: [0, 50], weight: 450 },
  ],
}

const Artist = ({ tina, ...props }) => {
  const { data: { artists: page } } = useTina(tina.page)
  const { data: { metadata } } = useTina(tina.metadata)
  const { query } = useRouter()

  useEffect(() => {
    if (!page.expose) {
      Router.push('/artists')
    }
  }, [page.expose])

  const cart = useSnipcartContext()
  const works = useMemo(() => (page.works || []).map(({ work }) => work).filter(work => !work.sold), [page.works])
  const slides = useMemo(() => works.map(work => work.image).filter(image => !!image), [works])
  const [slide, setSlide] = useState(0)
  const index = (slide >= 0 ? slide : Math.ceil(Math.abs(slide / slides.length))) % slides.length

  useEffect(() => {
    setSlide(query?.work ? works.filter(work => !!work.image).findIndex(work => fromFilesystem2Url(work.id).replace('/works/', '') === query.work) : 0)
  }, [works, query?.work])

  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(true)
  }, [])

  return (
    <Layout metadata={metadata} {...props}>
      <SEO
        title={page.seo?.title || `${page.title}${page.fields.length ? `, ${(page.fields || []).join(', ')}` : ''} - Galerie Gaïa`}
        description={page.seo?.description || `Découvrez, réservez et commandez les œuvres de ${page.title}${page.fields.length ? `, ${(page.fields || []).join(', ')}` : ''}, à la Galerie Gaïa, galerie d'art en ligne et à Nantes.`}
        image={slides[0]}
        url={fromFilesystem2Url(page.id)}
        metadata={metadata}
      />
      <section css={Artist.styles.element}>
        <div css={Artist.styles.about}>
          <Breadcrumb
            current={page.title}
            crumbs={[
              { label: 'Accueil', path: '/' },
              { label: 'Artistes', path: '/artists' },
              { label: page.title },
            ]}
          />
          <h1>{page.title}</h1>
          {!!(parseInt(page.birth) || parseInt(page.death)) && (
            <small>
              ({[parseInt(page.birth), parseInt(page.death)].filter(year => year).join(' - ')})
            </small>
          )}
          {!!(page.location || (page.fields || []).length) && (
            <p>{[page.location, (page.fields || []).join(', ')].filter(s => s).join(' - ')}</p>
          )}
        </div>
        {!!works.length && (
          <div css={Artist.styles.works}>
            <div
              css={Artist.styles.carousel}
              style={{
                opacity: ready ? 1 : 0,
              }}
            >
              <Carousel
                arrows
                stopAutoPlayOnHover
                arrowLeft={<span css={Artist.styles.arrow}><Icon children='arrow' direction='left' /></span>}
                arrowLeftDisabled={<span css={Artist.styles.arrow}><Icon children='arrow' direction='left' style={{ opacity: 0.25 }} /></span>}
                arrowRight={<span css={Artist.styles.arrow}><Icon children='arrow' direction='right' /></span>}
                arrowRightDisabled={<span css={Artist.styles.arrow}><Icon children='arrow' direction='right' style={{ opacity: 0.25 }} /></span>}
                addArrowClickHandler
                value={slide}
                onChange={(slide) => setSlide(slide)}
                slides={slides.map((image, index) => (
                  <Zoom key={index}>
                    <div css={Artist.styles.slide}>
                      <Image src={image} />
                    </div>
                  </Zoom>
                ))}
              />
              <Dots
                value={slide}
                onChange={(slide) => setSlide(slide)}
                number={slides.length}
                thumbnails={slides.map((image, index) => (
                  <div css={Artist.styles.thumbnail} key={index}>
                    <Image src={image} source="thumbnail" />
                  </div>
                ))}
              />
            </div>
            <div css={Artist.styles.work}>
              {works.map((work, i) => (
                <div key={i} style={{ display: i !== index ? 'none' : 'block' }}>
                  <h2><cite>{work.title}</cite></h2>
                  <span>
                    {work.technique}
                    {!!(
                      work.dimensions?.height ||
                      work.dimensions?.width ||
                      work.dimensions?.depth
                    ) && ` (${[
                      work.dimensions?.height,
                      work.dimensions?.width,
                      work.dimensions?.depth,
                    ].filter(size => size).join(' x ')})`}
                  </span>
                  {!!work.price && (
                    <small>{(work.price * 1.05)} €</small>
                  )}
                  {!!work.description && (
                    <RichText children={work.description} />
                  )}
                  <br/>
                  {(
                    !!work.price &&
                    !!(work.dimensions?.width && work.dimensions?.height) &&
                    (
                      page.fields?.some(field => Object.keys(SHIPPING_RULES).includes(field)) ||
                      !!work.fields?.some(field => Object.keys(SHIPPING_RULES).includes(field))
                    )
                  ) && (
                    <Fragment>
                      {(
                        <button
                          className="snipcart-add-item"
                          data-item-id={`${page.id}-${slugify((work.title || '').toLowerCase().trim())}`}
                          data-item-name={work.title}
                          data-item-description={[
                            work.technique,
                            !!(
                              work.dimensions?.height ||
                              work.dimensions?.width ||
                              work.dimensions?.depth
                            ) && ` (${[
                              work.dimensions?.height,
                              work.dimensions?.width,
                              work.dimensions?.depth,
                            ].filter(size => size).join(' x ')})`,
                          ].filter(v => v).join(", ")}
                          data-item-image={fromFilesystem2S3(work.image)}
                          data-item-price={work.price * 1.05}
                          data-item-url={`${fromFilesystem2Url(page.id)}?work=${fromFilesystem2Url(work.id).replace('/works/', '')}`}
                          data-item-max-quantity={1}
                          data-item-weight={(cart ? 1000 : 0) + SHIPPING_RULES[
                            work.fields?.find(field => Object.keys(SHIPPING_RULES).includes(field))
                            || page.fields?.find(field => Object.keys(SHIPPING_RULES).includes(field))
                          ].find(({ size: [min, max] }) => (
                            work.dimensions?.height >= min && work.dimensions?.height <= max
                            || work.dimensions?.width >= min && work.dimensions?.width <= max
                          )).weight}
                          {...(work.dimensions?.depth ? { 'data-item-length' : parseInt(work.dimensions?.depth) } : {})}
                          {...(work.dimensions?.height ? { 'data-item-height' : parseInt(work.dimensions?.height) } : {})}
                          {...(work.dimensions?.width ? { 'data-item-width' : parseInt(work.dimensions?.width) } : {})}
                          data-item-custom1-name="Un message à nous adresser ?"
                          data-item-custom1-type="textarea"
                        >
                          <Icon children={'palette'} style={{ margin: '0 0.5rem 0 0' }} />
                          Acquérir cette oeuvre
                        </button>
                      )}
                      {((work.price * 1.05) >= 2500) && (
                        <a href='/leasing-simulation' target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
                          <small>Simulation en Leasing</small>
                        </a>
                      )}
                      <hr />
                    </Fragment>
                  )}
                  {!!work.contextual && (
                    <Contextual work={work} />
                  )}
                  <Contact
                    id="PHr_SEkN0Pj2VLhcXtR5H"
                    placeholder="Une hésitation, une question, une demande de renseignement sur cette oeuvre, vous souhaitez plus de photos ? Écrivez nous votre message :"
                    success="Merci ! Nous allons vous recontacter rapidement afin de répondrce à vos questions"
                    toggle={true}
                    inputs={[
                      ...Object.keys(work).filter(name => work[name] && work[name] !== '0').map(name => ({
                        name,
                        value: (
                          typeof work[name] === 'object' ? JSON.stringify(work[name]) :
                          name === 'image' ? fromFilesystem2S3(work.image) : work[name]
                        ),
                      })),
                      {
                        name: 'artist',
                        value: page.title,
                      },
                    ]}
                  />
                  <Contact id="uth7YJ01" method='newsletter' toggle={true} />
                </div>
              ))}
            </div>
          </div>
        )}
        <div css={Artist.styles.reinsurance}>
          <Reinsurance />
        </div>
        {!!page.biography?.children?.length && (
          <div css={Artist.styles.biography}>
            <label>Biographie</label>
            <RichText children={page.biography} />
          </div>
        )}
        {!!page.exhibitions?.length && (
          <div css={Artist.styles.exhibitions}>
            <label>Expositions</label>
            {page.exhibitions.map((exhibition, index) => (
              <p css={Artist.styles.exhibition} key={index}>
                {!!(exhibition.start || exhibition.end) && (
                  <Fragment>
                    <span>
                      {[
                        exhibition.start,
                        exhibition.end,
                      ].filter(date => date).join(' - ')}
                    </span>
                    <span> / </span>
                  </Fragment>
                )}
                <strong>{exhibition.location}</strong>
                <span> / </span>
                <span>{exhibition.title}</span>
              </p>
            ))}
          </div>
        )}
      </section>
    </Layout>
  )
}

Artist.styles = {
  element: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    maxWidth: '100%',
  },
  works: {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    [theme.medias.extralarge]: {
      flexDirection: 'row',
    },
  },
  carousel: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'calc(50vh + 7rem)',
    padding: '1rem 0',
    transition: 'opacity ease-in-out 400ms',
    [theme.medias.extralarge]: {
      alignSelf: 'flex-start',
      padding: '1rem 1rem 1rem 0',
      width: '50%',
    },
    '>div': {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'stretch',
      '>div': {
        height: '100%',
        width: '100%',
        '>div': {
          '&:first-of-type': {
            display: 'flex',
          },
          '&:last-of-type': {
            display: 'flex',
          },
        },
        ul: {
          height: '100%',
        },
      },
    },
    '>ul': {
      overflowX: 'auto',
      justifyContent: 'flex-start',
    },
  },
  slide: {
    '>span': {
      '>img': {
        objectFit: 'contain',
        height: '100%',
        width: '100%',
        maxHeight: '50vh',
      },
    },
  },
  thumbnail: {
    height: '3rem',
    width: '5rem',
    '>span': {
      '>img': {
        objectFit: 'contain',
        height: '100%',
        width: '100%',
      },
    },
  },
  work: {
    flex: 1,
    padding: '0 1rem 0 0',
    '>div': {
      flex: 1,
      padding: '1rem',
      [theme.medias.extralarge]: {
        padding: '2rem 0 1rem 1rem',
      },
      '>h2': {
        padding: 0,
        margin: 0,
        color: theme.colors.black,
      },
      '>span': {
        display: 'block',
        padding: '0.5em 0',
        fontSize: '0.875em',
        color: theme.colors.gray,
      },
      '>small': {
        display: 'block',
        padding: '0.5em 0',
        color: theme.colors.gray,
      },
      '>div': {
        lineHeight: 1.5,
      },
      '>form': {
        margin: '1rem 0 0 0',
        '>textarea': {
          height: '6rem',
        },
      },
      '>button': {
        margin: '1rem 0',
      },
    },
  },
  arrow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    cursor: 'pointer',
    padding: '0 1em',
    '>svg': {
      height: '2.5em',
      width: '2.5em',
    },
  },
  about: {
    padding: '3rem 1rem 1rem',
    '>h1': {
      display: 'inline',
      padding: 0,
      margin: 0,
      color: theme.colors.black,
    },
    '>small': {
      display: 'inline',
      padding: '0 0.5em',
      color: theme.colors.gray,
    },
    '>p': {
      fontSize: '0.875em',
      marginBottom: 0
    },
  },
  reinsurance: {
    margin: '2rem 1rem 0',
  },
  biography: {
    padding: '0 1rem 1rem',
    '>div': {
      padding: '0.5em 0',
      lineHeight: '1.5',
    },
    '>label': {
      display: 'block',
      fontSize: '1.25em',
      fontWeight: 'bold',
      margin: '1em 0',
    }
  },
  exhibitions: {
    padding: '0 1rem 1rem',
    '>label': {
      display: 'block',
      fontSize: '1.25em',
      fontWeight: 'bold',
      margin: '1em 0',
    }
  },
  exhibition: {
    fontSize: '0.875em',
  },
}

export default Artist

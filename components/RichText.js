import { TinaMarkdown } from 'tinacms/dist/rich-text'
import Youtube from 'react-youtube'
import Link from '@/components/Link'
import Image from '@/components/Image'
import Gallery from '@/components/Gallery'
import { getYoutubeId } from '@/utils/youtube'

const components =  {
  a: ({ type, children, url, ...props }) => {
    if (['mp4'].includes(url.split('.').pop())) {
      return (
        <span style={{ display: 'flex', justifyContent: 'center' }}>
          <video controls={true}>
            <source src={url} />
            Désolé, votre navigateur ne semble pas supporter le format de cette vidéo, essayez d'utiliser un navigauteur récent tel que <a href="https://www.mozilla.org/fr/firefox/new/">Firefx</a>.
          </video>
        </span>
      )
    }

    if (/youtube/.test(url)) {
      return (
        <span style={{ display: 'flex', justifyContent: 'center' }}>
          <Youtube videoId={getYoutubeId(url)} containerClassName="youtubeContainer" />
        </span>
      )
    }

    if (url.charAt(0) === '/') {
      return (
        <Link to={url} {...props}>
          {children}
        </Link>
      )
    }

    return (
      <a href={url} target='_blank' rel='noopener noreferrer' {...props}>
        {children}
      </a>
    )
  },
  // img: ({ src, alt }) => (
  //   <Image src={src} alt={alt} width='100%' />
  // ),
  Gallery,
}

const RichText = ({ children, options = {}, ...props }) => (
  <div {...props} css={[RichText.styles.element, props.css]}>
    <TinaMarkdown components={components} content={children} />
  </div>
)

RichText.styles = {
  element: {
    a: {
      textDecoration: 'underline',
    },
    video: {
      width: '100%',
      maxWidth: '20rem',
    },
    img: {
      maxWidth: '100%',
    }
  },
}

export default RichText

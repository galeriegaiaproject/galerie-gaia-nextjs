import { Analytics } from '@vercel/analytics/react'
import { SnipcartProvider } from '@/contexts/Snipcart'
import { CacheProvider } from '@/contexts/Cache'
import 'normalize.css/normalize.css'
import '@/styles/global.css'
import '@/styles/fonts.css'

export default function App({ Component, pageProps }) {
  return (
    <SnipcartProvider>
      <CacheProvider>
        <Component {...pageProps} />
        <Analytics />
      </CacheProvider>
    </SnipcartProvider>
  )
}

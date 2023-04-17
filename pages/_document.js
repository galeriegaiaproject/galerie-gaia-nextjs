import { Html, Head, Main, NextScript } from 'next/document'
import Snipcart from '@/components/Snipcart'

export default function Document() {
  return (
    <Html lang='fr'>
      <Head>
        <link rel="preconnect" href="https://app.snipcart.com" />
        <link rel="preconnect" href="https://cdn.snipcart.com" />
        <script
          type="text/javascript"
          async
          dangerouslySetInnerHTML={{
            __html: `
              (function(w, d, s, l, i) {
                w[l] = w[l] || []
                w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" })
                const f = d.getElementsByTagName(s)[0],
                  j = d.createElement(s),
                  dl = l != "dataLayer" ? "&l=" + l : ""
                j.async = true
                j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl
                f.parentNode.insertBefore(j, f)
              })(window,document,'script','dataLayer',"GTM-MLBX757")`,
          }}
        />
      </Head>
      <body>
        <Main />
        <Snipcart />
        <NextScript />
      </body>
    </Html>
  )
}

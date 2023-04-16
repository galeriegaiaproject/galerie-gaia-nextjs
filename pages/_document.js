import { Html, Head, Main, NextScript } from 'next/document'
import Snipcart from '@/components/Snipcart'

export default function Document() {
  return (
    <Html lang='fr'>
      <Head />
      <body>
        <link rel="preconnect" href="https://app.snipcart.com" />
        <link rel="preconnect" href="https://cdn.snipcart.com" />
        <Main />
        <Snipcart />
        <NextScript />
      </body>
    </Html>
  )
}

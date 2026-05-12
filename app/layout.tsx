import type { Metadata } from 'next'
import './globals.css'
import '../styles/globals.css'
import Providers from '@/components/providers'

export const metadata: Metadata = {
  title: 'Hileras · Lúpulos Río Negro',
  description: 'Gestión de hileras de lúpulo',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/cono-de-lupulo.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: { url: '/cono-de-lupulo.png', sizes: '192x192', type: 'image/png' },
    shortcut: { url: '/cono-de-lupulo.png', type: 'image/png' },
  },
  other: {
    'theme-color': '#0a0a0a',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Hileras',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" type="image/png" sizes="192x192" href="/cono-de-lupulo.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/cono-de-lupulo.png" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Hileras" />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js')})}` }} />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

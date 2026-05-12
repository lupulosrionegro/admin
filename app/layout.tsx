import type { Metadata } from 'next'
import './globals.css'
import '../styles/globals.css'
import Providers from '@/components/providers'

export const metadata: Metadata = {
  title: 'Hileras · Lúpulos Río Negro',
  description: 'Gestión de hileras de lúpulo',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

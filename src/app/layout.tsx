import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Inter, Syne, Lora } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'
import IOSInstallPrompt from '../components/shared/IOSInstallPrompt';
import FeedbackButton from '../components/shared/FeedbackButton';
import { ButtonStyles } from '../components/ui/Button'
import { CardStyles } from '../components/ui/Card'
import { WordmarkStyles } from '../components/ui/Wordmark'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const syne  = Syne({ subsets: ['latin'], variable: '--font-syne' })
const lora  = Lora({ subsets: ['latin'], weight: ['500','600'], variable: '--font-lora' })

export const metadata: Metadata = {
  title: 'Stride',
  description: 'Predicts distraction. Protects your focus.',
  metadataBase: new URL('https://trystrideai.com'), 

  openGraph: {
    title: 'Stride',
    description: 'Predicts distraction. Protects your focus.',
    url: 'https://trystrideai.com',
    siteName: 'Stride',
    images: [
      {
        url: '/og-v2.png',
        width: 1200,
        height: 630,
        alt: 'Stride – Predicts distraction. Protects your focus.',
      },
    ],
    type: 'website',
  },

 twitter: {
  card: 'summary_large_image',
  title: 'Stride',
  description: 'Predicts distraction. Protects your focus.',
  images: ['/og-v2.png'], // updated
},

  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Stride',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },

}

export const viewport: Viewport = {
  themeColor: '#0f2a1f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${syne.variable} ${lora.variable} ${GeistSans.variable} font-sans`}>
        <ButtonStyles />
        <CardStyles />
        <WordmarkStyles />
        <Providers>{children}</Providers>
        <IOSInstallPrompt />
        <FeedbackButton />
      </body>
    </html>
  )
}
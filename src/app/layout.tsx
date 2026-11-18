import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Inter, Syne, Lora } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'
import IOSInstallPrompt from '../components/shared/ios-install-prompt';
import FeedbackButton from '../components/shared/feedback-button';
import { ButtonStyles } from '../components/ui/button'
import { CardStyles } from '../components/ui/card'
import { WordmarkStyles } from '../components/ui/wordmark'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const syne  = Syne({ subsets: ['latin'], variable: '--font-syne' })
const lora  = Lora({ subsets: ['latin'], weight: ['500','600'], variable: '--font-lora' })

const TITLE = 'Stride: Your focus companion that learns when you drift'
const DESCRIPTION = 'Your focus companion that learns when you drift. It steps in before it happens, and gets sharper over time.'

export const metadata: Metadata = {
  metadataBase: new URL('https://trystrideai.com'),
  // pages set their own title ("Privacy Policy") and get " · Stride" added
  title: { default: TITLE, template: '%s · Stride' },
  description: DESCRIPTION,
  applicationName: 'Stride',
  robots: { index: true, follow: true },

  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://trystrideai.com',
    siteName: 'Stride',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Stride: your focus companion that learns when you drift' }],
    type: 'website',
    locale: 'en_US',
  },

  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og.png'],
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
  themeColor: '#08090a',
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
    <html lang="en" suppressHydrationWarning>
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
import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers';
import { Inter, Syne } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const syne = Syne({ subsets: ['latin'], variable: '--font-syne' });


export const metadata: Metadata = {
  title: 'Stride - AI Focus Companion',
  description: 'Stay focused with AI-powered insights and interventions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
     <body className={`${inter.variable} ${syne.variable} font-sans`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

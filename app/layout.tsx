import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const viewport: Viewport = {
  themeColor: '#08090d',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'covilink | Bio Link & Metrics',
  description: 'Portal de links visual com métricas em tempo real de cliques e conversão.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} dark bg-[#08090d]`}>
      <body className="antialiased bg-[#08090d] text-gray-100 min-h-screen selection:bg-brand-pink/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}

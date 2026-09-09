import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

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
    <html lang="pt-BR" className={inter.variable}>
      <body className="antialiased selection:bg-brand-pink/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}

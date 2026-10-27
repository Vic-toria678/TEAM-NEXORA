import type { Metadata } from 'next';
import Header from '@/components/Header';
import Providers from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = { title: 'Sabi: find the moment, caption it right' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;700&family=Atkinson+Hyperlegible:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}

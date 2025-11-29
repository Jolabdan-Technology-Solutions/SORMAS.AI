import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'SORMAS AI - Global Disease Surveillance Platform',
  description:
    'Predictive analytics platform for global disease surveillance and outbreak prediction',
  keywords: ['disease surveillance', 'epidemiology', 'outbreak prediction', 'public health'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} style={{ backgroundColor: '#030014' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

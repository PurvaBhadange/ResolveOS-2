import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Source_Serif_4, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../components/AuthProvider';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ResolveOS | Enterprise Customer Resolution Platform',
  description: 'Deterministic, verifiable customer resolution platform for enterprise e-commerce.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#F5F0E8',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSerif.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen min-h-dvh overflow-x-hidden bg-background text-foreground font-serif antialiased selection:bg-black selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

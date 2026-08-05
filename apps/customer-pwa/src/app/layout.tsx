import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display, Space_Grotesk } from 'next/font/google';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Providers } from '@/components/Providers';
import { CompareBar } from '@/components/CompareBar';
import { AuthModal } from '@/components/AuthModal';
import { Toast } from '@/components/Toast';
import { FloatingCartPill } from '@/components/FloatingCartPill';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'LocalFashion — Discover local fashion stores near you',
    template: '%s | LocalFashion',
  },
  description:
    'Browse, compare, and connect with local fashion retailers near you. Find the best prices across shops in your city.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LocalFashion',
  },
  keywords: ['local fashion', 'boutique', 'clothing store', 'ethnic wear', 'western wear'],
};

export const viewport: Viewport = {
  themeColor: '#FF3E6C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable} ${spaceGrotesk.variable}`}>
      <head>
        {/* Preconnect for Unsplash image CDN */}
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body className="min-h-screen antialiased bg-[#FAFAF9] text-[#1A1A2E] font-sans">
        <Providers>
          <Toast />
          <AuthModal />
          <Header />
          <main className="mx-auto max-w-6xl px-4 py-4">{children}</main>
          <FloatingCartPill />
          <CompareBar />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}

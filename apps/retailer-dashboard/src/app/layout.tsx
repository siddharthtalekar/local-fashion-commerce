import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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
    default: 'Retailer Portal | LocalFashion',
    template: '%s | LocalFashion Retailer',
  },
  description: 'Manage your store, products, orders and analytics on LocalFashion',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'LF Retailer' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen antialiased bg-[#F5F5F6] text-[#282C3F] font-sans">
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from 'next';
import { Inter, Outfit, Playfair_Display } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/CartContext';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { AuthTokenRefresh } from '@/components/auth/AuthTokenRefresh';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-heading',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'MED-CARE Ethiopia | Healthcare Navigation',
  description: 'AI-Powered Healthcare Navigation and Medication Access',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Med Care',
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#16a34a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${playfair.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans antialiased bg-accent-50 text-gray-900 selection:bg-brand-200 selection:text-brand-900">
        <LanguageProvider>
          <CartProvider>
            <AuthTokenRefresh />
            {children}
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}


import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'sroff-crack',
  description: 'Jeux gratuits - sroff-crack',
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
      { url: '/icon.ico', type: 'image/x-icon' }
    ]
  },
  verification: {
    google: 'ZlhiLPerpxbp6z0KG2_Vi54lHeeiYQVX4gQjtWDm0Uk'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}


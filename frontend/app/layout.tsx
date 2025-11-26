import type { Metadata } from 'next';
import './globals.css';
import ThemeProviderWrapper from '@/components/providers/ThemeProviderWrapper';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Caava Group - Caava Knowledge Center',
  description: 'Caava Knowledge Center',
  icons: {
    icon: [
      { url: '/assets/logo.png', type: 'image/png' },
    ],
    apple: [
      { url: '/assets/logo.png', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProviderWrapper>
          {children}
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}

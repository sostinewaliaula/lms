import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';

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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

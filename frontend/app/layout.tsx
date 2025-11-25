import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LMS - Learning Management System',
  description: 'Self-hosted Learning Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}



import './globals.css';
import { ThemeProvider } from '@/lib/contexts/ThemeContext';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'be-part-of.net | The Anti-Social Social Network',
  description: 'A consciousness network platform that visualizes human and AI relationships as an interactive 3D graph',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

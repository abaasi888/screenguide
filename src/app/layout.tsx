import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ScreenGuide',
  description: 'Turn a short screen recording into a timestamped how-to guide.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
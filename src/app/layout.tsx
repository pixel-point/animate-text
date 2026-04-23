import '@/styles/globals.css';

import type { Metadata } from 'next';

const DEFAULT_SITE_URL = 'https://pixelpoint.io';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_DEFAULT_SITE_URL ?? DEFAULT_SITE_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {children}
    </html>
  );
}

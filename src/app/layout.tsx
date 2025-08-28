'use client';

import { useState, useEffect } from 'react';
import type { Metadata } from 'next';
import AppLayout from '@/components/layout/app-layout';
import SplashScreen from '@/components/layout/splash-screen';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

// Even though this is a client component, we can still define metadata
// See: https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates#exporting-metadata-from-client-components
/*
export const metadata: Metadata = {
  title: 'MediAI',
  description: 'Your personal AI health assistant for diagnostics, reports, and guidance.',
};
*/

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Show splash screen for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {loading ? (
          <SplashScreen />
        ) : (
          <>
            <AppLayout>{children}</AppLayout>
            <Toaster />
          </>
        )}
      </body>
    </html>
  );
}

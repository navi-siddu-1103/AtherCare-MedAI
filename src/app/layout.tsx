
'use client';

import type { Metadata } from 'next';
import AppLayout from '@/components/layout/app-layout';
import SplashScreen from '@/components/layout/splash-screen';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { usePathname } from 'next/navigation';

// Even though this is a client component, we can still define metadata
// See: https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates#exporting-metadata-from-client-components
/*
export const metadata: Metadata = {
  title: 'MediAI',
  description: 'Your personal AI health assistant for diagnostics, reports, and guidance.',
};
*/

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (loading) {
    return <SplashScreen />;
  }

  // If we have a user and we are not on an auth page, show the main app layout.
  // Otherwise, show the children directly (which will be the login/signup pages).
  return (
    <>
      {user && !isAuthPage ? <AppLayout>{children}</AppLayout> : children}
      <Toaster />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <AppContent>{children}</AppContent>
        </AuthProvider>
      </body>
    </html>
  );
}

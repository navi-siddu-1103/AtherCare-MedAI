
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, User } from '@/lib/firebase/auth'; 
import { login, signup, logout } from '@/lib/firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: typeof login;
  signup: typeof signup;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/signup';

    // If the user is not logged in and is trying to access a protected page,
    // redirect them to the login page.
    if (!user && !isAuthPage) {
      router.push('/login');
    }
    
  }, [user, loading, pathname, router]);

  const handleLogout = async () => {
    await logout();
    // Setting user to null is handled by onAuthStateChanged
    router.push('/login');
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout: handleLogout,
  };

  // While the initial user state is loading, we don't render anything.
  // This prevents a flash of the login page for already authenticated users.
  if (loading) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


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
      
      const isAuthPage = pathname === '/login' || pathname === '/signup';

      if (user && isAuthPage) {
        router.push('/dashboard');
      } else if (!user && !isAuthPage && pathname !== '/') {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

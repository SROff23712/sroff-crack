'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { isAdmin } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  admin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  admin: false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    admin: isAdmin(user)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


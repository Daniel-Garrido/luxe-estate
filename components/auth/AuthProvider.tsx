'use client';

import React, { createContext, useContext } from 'react';
import type { AuthUser } from '@/types/auth';

const AuthContext = createContext<AuthUser | null>(null);

// The user is read on the server (root layout) so the navbar avatar renders without a flash
export const AuthProvider: React.FC<{
  user: AuthUser | null;
  children: React.ReactNode;
}> = ({ user, children }) => (
  <AuthContext.Provider value={user}>{children}</AuthContext.Provider>
);

// Current signed-in user in Client Components, or null when signed out
export function useAuth(): AuthUser | null {
  return useContext(AuthContext);
}

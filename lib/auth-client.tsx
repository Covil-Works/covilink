'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  User,
  onAuthStateChanged,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  signInEmail: (email: string, pass: string) => Promise<User>;
  signOutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Updates or clears the firebase_token cookie to mirror current auth state.
 */
function syncCookieToken(token: string | null) {
  if (typeof document === 'undefined') return;
  if (token) {
    document.cookie = `firebase_token=${token}; path=/; max-age=3600; SameSite=Lax`;
  } else {
    document.cookie = 'firebase_token=; path=/; max-age=0; SameSite=Lax';
  }
}

/**
 * Translates Firebase Auth error codes into clear Portuguese error messages.
 */
export function getAuthErrorMessage(error: any): string {
  const code = error?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mail ou senha incorretos. Verifique suas credenciais.';
    case 'auth/invalid-email':
      return 'Formato de e-mail inválido.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas sem sucesso. Por segurança, aguarde alguns instantes antes de tentar novamente.';
    case 'auth/network-request-failed':
      return 'Erro de conexão com a internet. Verifique sua rede e tente novamente.';
    case 'auth/user-disabled':
      return 'Esta conta de administrador foi desativada no Firebase Console.';
    default:
      return error?.message || 'Ocorreu um erro ao autenticar. Tente novamente.';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for token changes and automatic token refreshes
    const unsubscribeToken = onIdTokenChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const freshToken = await currentUser.getIdToken();
          setToken(freshToken);
          syncCookieToken(freshToken);
        } catch {
          setToken(null);
          syncCookieToken(null);
        }
      } else {
        setToken(null);
        syncCookieToken(null);
      }
    });

    // Listen for general auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const t = await currentUser.getIdToken();
          setToken(t);
          syncCookieToken(t);
        } catch {
          setToken(null);
          syncCookieToken(null);
        }
      } else {
        setToken(null);
        syncCookieToken(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeToken();
      unsubscribeAuth();
    };
  }, []);

  const getIdToken = useCallback(async () => {
    if (!auth.currentUser) return null;
    try {
      const freshToken = await auth.currentUser.getIdToken(true);
      setToken(freshToken);
      syncCookieToken(freshToken);
      return freshToken;
    } catch {
      return null;
    }
  }, []);

  const signInEmail = useCallback(async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const t = await cred.user.getIdToken();
    setToken(t);
    syncCookieToken(t);
    return cred.user;
  }, []);

  const signOutUser = useCallback(async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setToken(null);
    syncCookieToken(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      loading,
      token,
      signInEmail,
      signOutUser,
      resetPassword,
      getIdToken,
    }),
    [user, loading, token, signInEmail, signOutUser, resetPassword, getIdToken]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um <AuthProvider>');
  }
  return context;
}

/**
 * Universal authenticated fetch function that automatically injects the Firebase Bearer token.
 */
export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const currentUser = auth.currentUser;
  let token: string | null = null;

  if (currentUser) {
    try {
      token = await currentUser.getIdToken();
      syncCookieToken(token);
    } catch (err) {
      console.warn('Erro ao obter token do Firebase para requisição:', err);
    }
  }

  const headers = new Headers(init?.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}

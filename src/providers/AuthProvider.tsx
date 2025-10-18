import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';

import { supabase } from '../lib/supabaseClient';

type AuthStatus = 'loading' | 'signed-in' | 'signed-out' | 'disabled';

interface AuthContextValue {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const disabledValue: AuthContextValue = {
  status: 'disabled',
  session: null,
  user: null,
  signIn: async () => {
    throw new Error('Supabase auth is not configured.');
  },
  signOut: async () => {},
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [{ status, session }, setState] = useState<{ status: AuthStatus; session: Session | null }>({
    status: supabase ? 'loading' : 'disabled',
    session: null,
  });

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    let isMounted = true;

    // Handle initial session and URL hash
    const initializeAuth = async () => {
      try {
        // Check for auth tokens in URL hash (from magic link)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          // Set session from URL tokens
          const { data, error } = await client.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (!error && data.session) {
            // Clear tokens from URL
            window.history.replaceState({}, document.title, window.location.pathname);
            if (!isMounted) return;
            setState({
              status: 'signed-in',
              session: data.session,
            });
            return;
          }
        }
        
        // Fallback to getSession
        const { data } = await client.auth.getSession();
        if (!isMounted) return;
        setState({
          status: data.session ? 'signed-in' : 'signed-out',
          session: data.session ?? null,
        });
      } catch (error) {
        console.error('[auth] initialization error:', error);
        if (!isMounted) return;
        setState({ status: 'signed-out', session: null });
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, nextSession) => {
      console.log('[auth] state change:', event, nextSession?.user?.email);
      setState({
        status: nextSession ? 'signed-in' : 'signed-out',
        session: nextSession ?? null,
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const client = supabase;
    if (!client) return disabledValue;

    const user = session?.user ?? null;

    return {
      status,
      session,
      user,
      signIn: async (email: string) => {
        const redirectTo = window.location.origin + window.location.pathname;
        const { error } = await client.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: redirectTo,
            shouldCreateUser: true
          }
        });
        if (error) throw error;
      },
      signOut: async () => {
        const { error } = await client.auth.signOut();
        if (error) throw error;
      },
    };
  }, [session, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
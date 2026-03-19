import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../api/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { UserProfile } from '../types';
import { getProfile } from '../api/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (user) {
      try {
        const p = await getProfile(user.id);
        setProfile(p);
      } catch {
        // Profile might not exist yet (DB trigger delay after signup) — retry once after 1.5s
        await new Promise(resolve => setTimeout(resolve, 1500));
        try {
          const p = await getProfile(user.id);
          setProfile(p);
        } catch (retryErr) {
          console.error('Profile fetch failed after retry:', retryErr);
        }
      }
    }
  };

  useEffect(() => {
    let didTimeout = false;

    // Safety timeout: if getSession hangs (e.g. stale refresh token), stop loading after 5s
    const timeout = setTimeout(() => {
      didTimeout = true;
      setLoading(false);
    }, 5000);

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!didTimeout) {
        clearTimeout(timeout);
        setSession(s);
        setUser(s?.user ?? null);
        setLoading(false);
      }
    }).catch((err) => {
      console.error('getSession failed:', err);
      if (!didTimeout) {
        clearTimeout(timeout);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      clearTimeout(timeout);
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      refreshProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

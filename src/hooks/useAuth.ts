import { useState, useCallback } from 'react';
import * as authApi from '../api/auth';

export function useSignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.signIn(email, password);
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'שגיאה בהתחברות';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { signIn, loading, error };
}

export function useSignUp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.signUp(email, password, fullName);
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'שגיאה בהרשמה';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { signUp, loading, error };
}

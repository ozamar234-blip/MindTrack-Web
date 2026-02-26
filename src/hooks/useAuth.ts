import { useState, useCallback } from 'react';
import * as authApi from '../api/auth';

function translateAuthError(message: string): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'אימייל או סיסמה שגויים',
    'Email not confirmed': 'האימייל לא אומת',
    'User already registered': 'משתמש עם אימייל זה כבר קיים',
    'Signup requires a valid password': 'נדרשת סיסמה תקינה',
    'Password should be at least 6 characters': 'הסיסמה חייבת להכיל לפחות 6 תווים',
    'Unable to validate email address: invalid format': 'כתובת אימייל לא תקינה',
    'Email rate limit exceeded': 'יותר מדי ניסיונות, נסה שוב מאוחר יותר',
    'For security purposes, you can only request this after': 'מטעמי אבטחה, נסה שוב בעוד מספר שניות',
  };
  for (const [eng, heb] of Object.entries(errorMap)) {
    if (message.includes(eng)) return heb;
  }
  return message;
}

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
      const raw = err instanceof Error ? err.message : 'שגיאה בהתחברות';
      setError(translateAuthError(raw));
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
      const raw = err instanceof Error ? err.message : 'שגיאה בהרשמה';
      setError(translateAuthError(raw));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { signUp, loading, error };
}

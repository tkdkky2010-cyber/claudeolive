import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../api/client';
import api from '../api/api'; // Import the configured axios instance

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for an existing session
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    };
    getSession();

    // Listen for changes in authentication state
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Cleanup the listener on component unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const signInWithGoogle = async () => {
    // Redirect to backend endpoint for Google OAuth
    window.location.href = 'http://localhost:3001/api/auth/google';
  };

  const signUp = async (email, password, options) => {
    try {
      const response = await api.post('http://localhost:3001/api/auth/signup', { email, password, passwordConfirm: password, name: options?.data?.full_name });
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error signing up:', error.response?.data || error.message);
      if (error.isAxiosError) {
        console.error('Axios error details:', error.toJSON());
      }
      return { data: null, error: error.response?.data || error };
    }
  };

  const signInWithPassword = async (email, password) => {
    try {
      const { data } = await api.post('http://localhost:3001/api/auth/login', { email, password });
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error.response?.data || error.message);
      if (error.isAxiosError) {
        console.error('Axios error details:', error.toJSON());
      }
      return { data: null, error: error.response?.data || error };
    }
  };
  
  const value = {
    session,
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    signInWithGoogle,
    signUp,
    signInWithPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

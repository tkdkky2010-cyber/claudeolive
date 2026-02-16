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
      console.log('🔍 [AuthContext] Checking for existing session...');
      const { data } = await supabase.auth.getSession();
      console.log('🔍 [AuthContext] Session:', data.session ? 'Found' : 'None');
      console.log('🔍 [AuthContext] User:', data.session?.user?.email);
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    };
    getSession();

    // Listen for changes in authentication state
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 [AuthContext] Auth state changed:', event);
        console.log('🔄 [AuthContext] New session:', session ? 'Yes' : 'No');
        console.log('🔄 [AuthContext] User:', session?.user?.email);

        // Sync Google users to public database
        if (session?.user && event === 'SIGNED_IN') {
          const provider = session.user.app_metadata?.provider;
          console.log('🔄 [AuthContext] Login provider:', provider);

          if (provider === 'google') {
            console.log('🔄 [AuthContext] Syncing Google user to database...');
            try {
              // Call backend to sync user
              await api.post('/auth/sync-user', {
                supabaseId: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
                avatarUrl: session.user.user_metadata?.avatar_url,
              });
              console.log('✅ [AuthContext] Google user synced');
            } catch (err) {
              console.warn('⚠️ [AuthContext] Failed to sync user:', err);
            }
          }
        }

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
    console.log('🔵 Starting Google OAuth...');
    try {
      // Use Supabase's built-in Google OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:5174/auth/callback',
        },
      });

      if (error) {
        console.error('❌ Google OAuth error:', error);
        alert('Google 로그인 실패: ' + error.message);
      } else {
        console.log('✅ Redirecting to Google...');
      }
    } catch (err) {
      console.error('❌ Unexpected error:', err);
      alert('Google 로그인 중 오류가 발생했습니다.');
    }
  };

  const signUp = async (email, password, options) => {
    try {
      const response = await api.post('http://localhost:3001/api/auth/signup', { email, password, passwordConfirm: password, name: options?.data?.full_name });

      // If the backend returns a session (auto-login after signup), sync it to the frontend Supabase client
      if (response.data.data?.session) {
        await supabase.auth.setSession(response.data.data.session);
      }

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

      // Sync the session returned by the backend to the frontend Supabase client
      if (data.success && data.data?.session) {
        const { error: sessionError } = await supabase.auth.setSession(data.data.session);
        if (sessionError) throw sessionError;
      }

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

import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 토큰 유효성 확인
  useEffect(() => {
    const validateToken = async () => {
      const savedToken = localStorage.getItem('auth_token');
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.get('/auth/me');
        setUser(response.data.user);
        setToken(savedToken);
      } catch (error) {
        console.error('토큰 유효성 검증 실패:', error);
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  // 로그아웃 이벤트 리스너
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, []);

  const login = async (credential) => {
    try {
      const response = await apiClient.post('/auth/google', { idToken: credential });
      const { token: newToken, user: newUser } = response.data.data;

      localStorage.setItem('auth_token', newToken);
      setToken(newToken);
      setUser(newUser);

      return { success: true };
    } catch (error) {
      console.error('로그인 실패:', error);
      return {
        success: false,
        error: error.response?.data?.error || '로그인에 실패했습니다'
      };
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token: newToken, user: newUser } = response.data.data;

      localStorage.setItem('auth_token', newToken);
      setToken(newToken);
      setUser(newUser);

      return { success: true };
    } catch (error) {
      console.error('로그인 실패:', error);

      // Handle specific error cases
      const errorData = error.response?.data;
      let errorMessage = '로그인에 실패했습니다';

      if (errorData?.locked) {
        errorMessage = errorData.error || '계정이 일시적으로 잠겼습니다. 나중에 다시 시도하세요.';
      } else if (error.response?.status === 429) {
        errorMessage = errorData?.error || '너무 많은 로그인 시도입니다. 잠시 후 다시 시도하세요.';
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      } else if (!error.response) {
        errorMessage = '네트워크 연결을 확인해주세요';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const signup = async (email, password, passwordConfirm, name) => {
    try {
      const response = await apiClient.post('/auth/signup', {
        email,
        password,
        passwordConfirm,
        name
      });
      const { token: newToken, user: newUser } = response.data.data;

      localStorage.setItem('auth_token', newToken);
      setToken(newToken);
      setUser(newUser);

      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('회원가입 실패:', error);

      const errorData = error.response?.data;

      // Handle enhanced error response with details array
      if (errorData?.details && Array.isArray(errorData.details)) {
        return {
          success: false,
          error: {
            message: errorData.error || '회원가입에 실패했습니다',
            details: errorData.details
          }
        };
      }

      // Handle rate limiting
      if (error.response?.status === 429) {
        return {
          success: false,
          error: errorData?.error || '너무 많은 회원가입 시도입니다. 잠시 후 다시 시도하세요.'
        };
      }

      // Handle network errors
      if (!error.response) {
        return {
          success: false,
          error: '네트워크 연결을 확인해주세요'
        };
      }

      return {
        success: false,
        error: errorData?.error || '회원가입에 실패했습니다'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,           // Google OAuth용
    loginWithEmail,  // 이메일 로그인용
    signup,          // 회원가입용
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

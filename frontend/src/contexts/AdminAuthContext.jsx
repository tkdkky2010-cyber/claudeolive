import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 토큰 유효성 확인
  useEffect(() => {
    const validateToken = async () => {
      const savedToken = localStorage.getItem('admin_token');
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.get('/admin-auth/me', {
          headers: { Authorization: `Bearer ${savedToken}` }
        });
        setAdmin(response.data.data);
        setToken(savedToken);
      } catch (error) {
        console.error('관리자 토큰 유효성 검증 실패:', error);
        localStorage.removeItem('admin_token');
        setToken(null);
        setAdmin(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/admin-auth/login', { email, password });
      const { token: newToken, admin: newAdmin } = response.data.data;

      localStorage.setItem('admin_token', newToken);
      setToken(newToken);
      setAdmin(newAdmin);

      return { success: true };
    } catch (error) {
      console.error('관리자 로그인 실패:', error);
      return {
        success: false,
        error: error.response?.data?.error || '로그인에 실패했습니다'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setAdmin(null);
  };

  const value = {
    admin,
    token,
    isLoading,
    isAuthenticated: !!admin,
    login,
    logout,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}

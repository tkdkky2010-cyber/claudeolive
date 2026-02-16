import axios from 'axios';
import { supabase } from './client'; // Import supabase from client.js

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
console.log('🔧 [API] Base URL:', baseURL);

const api = axios.create({
  baseURL,
  timeout: 10000, // 10초 타임아웃
});

// Add a request interceptor to include the Supabase access token
api.interceptors.request.use(
  async (config) => {
    console.log('📡 [API] 요청 시작:', config.method?.toUpperCase(), config.url);

    // Only add auth token for protected routes (cart, auth, seller)
    const needsAuth = config.url?.includes('/cart') ||
                     config.url?.includes('/auth') ||
                     config.url?.includes('/seller');

    if (needsAuth) {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`;
          console.log('🔐 [API] 인증 토큰 추가됨');
        }
      } catch (error) {
        console.warn('⚠️ [API] 세션 가져오기 실패:', error.message);
      }
    } else {
      console.log('🌐 [API] 공개 API 요청');
    }

    return config;
  },
  (error) => {
    console.error('❌ [API] 요청 인터셉터 에러:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ [API] 응답 성공:', response.config.url, '- 상태:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ [API] 응답 에러:', error.config?.url);
    console.error('❌ [API] 에러 상세:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default api;

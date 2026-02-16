import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../api/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { session, isAuthenticated, signInWithPassword, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // 이미 로그인된 경우 홈으로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);



  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error } = await signInWithPassword(email, password);

    if (error) {
      // Backend returns errors in format: { success: false, error: 'message' }
      const errorMessage = error.error || error.message || '로그인에 실패했습니다. 다시 시도해주세요.';
      setError(errorMessage);
    } else {
      navigate('/'); // On success, AuthProvider will handle session and redirect
    }

    setIsLoading(false);
  };
  
  const handleGoogleLogin = async () => {
    setError('');
    await signInWithGoogle();
    // The AuthProvider will handle navigation on successful login.
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">로그인</h1>
          <p className="text-text-secondary">
            올리브영 랭킹 커머스에 오신 것을 환영합니다
          </p>
        </div>

        {/* 이메일 로그인 폼 */}
        <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text mb-1">
              이메일
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text mb-1">
              비밀번호
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="비밀번호를 입력하세요"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {/* ... (eye icon SVG remains the same) */}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 구분선 */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-text-secondary">또는</span>
          </div>
        </div>
        
        {/* Google 로그인 버튼 */}
        <button
          onClick={handleGoogleLogin}
          className="w-full border border-gray-300 py-2.5 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors"
        >
          <img src="https://www.google.com/images/hpp/ic_wahlberg_product_core_48.png" alt="Google" className="w-5 h-5" />
          <span className="text-text font-medium">Google로 로그인</span>
        </button>
        
        {/* 회원가입 링크 */}
        <div className="text-center text-sm text-text-secondary mt-6">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="text-primary font-medium hover:underline">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}

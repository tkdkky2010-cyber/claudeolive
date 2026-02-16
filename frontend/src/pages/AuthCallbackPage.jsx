import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/client';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for OAuth errors first
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        console.log('🔍 Auth callback - checking params...');
        console.log('URL params:', Object.fromEntries(urlParams));
        console.log('Hash:', window.location.hash);

        if (error) {
          console.error('❌ OAuth error:', error, errorDescription);
          setStatus('error');
          setMessage(errorDescription || '소셜 로그인 중 오류가 발생했습니다.');
          return;
        }

        // Check if Supabase already set the session (for Google OAuth)
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          console.log('✅ Session already exists (Google OAuth)');
          setStatus('success');
          setMessage('로그인이 완료되었습니다! 잠시 후 홈페이지로 이동합니다.');
          setTimeout(() => {
            navigate('/');
          }, 1500);
          return;
        }

        // Check hash params for manual token setting (email confirmation)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log('Hash params:', { type, hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken });

        if (accessToken && refreshToken) {
          console.log('🔑 Setting session from hash params...');
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('❌ Error setting session:', sessionError);
            setStatus('error');
            setMessage('인증 중 오류가 발생했습니다.');
          } else {
            console.log('✅ Session set successfully');
            setStatus('success');
            setMessage(type === 'google'
              ? 'Google 로그인이 완료되었습니다!'
              : '이메일 인증이 완료되었습니다!');
            setTimeout(() => {
              navigate('/');
            }, 1500);
          }
        } else {
          // No session and no tokens - just redirect
          console.log('⚠️ No session or tokens, redirecting to home');
          navigate('/');
        }
      } catch (err) {
        console.error('❌ Auth callback error:', err);
        console.error('Error details:', err.message, err.stack);

        // Don't show error if user is actually logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('✅ Despite error, user is logged in - redirecting');
          navigate('/');
        } else {
          setStatus('error');
          setMessage('예상치 못한 오류가 발생했습니다.');
        }
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-text mb-2">로그인 처리 중...</h1>
              <p className="text-text-secondary">잠시만 기다려주세요.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-green-600 mb-2">인증 완료!</h1>
              <p className="text-text-secondary">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-red-600 mb-2">인증 실패</h1>
              <p className="text-text-secondary mb-4">{message}</p>
              <button
                onClick={() => navigate('/')}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                홈으로 이동
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

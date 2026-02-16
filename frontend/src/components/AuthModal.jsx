import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthModal({ onClose }) {
  const { signInWithPassword, signUp, signInWithGoogle } = useAuth();
  const modalRef = useRef(null);
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // ESC 키로 닫기
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);



  const handleGoogleResponse = async (response) => {
    const result = await login(response.credential);
    if (result.success) {
      onClose();
    } else {
      setError(result.error || '로그인에 실패했습니다');
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signInWithPassword(email, password);

        if (error) {
          const errorMessage = error.error || error.message || '로그인에 실패했습니다.';
          setError(errorMessage);
        } else {
          onClose();
        }
      } else {
        // Signup
        if (password !== passwordConfirm) {
          setError('비밀번호가 일치하지 않습니다');
          setIsLoading(false);
          return;
        }

        const { data, error } = await signUp(email, password, { data: { full_name: name || '' } });

        if (error) {
          // Handle error with details array (like password validation errors)
          if (error.details && Array.isArray(error.details)) {
            const detailsText = error.details.join('\n');
            setError(`${error.error || '회원가입 오류'}\n\n${detailsText}`);
          } else {
            const errorMessage = error.error || error.message || '회원가입에 실패했습니다.';
            setError(errorMessage);
          }
        } else if (data?.data?.requiresConfirmation) {
          // Email confirmation required
          setMessage('✅ 회원가입 완료!\n\n📧 이메일을 확인하여 인증 링크를 클릭해주세요.\n인증 후 자동으로 로그인됩니다.');
          // Keep modal open to show message
        } else {
          // Success - auto login
          setMessage('✅ 회원가입 완료! 로그인 중...');
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('예상치 못한 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setMessage('');
    setEmail('');
    setPassword('');
    setPasswordConfirm('');
    setName('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 relative animate-fade-in"
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
          aria-label="닫기"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 로고 */}
        <div className="text-center mb-6">
          <h2 id="modal-title" className="text-2xl font-bold text-primary mb-2">올영 TOP 100</h2>
          <p className="text-sm text-gray-600">
            {mode === 'login' ? '간편하게 로그인하고 장바구니를 이용하세요' : '새 계정을 만들어보세요'}
          </p>
        </div>



        {/* Google 로그인 */}
        <button
          onClick={() => {
            console.log('🔵 Google 로그인 버튼 클릭!');
            console.log('signInWithGoogle function:', signInWithGoogle);
            signInWithGoogle();
          }}
          className="w-full border border-gray-300 py-3 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="text-gray-700 font-medium">Google로 계속하기</span>
        </button>

        {/* 구분선 */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-500">또는 이메일로</span>
          </div>
        </div>

        {/* 이메일 로그인/회원가입 폼 */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label htmlFor="modal-email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              type="email"
              id="modal-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label htmlFor="modal-password" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              id="modal-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="8자 이상"
            />
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <label htmlFor="modal-password-confirm" className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  id="modal-password-confirm"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="비밀번호를 다시 입력하세요"
                />
              </div>

              <div>
                <label htmlFor="modal-name" className="block text-sm font-medium text-gray-700 mb-1">
                  이름 (선택)
                </label>
                <input
                  type="text"
                  id="modal-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="홍길동"
                />
              </div>
            </>
          )}

          {/* Success message */}
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
              <div className="whitespace-pre-line">{message}</div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <div className="whitespace-pre-line">{error}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (mode === 'login' ? '로그인 중...' : '가입 중...') : (mode === 'login' ? '로그인' : '회원가입')}
          </button>
        </form>

        {/* 모드 전환 */}
        <div className="mt-6 text-center">
          <button
            onClick={switchMode}
            className="text-sm text-primary hover:underline font-medium"
          >
            {mode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>

        {/* 약관 동의 */}
        <p className="mt-6 text-xs text-center text-gray-500">
          로그인 시{' '}
          <a href="#" className="text-primary underline">이용약관</a> 및{' '}
          <a href="#" className="text-primary underline">개인정보처리방침</a>에<br />
          동의하는 것으로 간주됩니다
        </p>
      </div>
    </div>
  );
}

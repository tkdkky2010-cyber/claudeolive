import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthModal({ onClose }) {
  const { login, loginWithEmail, signup } = useAuth();
  const modalRef = useRef(null);
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);

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

  useEffect(() => {
    // Google Identity Services 초기화 (이미 로드된 스크립트 사용)
    const initGoogle = () => {
      if (window.google && !googleInitialized) {
        try {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
          });

          const buttonDiv = document.getElementById('google-signin-button-modal');
          if (buttonDiv) {
            window.google.accounts.id.renderButton(buttonDiv, {
              theme: 'outline',
              size: 'large',
              width: buttonDiv.offsetWidth || 350,
              text: 'continue_with',
              locale: 'ko',
            });
            setGoogleInitialized(true);
          }
        } catch (err) {
          console.error('Google Sign-In 초기화 오류:', err);
        }
      }
    };

    // 스크립트가 이미 로드되어 있으면 바로 초기화
    if (window.google) {
      initGoogle();
    } else {
      // 스크립트 로드 대기
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          initGoogle();
        }
      }, 100);

      return () => clearInterval(checkGoogle);
    }
  }, [googleInitialized]);

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
    setIsLoading(true);

    let result;
    if (mode === 'login') {
      result = await loginWithEmail(email, password);
    } else {
      if (password !== passwordConfirm) {
        setError('비밀번호가 일치하지 않습니다');
        setIsLoading(false);
        return;
      }
      result = await signup(email, password, passwordConfirm, name || null);
    }

    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
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

        {/* Google 로그인 버튼 */}
        <div className="mb-6">
          <div id="google-signin-button-modal" className="flex justify-center"></div>
        </div>

        {/* 구분선 */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-500">또는</span>
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
              placeholder="8자 이상, 영문+숫자"
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

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
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

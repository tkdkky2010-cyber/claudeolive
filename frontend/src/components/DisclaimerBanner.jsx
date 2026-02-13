import { useState, useEffect } from 'react';

export default function DisclaimerBanner() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('disclaimer_dismissed');
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem('disclaimer_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-disclaimer border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-[#333333] leading-relaxed">
              <span className="font-semibold">면책 조항:</span> 본 사이트는 CJ올리브영(주)의 공식 사이트가 아니며, 제휴 관계가 없습니다.
              올리브영에서 구매한 정품을 해외로 수출하는 독립 셀러가 운영합니다.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-[#333333] hover:text-text transition-colors p-1"
            aria-label="배너 닫기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

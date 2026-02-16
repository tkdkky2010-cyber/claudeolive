import { useToast } from '../contexts/ToastContext';

export default function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="pointer-events-auto animate-slide-in-up"
          style={{
            animationDelay: `${index * 0.1}s`,
          }}
        >
          <div
            className={`
              px-6 py-3 rounded-lg shadow-lg text-white font-medium
              flex items-center gap-2 min-w-[280px]
              ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}
            `}
          >
            {toast.type === 'success' ? (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

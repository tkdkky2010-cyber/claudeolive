/**
 * LoadingSpinner Component
 * Reusable loading spinner for async operations
 */
export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div
      className={`inline-block ${sizeClasses[size]} border-solid border-t-transparent border-primary rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * FullPageLoadingSpinner Component
 * Loading spinner that covers the entire page
 */
export function FullPageLoadingSpinner({ message = '로딩 중...' }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-xl">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-text font-medium">{message}</p>
      </div>
    </div>
  );
}

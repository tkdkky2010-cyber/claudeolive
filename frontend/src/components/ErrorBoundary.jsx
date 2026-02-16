import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">오류가 발생했습니다</h1>
              <p className="text-gray-700 mb-4">
                페이지를 렌더링하는 중 오류가 발생했습니다.
              </p>
              <div className="bg-red-100 border border-red-300 rounded p-4 mb-4 text-left">
                <p className="text-sm font-mono text-red-800">
                  {this.state.error?.toString()}
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark"
              >
                페이지 새로고침
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

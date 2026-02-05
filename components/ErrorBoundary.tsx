'use client';

import { ReactNode, Component, ReactElement } from 'react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactElement;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-[#070713] text-white flex items-center justify-center p-6">
            <div className="max-w-md w-full">
              <div className="space-y-6 text-center">
                {/* Error Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0v2m0-4v-2m0 4h2m-4 0h2m-4 0H8m4 0h4" />
                  </svg>
                </div>

                {/* Error Message */}
                <div>
                  <h1 className="text-2xl font-bold gradient-text mb-2">
                    Something went wrong
                  </h1>
                  <p className="text-[#b6bbff]/70 text-sm">
                    We encountered an unexpected error. Don&apos;t worry, our team has been notified.
                  </p>
                </div>

                {/* Error Details (dev only) */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="p-4 rounded-lg bg-[#0d0d1a]/80 border border-red-500/20 text-left">
                    <p className="text-xs text-red-400 font-mono break-all">
                      {this.state.error.message}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center pt-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-[#6265fe] hover:bg-[#7d85d0] text-white font-medium rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                  <Link
                    href="/"
                    className="px-6 py-2 bg-[#0d0d1a]/80 border border-[#7d85d0]/20 hover:border-[#6265fe]/30 text-white font-medium rounded-lg transition-colors"
                  >
                    Go Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

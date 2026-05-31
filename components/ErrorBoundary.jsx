/**
 * Error Boundary with Logging - Catches React component errors and logs them
 * Purpose: Automatically log React errors to debug system
 * Checkpoint 3: Frontend Action & Error Logging
 */

'use client';

import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Store error details
    const errorId = Math.random().toString(36).substring(2, 11);
    
    this.setState({
      error,
      errorInfo,
      errorId
    });

    // Log to console
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 my-4">
          <div className="flex items-start gap-4">
            <div className="text-red-600 text-2xl">⚠️</div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-red-800 mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-red-700 mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              {process.env.NODE_ENV === 'development' && (
                <>
                  <details className="mb-4 text-sm text-red-600">
                    <summary className="cursor-pointer font-semibold mb-2">
                      Error Details
                    </summary>
                    <pre className="bg-red-100 p-2 rounded overflow-auto max-h-64 text-xs">
                      {this.state.error?.stack}
                    </pre>
                  </details>
                </>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reload Page
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 bg-red-200 text-red-800 rounded hover:bg-red-300"
                >
                  Go Back
                </button>
              </div>
              {this.state.errorId && (
                <p className="text-xs text-red-600 mt-4">
                  Error ID: {this.state.errorId}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}



import React, { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children?: ReactNode;
}

// Explicitly use React.Component to resolve inheritance errors with setState and props.
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: any): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error };
  }

  componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // FIX: Explicitly cast 'this' to 'any' to resolve 'Property setState does not exist' error.
    (this as any).setState({ errorInfo: errorInfo });
  }

  handleClearCacheAndReload = () => {
    if (!window.confirm("This will clear all application caches and force a reload. This can help fix display issues. Are you sure you want to proceed?")) {
        return;
    }

    let unregistering: Promise<any> = Promise.resolve();
    if ('serviceWorker' in navigator) {
        unregistering = navigator.serviceWorker.getRegistrations().then(function(registrations) {
            return Promise.all(registrations.map(r => r.unregister()));
        });
    }

    unregistering.then(() => {
        return caches.keys();
    }).then(function(cacheNames) {
        return Promise.all(
            cacheNames.map(function(cacheName) {
                return caches.delete(cacheName);
            })
        );
    }).then(() => {
        alert("Cache and service workers cleared. The application will now perform a hard reload.");
        sessionStorage.setItem('sw-unregistered-v3', 'true');
        window.location.reload();
    }).catch(error => {
        console.error("Cache clearing failed:", error);
        alert("Could not clear cache. Please try clearing your browser's data manually.");
    });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
            <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8 text-center">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h1 className="mt-5 text-2xl font-bold text-slate-800">Oops! Something went wrong.</h1>
                <p className="mt-2 text-slate-600">
                    An unexpected error occurred. You can try refreshing the page or clearing the cache to resolve the issue.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-secondary"
                    >
                        Refresh Page
                    </button>
                    <button
                        onClick={this.handleClearCacheAndReload}
                        className="btn btn-primary bg-red-600 hover:bg-red-700 focus:ring-red-500"
                    >
                        Clear Cache & Reload
                    </button>
                </div>

                <div className="mt-8 text-left">
                    <details className="bg-slate-50 p-3 rounded-lg">
                        <summary className="font-semibold text-slate-700 cursor-pointer">Error Details</summary>
                        <pre className="mt-2 text-xs text-slate-600 whitespace-pre-wrap break-all overflow-auto max-h-48">
                            {this.state.error instanceof Error 
                                ? this.state.error.toString() 
                                : typeof this.state.error === 'object' 
                                    ? JSON.stringify(this.state.error, null, 2) 
                                    : String(this.state.error)
                            }
                            <br />
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </details>
                </div>
            </div>
        </div>
      );
    }

    // FIX: Explicitly cast 'this' to 'any' to resolve 'Property props does not exist' error.
    return (this as any).props.children || null;
  }
}
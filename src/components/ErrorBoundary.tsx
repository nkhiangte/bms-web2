

import React, { ErrorInfo, ReactNode } from 'react';
import { SpinnerIcon, XIcon } from '@/components/Icons';

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children?: ReactNode;
}

export class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: any): Partial<ErrorBoundaryState> {
    return { hasError: true, error: error };
  }

  componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
    (this as any).setState({ errorInfo: errorInfo });
  }

  handleClearCacheAndReload = () => {
    // In an iframe, we should avoid window.confirm/alert. 
    // We'll just proceed with clearing cache as it's a safe recovery action.
    
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
        sessionStorage.setItem('sw-unregistered-v3', 'true');
        window.location.reload();
    }).catch(error => {
        console.error("Cache clearing failed:", error);
    });
  }
  
  render() {
    const state = (this as any).state;
    const props = (this as any).props;
    if (state.hasError) {
      let errorMessage = "";
      let firestoreInfo = null;

      try {
        const errorStr = state.error instanceof Error ? state.error.message : String(state.error);
        if (errorStr.startsWith('{') && errorStr.endsWith('}')) {
          firestoreInfo = JSON.parse(errorStr);
          errorMessage = `Firestore Error: ${firestoreInfo.error || 'Unknown error'}`;
        } else {
          errorMessage = errorStr;
        }
      } catch (e) {
        errorMessage = state.error instanceof Error ? state.error.toString() : String(state.error);
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
            <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8 text-center">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <XIcon className="h-6 w-6 text-red-600" />
                </div>
                <h1 className="mt-5 text-2xl font-bold text-slate-800">Oops! Something went wrong.</h1>
                <p className="mt-2 text-slate-600">
                    {firestoreInfo ? "A database permission or connectivity error occurred." : "An unexpected error occurred in the application."}
                </p>

                <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors"
                    >
                        Refresh Page
                    </button>
                    <button
                        onClick={this.handleClearCacheAndReload}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Clear Cache & Reload
                    </button>
                </div>

                <div className="mt-8 text-left">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <h2 className="font-semibold text-slate-700 mb-2">Error Details</h2>
                        <div className="text-xs text-slate-600 font-mono break-all overflow-auto max-h-64">
                            <p className="font-bold text-red-600 mb-2">{errorMessage}</p>
                            {firestoreInfo && (
                              <div className="mt-2 p-2 bg-white rounded border border-slate-100">
                                <p><strong>Operation:</strong> {firestoreInfo.operationType}</p>
                                <p><strong>Path:</strong> {firestoreInfo.path}</p>
                                <p><strong>User ID:</strong> {firestoreInfo.authInfo?.userId || 'Not logged in'}</p>
                              </div>
                            )}
                            <details className="mt-4">
                              <summary className="cursor-pointer text-slate-400 hover:text-slate-600">Component Stack</summary>
                              <pre className="mt-2 whitespace-pre-wrap">
                                {state.errorInfo && state.errorInfo.componentStack}
                              </pre>
                            </details>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      );
    }

    return props.children;
  }
}
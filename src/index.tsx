
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import App from './App';
import '../index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

const BackButtonHandler = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  useEffect(() => {
    let listener: any = null;

    const setupListener = async () => {
      listener = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/dashboard') {
          CapacitorApp.exitApp();
        } else if (canGoBack) {
          window.history.back();
        } else {
          CapacitorApp.exitApp();
        }
      });
    };

    setupListener();

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, [location.pathname]);

  return <>{children}</>;
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <BackButtonHandler>
          <App />
        </BackButtonHandler>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
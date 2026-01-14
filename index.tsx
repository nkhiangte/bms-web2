
import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

// Service worker registration has been removed.
// The sw.js file was not being served correctly (404 error), causing critical
// caching issues for users with an old, "stuck" service worker.
// A robust unregister script in index.html now automatically clears these
// old service workers from users' browsers on page load.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HashRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </HashRouter>
  </React.StrictMode>
);

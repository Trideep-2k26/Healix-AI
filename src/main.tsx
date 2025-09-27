import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AppProvider } from './contexts/AppContext.tsx';
import { Toaster } from 'react-hot-toast';
import smoothscroll from 'smoothscroll-polyfill';

// Kick off smooth scroll polyfill (older Safari/Edge)
smoothscroll.polyfill();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
          },
        }}
      />
    </AppProvider>
  </StrictMode>
);

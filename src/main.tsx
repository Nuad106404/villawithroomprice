import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import axios from 'axios';
import './i18n/config';  // Import i18n configuration first
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/config';

// Configure axios defaults
axios.defaults.baseURL = `${import.meta.env.VITE_API_URL}/api`;
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-lg">Loading...</div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Suspense fallback={<LoadingFallback />}>
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </Suspense>
  </React.StrictMode>
);
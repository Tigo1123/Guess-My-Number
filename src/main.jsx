import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { applyThemePreferences, readAccentPreference, readThemePreference } from './utils/theme';

applyThemePreferences(readThemePreference(), readAccentPreference());
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

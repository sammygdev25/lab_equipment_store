import './lib/deepLink';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './index.css';
import './design-system.css';
import App from './App';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

const root = ReactDOM.createRoot(rootEl);
root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);

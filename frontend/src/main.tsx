import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import ThemeProviderWrapper from './components/providers/ThemeProviderWrapper';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProviderWrapper>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'transparent',
              boxShadow: 'none',
              padding: 0,
            },
          }}
        />
      </ThemeProviderWrapper>
    </BrowserRouter>
  </React.StrictMode>
);



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
          containerStyle={{
            top: 20,
            right: 20,
          }}
          toastOptions={{
            duration: 5000,
            style: {
              background: 'transparent',
              boxShadow: 'none',
              padding: 0,
              margin: 0,
            },
          }}
        />
      </ThemeProviderWrapper>
    </BrowserRouter>
  </React.StrictMode>
);



import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import './index.css';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function MissingKey() {
  return (
    <div className="container narrow" style={{ paddingTop: 80 }}>
      <div className="empty-state">
        <h3>Clerk publishable key is missing</h3>
        <p className="muted">
          Copy <code>frontend/.env.example</code> to <code>frontend/.env</code>, set <code>VITE_CLERK_PUBLISHABLE_KEY</code>, then restart <code>npm run dev</code>.
        </p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {publishableKey ? (
      <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/">
        <BrowserRouter>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </BrowserRouter>
      </ClerkProvider>
    ) : (
      <MissingKey />
    )}
  </React.StrictMode>
);

import React, { useState } from 'react';
import InvoiceGenerator from './InvoiceGenerator';
import LoginPage from './components/LoginPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('invoice_auth') === 'true';
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('invoice_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('invoice_auth');
  };

  return (
    <div>
      {isAuthenticated ? (
        // PASS THE LOGOUT FUNCTION HERE
        <InvoiceGenerator onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
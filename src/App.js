import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Deposits from './pages/Deposits';
import Withdrawals from './pages/Withdrawals';
import Transactions from './pages/Transactions';
import KYC from './pages/KYC';
import Settings from './pages/Settings';
import WalletActions from './pages/WalletActions';
import Trading from './pages/Trading';
import Analytics from './pages/Analytics';
import Sidebar from './components/Sidebar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      <div style={{ display: 'flex', height: '100vh', flexDirection: window.innerWidth <= 768 ? 'column' : 'row' }}>
        <Sidebar />
        <div style={{ flex: 1, overflow: 'auto', padding: window.innerWidth <= 768 ? '10px' : '20px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/deposits" element={<Deposits />} />
            <Route path="/withdrawals" element={<Withdrawals />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/kyc" element={<KYC />} />
            <Route path="/trading" element={<Trading />} />
            <Route path="/wallet-actions" element={<WalletActions />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
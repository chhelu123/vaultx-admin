import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/users', label: 'Users', icon: '👥' },
    { path: '/kyc', label: 'KYC Verification', icon: '🆔' },
    { path: '/trading', label: 'Trading', icon: '🔄' },
    { path: '/wallet-actions', label: 'Wallet Actions', icon: '🔄' },
    { path: '/transactions', label: 'Transactions', icon: '📋' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.reload();
  };

  return (
    <div style={{ 
      width: window.innerWidth <= 768 ? '100%' : '250px', 
      height: window.innerWidth <= 768 ? 'auto' : '100vh',
      backgroundColor: '#2c3e50', 
      color: 'white', 
      padding: window.innerWidth <= 768 ? '10px' : '20px', 
      position: 'relative', 
      display: 'flex', 
      flexDirection: window.innerWidth <= 768 ? 'row' : 'column',
      overflowX: window.innerWidth <= 768 ? 'auto' : 'visible'
    }}>
      <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>Admin Panel</h2>
      
      <nav style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: window.innerWidth <= 768 ? 'row' : 'column',
        gap: window.innerWidth <= 768 ? '10px' : '0',
        overflowX: window.innerWidth <= 768 ? 'auto' : 'visible',
        whiteSpace: window.innerWidth <= 768 ? 'nowrap' : 'normal'
      }}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: window.innerWidth <= 768 ? 'inline-block' : 'block',
              padding: window.innerWidth <= 768 ? '8px 12px' : '12px 16px',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              marginBottom: window.innerWidth <= 768 ? '0' : '8px',
              backgroundColor: location.pathname === item.path ? '#34495e' : 'transparent',
              fontSize: window.innerWidth <= 768 ? '14px' : '16px',
              minWidth: window.innerWidth <= 768 ? 'max-content' : 'auto'
            }}
          >
            <span style={{ marginRight: window.innerWidth <= 768 ? '5px' : '10px' }}>{item.icon}</span>
            {window.innerWidth <= 768 ? '' : item.label}
          </Link>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#e74c3c',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: 'auto'
        }}
      >
        🚪 Logout
      </button>
    </div>
  );
};

export default Sidebar;
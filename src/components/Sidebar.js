import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/users', label: 'Users', icon: '👥' },
    { path: '/kyc', label: 'KYC Verification', icon: '🆔' },
    { path: '/deposits', label: 'Deposits', icon: '💰' },
    { path: '/withdrawals', label: 'Withdrawals', icon: '💸' },
    { path: '/transactions', label: 'Transactions', icon: '📋' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.reload();
  };

  return (
    <div style={{ width: '250px', backgroundColor: '#2c3e50', color: 'white', padding: '20px' }}>
      <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>Admin Panel</h2>
      
      <nav>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'block',
              padding: '12px 16px',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              marginBottom: '8px',
              backgroundColor: location.pathname === item.path ? '#34495e' : 'transparent',
            }}
          >
            <span style={{ marginRight: '10px' }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          padding: '12px',
          backgroundColor: '#e74c3c',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        🚪 Logout
      </button>
    </div>
  );
};

export default Sidebar;
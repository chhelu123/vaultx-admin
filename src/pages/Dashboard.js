import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#3498db' },
    { title: 'Total Transactions', value: stats.totalTransactions, icon: '📋', color: '#2ecc71' },
    { title: 'Pending Deposits', value: stats.pendingDeposits, icon: '💰', color: '#f39c12' },
    { title: 'Pending Withdrawals', value: stats.pendingWithdrawals, icon: '💸', color: '#e74c3c' },
    { title: 'Total Volume', value: `₹${stats.totalVolume?.toLocaleString() || 0}`, icon: '💹', color: '#9b59b6' },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '30px', color: '#2c3e50' }}>Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {statCards.map((card, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '10px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              borderLeft: `4px solid ${card.color}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '10px' }}>{card.title}</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50', margin: 0 }}>{card.value}</p>
              </div>
              <div style={{ fontSize: '30px' }}>{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <button
            onClick={() => window.location.href = '/deposits'}
            style={{
              padding: '15px',
              backgroundColor: '#f39c12',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            📥 Manage Deposits
          </button>
          <button
            onClick={() => window.location.href = '/withdrawals'}
            style={{
              padding: '15px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            📤 Manage Withdrawals
          </button>
          <button
            onClick={() => window.location.href = '/users'}
            style={{
              padding: '15px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            👥 Manage Users
          </button>
          <button
            onClick={() => window.location.href = '/transactions'}
            style={{
              padding: '15px',
              backgroundColor: '#2ecc71',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            📊 View Transactions
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
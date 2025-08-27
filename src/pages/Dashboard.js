import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import DateFilter from '../components/DateFilter';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [filteredStats, setFilteredStats] = useState({});
  const [allData, setAllData] = useState({
    users: [],
    transactions: [],
    deposits: [],
    withdrawals: []
  });
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [statsRes, usersRes, transactionsRes, depositsRes, withdrawalsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getTransactions(),
        adminAPI.getDeposits(),
        adminAPI.getWithdrawals()
      ]);
      
      setStats(statsRes.data);
      setFilteredStats(statsRes.data);
      setAllData({
        users: usersRes.data,
        transactions: transactionsRes.data,
        deposits: depositsRes.data,
        withdrawals: withdrawalsRes.data
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
    setLoading(false);
  };

  const calculateFilteredStats = () => {
    let filteredUsers = allData.users;
    let filteredTransactions = allData.transactions;
    let filteredDeposits = allData.deposits;
    let filteredWithdrawals = allData.withdrawals;

    if (startDate) {
      const start = new Date(startDate);
      filteredUsers = filteredUsers.filter(u => new Date(u.createdAt) >= start);
      filteredTransactions = filteredTransactions.filter(t => new Date(t.createdAt) >= start);
      filteredDeposits = filteredDeposits.filter(d => new Date(d.createdAt) >= start);
      filteredWithdrawals = filteredWithdrawals.filter(w => new Date(w.createdAt) >= start);
    }

    if (endDate) {
      const end = new Date(endDate + 'T23:59:59');
      filteredUsers = filteredUsers.filter(u => new Date(u.createdAt) <= end);
      filteredTransactions = filteredTransactions.filter(t => new Date(t.createdAt) <= end);
      filteredDeposits = filteredDeposits.filter(d => new Date(d.createdAt) <= end);
      filteredWithdrawals = filteredWithdrawals.filter(w => new Date(w.createdAt) <= end);
    }

    const totalVolume = filteredTransactions.reduce((sum, tx) => sum + (tx.total || 0), 0);
    const pendingDeposits = filteredDeposits.filter(d => d.status === 'pending').length;
    const pendingWithdrawals = filteredWithdrawals.filter(w => w.status === 'pending').length;

    setFilteredStats({
      totalUsers: filteredUsers.length,
      totalTransactions: filteredTransactions.length,
      pendingDeposits,
      pendingWithdrawals,
      totalVolume
    });
  };

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
    setFilteredStats(stats);
  };

  useEffect(() => {
    if (allData.users.length > 0) {
      calculateFilteredStats();
    }
  }, [startDate, endDate, allData]);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  const statCards = [
    { title: 'Total Users', value: filteredStats.totalUsers || 0, icon: '👥', color: '#3498db' },
    { title: 'Total Transactions', value: filteredStats.totalTransactions || 0, icon: '📋', color: '#2ecc71' },
    { title: 'Pending Deposits', value: filteredStats.pendingDeposits || 0, icon: '💰', color: '#f39c12' },
    { title: 'Pending Withdrawals', value: filteredStats.pendingWithdrawals || 0, icon: '💸', color: '#e74c3c' },
    { title: 'Total Volume', value: `₹${filteredStats.totalVolume?.toLocaleString() || 0}`, icon: '💹', color: '#9b59b6' },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '30px', color: '#2c3e50' }}>Dashboard</h1>
      
      <DateFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onClear={clearFilter}
      />
      
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
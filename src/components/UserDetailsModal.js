import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const UserDetailsModal = ({ user, onClose, onImpersonate }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      fetchUserDetails();
    }
  }, [user]);

  const fetchUserDetails = async () => {
    try {
      const [transRes, depRes, withRes] = await Promise.all([
        adminAPI.getTransactions(),
        adminAPI.getDeposits(),
        adminAPI.getWithdrawals()
      ]);
      
      setTransactions(transRes.data.filter(t => t.userId._id === user._id));
      setDeposits(depRes.data.filter(d => d.userId._id === user._id));
      setWithdrawals(withRes.data.filter(w => w.userId._id === user._id));
      setUserDetails(user);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleImpersonate = () => {
    const userToken = btoa(JSON.stringify({ 
      id: user._id, 
      name: user.name, 
      email: user.email,
      wallets: user.wallets,
      kycStatus: user.kycStatus,
      canTrade: user.canTrade
    }));
    window.open(`https://vaultx-frontend.vercel.app?impersonate=${userToken}`, '_blank');
  };

  if (!user) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#1e2329',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90%',
        overflow: 'auto',
        border: '1px solid #2b3139'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #2b3139',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ color: '#eaecef', margin: 0 }}>User Details: {user.name}</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleImpersonate}
              style={{
                padding: '8px 16px',
                backgroundColor: '#fcd535',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🔐 Login as User
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f84960',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #2b3139' }}>
          {['overview', 'transactions', 'deposits', 'withdrawals'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 20px',
                backgroundColor: activeTab === tab ? '#2b3139' : 'transparent',
                color: activeTab === tab ? '#fcd535' : '#848e9c',
                border: 'none',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h3 style={{ color: '#eaecef', marginBottom: '15px' }}>Basic Info</h3>
                <div style={{ color: '#848e9c', lineHeight: '1.6' }}>
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                  <p><strong>KYC Status:</strong> 
                    <span style={{ 
                      color: user.kycStatus === 'approved' ? '#02c076' : 
                            user.kycStatus === 'pending' ? '#fcd535' : '#f84960',
                      marginLeft: '8px'
                    }}>
                      {user.kycStatus || 'Not Submitted'}
                    </span>
                  </p>
                  <p><strong>Can Trade:</strong> 
                    <span style={{ color: user.canTrade ? '#02c076' : '#f84960', marginLeft: '8px' }}>
                      {user.canTrade ? 'Yes' : 'No'}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <h3 style={{ color: '#eaecef', marginBottom: '15px' }}>Wallet Balance</h3>
                <div style={{ color: '#848e9c', lineHeight: '1.6' }}>
                  <p><strong>INR:</strong> ₹{user.wallets?.inr || 0}</p>
                  <p><strong>USDT:</strong> {user.wallets?.usdt || 0}</p>
                </div>
                <h3 style={{ color: '#eaecef', marginTop: '20px', marginBottom: '15px' }}>Activity Summary</h3>
                <div style={{ color: '#848e9c', lineHeight: '1.6' }}>
                  <p><strong>Total Transactions:</strong> {transactions.length}</p>
                  <p><strong>Total Deposits:</strong> {deposits.length}</p>
                  <p><strong>Total Withdrawals:</strong> {withdrawals.length}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div>
              <h3 style={{ color: '#eaecef', marginBottom: '15px' }}>Transaction History</h3>
              {transactions.length === 0 ? (
                <p style={{ color: '#848e9c' }}>No transactions found</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #2b3139' }}>
                        <th style={{ color: '#848e9c', padding: '8px', textAlign: 'left' }}>Date</th>
                        <th style={{ color: '#848e9c', padding: '8px', textAlign: 'left' }}>Type</th>
                        <th style={{ color: '#848e9c', padding: '8px', textAlign: 'left' }}>Amount</th>
                        <th style={{ color: '#848e9c', padding: '8px', textAlign: 'left' }}>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(tx => (
                        <tr key={tx._id} style={{ borderBottom: '1px solid #1a1d23' }}>
                          <td style={{ color: '#eaecef', padding: '8px' }}>
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ color: '#eaecef', padding: '8px' }}>{tx.type}</td>
                          <td style={{ color: '#eaecef', padding: '8px' }}>{tx.amount}</td>
                          <td style={{ color: '#eaecef', padding: '8px' }}>₹{tx.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'deposits' && (
            <div>
              <h3 style={{ color: '#eaecef', marginBottom: '15px' }}>Deposit History</h3>
              {deposits.length === 0 ? (
                <p style={{ color: '#848e9c' }}>No deposits found</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #2b3139' }}>
                        <th style={{ color: '#848e9c', padding: '8px', textAlign: 'left' }}>Date</th>
                        <th style={{ color: '#848e9c', padding: '8px', textAlign: 'left' }}>Type</th>
                        <th style={{ color: '#848e9c', padding: '8px', textAlign: 'left' }}>Amount</th>
                        <th style={{ color: '#848e9c', padding: '8px', textAlign: 'left' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deposits.map(dep => (
                        <tr key={dep._id} style={{ borderBottom: '1px solid #1a1d23' }}>
                          <td style={{ color: '#eaecef', padding: '8px' }}>
                            {new Date(dep.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ color: '#eaecef', padding: '8px' }}>{dep.type.toUpperCase()}</td>
                          <td style={{ color: '#eaecef', padding: '8px' }}>
                            {dep.type === 'inr' ? '₹' : ''}{dep.amount}
                          </td>
                          <td style={{ 
                            color: dep.status === 'completed' ? '#02c076' : 
                                  dep.status === 'pending' ? '#fcd535' : '#f84960',
                            padding: '8px'
                          }}>
                            {dep.status.toUpperCase()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'withdrawals' && (
            <div>
              <h3 style={{ color: '#eaecef', marginBottom: '15px' }}>Withdrawal History</h3>
              {withdrawals.length === 0 ? (
                <p style={{ color: '#848e9c' }}>No withdrawals found</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #2b3139' }}>
                        <th style={{ color: '#848e9c', padding: '8px', textAlign: 'left' }}>Date</th>
                        <th style={{ color: '#848e9c', padding: '8px', textAlign: 'left' }}>Type</th>
                        <th style={{ color: '#848e9c', padding: '8px', textAlign: 'left' }}>Amount</th>
                        <th style={{ color: '#848e9c', padding: '8px', textAlign: 'left' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.map(withdrawal => (
                        <tr key={withdrawal._id} style={{ borderBottom: '1px solid #1a1d23' }}>
                          <td style={{ color: '#eaecef', padding: '8px' }}>
                            {new Date(withdrawal.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ color: '#eaecef', padding: '8px' }}>{withdrawal.type.toUpperCase()}</td>
                          <td style={{ color: '#eaecef', padding: '8px' }}>
                            {withdrawal.type === 'inr' ? '₹' : ''}{withdrawal.amount}
                          </td>
                          <td style={{ 
                            color: withdrawal.status === 'completed' ? '#02c076' : 
                                  withdrawal.status === 'pending' ? '#fcd535' : '#f84960',
                            padding: '8px'
                          }}>
                            {withdrawal.status.toUpperCase()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const WalletActions = () => {
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('deposits');
  const [processingItem, setProcessingItem] = useState(null);
  const [actionForm, setActionForm] = useState({ status: 'completed', adminNotes: '' });

  useEffect(() => {
    fetchWalletActions();
  }, []);

  const fetchWalletActions = async () => {
    try {
      const [depositsRes, withdrawalsRes] = await Promise.all([
        adminAPI.getDeposits(),
        adminAPI.getWithdrawals()
      ]);
      
      // Filter only actual USDT deposits/withdrawals (not trading)
      const usdtDeposits = (depositsRes.data.deposits || depositsRes.data || [])
        .filter(d => d.type === 'usdt' && !d.buyDetails);
      const usdtWithdrawals = (withdrawalsRes.data.withdrawals || withdrawalsRes.data || [])
        .filter(w => w.type === 'usdt' && !w.sellDetails);
      
      setDeposits(usdtDeposits);
      setWithdrawals(usdtWithdrawals);
    } catch (error) {
      console.error('Error fetching wallet actions:', error);
    }
    setLoading(false);
  };

  const handleProcess = (item, type) => {
    setProcessingItem({ ...item, actionType: type });
    setActionForm({ status: 'completed', adminNotes: '' });
  };

  const handleSubmitAction = async () => {
    try {
      if (processingItem.actionType === 'deposit') {
        await adminAPI.approveDeposit(processingItem._id, actionForm);
      } else {
        await adminAPI.processWithdrawal(processingItem._id, actionForm);
      }
      // Only process if no error occurred
      alert('Wallet action processed successfully!');
      setProcessingItem(null);
      fetchWalletActions();
    } catch (error) {
      console.error('Wallet action error:', error);
      // Show actual error and don't process
      alert(`Error processing action: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f39c12';
      case 'completed': return '#2ecc71';
      case 'rejected': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return <div>Loading wallet actions...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '30px', color: '#2c3e50' }}>Wallet Actions</h1>
      
      {/* Tabs */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('deposits')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'deposits' ? '#3498db' : '#ecf0f1',
            color: activeTab === 'deposits' ? 'white' : '#2c3e50',
            border: 'none',
            borderRadius: '4px 0 0 4px',
            cursor: 'pointer'
          }}
        >
          USDT Deposits ({deposits.length})
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'withdrawals' ? '#3498db' : '#ecf0f1',
            color: activeTab === 'withdrawals' ? 'white' : '#2c3e50',
            border: 'none',
            borderRadius: '0 4px 4px 0',
            cursor: 'pointer'
          }}
        >
          USDT Withdrawals ({withdrawals.length})
        </button>
      </div>

      {/* Deposits Tab */}
      {activeTab === 'deposits' && (
        <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>User</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Amount</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Transaction Hash</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Status</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Date</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((deposit) => (
                <tr key={deposit._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '15px' }}>{deposit.userId?.name || 'Unknown'}</td>
                  <td style={{ padding: '15px' }}>{deposit.amount} USDT</td>
                  <td style={{ padding: '15px', fontSize: '12px', fontFamily: 'monospace' }}>{deposit.transactionId}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      color: 'white',
                      fontSize: '12px',
                      backgroundColor: getStatusColor(deposit.status)
                    }}>
                      {deposit.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>{new Date(deposit.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '15px' }}>
                    {deposit.status === 'pending' && (
                      <button
                        onClick={() => handleProcess(deposit, 'deposit')}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#2ecc71',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Process
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {deposits.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>
              No USDT deposits found
            </div>
          )}
        </div>
      )}

      {/* Withdrawals Tab */}
      {activeTab === 'withdrawals' && (
        <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>User</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Amount</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Chain</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Address</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Status</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Date</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((withdrawal) => (
                <tr key={withdrawal._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '15px' }}>{withdrawal.userId?.name || 'Unknown'}</td>
                  <td style={{ padding: '15px' }}>{withdrawal.amount} USDT</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: '#e3f2fd',
                      color: '#1976d2',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {(withdrawal.chain || 'trc20').toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '15px', fontSize: '12px', fontFamily: 'monospace', maxWidth: '200px', wordBreak: 'break-all' }}>
                    {withdrawal.withdrawalDetails}
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      color: 'white',
                      fontSize: '12px',
                      backgroundColor: getStatusColor(withdrawal.status)
                    }}>
                      {withdrawal.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>{new Date(withdrawal.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '15px' }}>
                    {withdrawal.status === 'pending' && (
                      <button
                        onClick={() => handleProcess(withdrawal, 'withdrawal')}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Process
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {withdrawals.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>
              No USDT withdrawals found
            </div>
          )}
        </div>
      )}

      {/* Processing Modal */}
      {processingItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', width: '500px' }}>
            <h3>Process {processingItem.actionType === 'deposit' ? 'USDT Deposit' : 'USDT Withdrawal'}</h3>
            <p><strong>User:</strong> {processingItem.userId?.name}</p>
            <p><strong>Amount:</strong> {processingItem.amount} USDT</p>
            
            {processingItem.actionType === 'deposit' ? (
              <p><strong>Transaction Hash:</strong> {processingItem.transactionId}</p>
            ) : (
              <>
                <p><strong>Chain:</strong> {(processingItem.chain || 'trc20').toUpperCase()}</p>
                <p><strong>Address:</strong> {processingItem.withdrawalDetails}</p>
              </>
            )}
            
            <div style={{ marginBottom: '20px', marginTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Action</label>
              <select
                value={actionForm.status}
                onChange={(e) => setActionForm({ ...actionForm, status: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="completed">{processingItem.actionType === 'deposit' ? 'Credit USDT' : 'Send USDT'}</option>
                <option value="rejected">Reject</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Admin Notes</label>
              <textarea
                value={actionForm.adminNotes}
                onChange={(e) => setActionForm({ ...actionForm, adminNotes: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', height: '80px' }}
                placeholder={processingItem.actionType === 'deposit' ? 'Verification notes...' : 'Transaction hash or notes...'}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSubmitAction}
                style={{ flex: 1, padding: '10px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Submit
              </button>
              <button
                onClick={() => setProcessingItem(null)}
                style={{ flex: 1, padding: '10px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletActions;
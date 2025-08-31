import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const Trading = () => {
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('buy');
  const [processingItem, setProcessingItem] = useState(null);
  const [actionForm, setActionForm] = useState({ status: 'completed', adminNotes: '' });

  useEffect(() => {
    fetchTradingData();
  }, []);

  const fetchTradingData = async () => {
    try {
      const [depositsRes, withdrawalsRes] = await Promise.all([
        adminAPI.getDeposits(),
        adminAPI.getWithdrawals()
      ]);
      
      // Filter only trading requests
      const buyRequests = (depositsRes.data.deposits || depositsRes.data || [])
        .filter(d => d.buyDetails || d.type === 'inr');
      const sellRequests = (withdrawalsRes.data.withdrawals || withdrawalsRes.data || [])
        .filter(w => w.sellDetails || w.type === 'inr');
      
      setDeposits(buyRequests);
      setWithdrawals(sellRequests);
    } catch (error) {
      console.error('Error fetching trading data:', error);
    }
    setLoading(false);
  };

  const handleProcess = (item, type) => {
    setProcessingItem({ ...item, actionType: type });
    setActionForm({ status: 'completed', adminNotes: '' });
  };

  const handleSubmitAction = async () => {
    try {
      if (processingItem.actionType === 'buy') {
        await adminAPI.approveDeposit(processingItem._id, actionForm);
      } else {
        await adminAPI.processWithdrawal(processingItem._id, actionForm);
      }
      alert('Trading request processed successfully!');
      setProcessingItem(null);
      fetchTradingData();
    } catch (error) {
      console.error('Trading processing error:', error);
      alert(`Error processing request: ${error.response?.data?.message || error.message || 'Unknown error'}`);
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
    return <div>Loading trading requests...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '30px', color: '#2c3e50' }}>Trading Management</h1>
      
      {/* Toggle Tabs */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('buy')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeTab === 'buy' ? '#2ecc71' : '#ecf0f1',
            color: activeTab === 'buy' ? 'white' : '#2c3e50',
            border: 'none',
            borderRadius: '8px 0 0 8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          Buy USDT ({deposits.length})
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeTab === 'sell' ? '#e74c3c' : '#ecf0f1',
            color: activeTab === 'sell' ? 'white' : '#2c3e50',
            border: 'none',
            borderRadius: '0 8px 8px 0',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          Sell USDT ({withdrawals.length})
        </button>
      </div>

      {/* Buy USDT Tab */}
      {activeTab === 'buy' && (
        <div className="admin-table-container">
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>User</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>USDT Amount</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>INR Amount</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Rate</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Status</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Date</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((deposit) => (
                <tr key={deposit._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '15px' }}>{deposit.userId?.name || 'Unknown'}</td>
                  <td style={{ padding: '15px', fontWeight: '600', color: '#2ecc71' }}>
                    {deposit.buyDetails ? `${deposit.buyDetails.usdtAmount?.toFixed(6)} USDT` : `${deposit.amount} USDT`}
                  </td>
                  <td style={{ padding: '15px', fontWeight: '600' }}>
                    ₹{deposit.buyDetails ? deposit.buyDetails.inrAmount?.toFixed(2) : deposit.amount}
                  </td>
                  <td style={{ padding: '15px' }}>
                    ₹{deposit.buyDetails ? deposit.buyDetails.rate : 'N/A'}
                  </td>
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
                        onClick={() => handleProcess(deposit, 'buy')}
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
              No buy requests found
            </div>
          )}
        </div>
      )}

      {/* Sell USDT Tab */}
      {activeTab === 'sell' && (
        <div className="admin-table-container">
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>User</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>USDT Amount</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>INR Amount</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Rate</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Status</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Date</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((withdrawal) => (
                <tr key={withdrawal._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '15px' }}>{withdrawal.userId?.name || 'Unknown'}</td>
                  <td style={{ padding: '15px', fontWeight: '600', color: '#e74c3c' }}>
                    {withdrawal.sellDetails ? `${withdrawal.sellDetails.usdtAmount?.toFixed(6)} USDT` : `${withdrawal.amount} USDT`}
                  </td>
                  <td style={{ padding: '15px', fontWeight: '600' }}>
                    ₹{withdrawal.sellDetails ? withdrawal.sellDetails.inrAmount?.toFixed(2) : withdrawal.amount}
                  </td>
                  <td style={{ padding: '15px' }}>
                    ₹{withdrawal.sellDetails ? withdrawal.sellDetails.rate : 'N/A'}
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
                        onClick={() => handleProcess(withdrawal, 'sell')}
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
              No sell requests found
            </div>
          )}
        </div>
      )}

      {/* Processing Modal */}
      {processingItem && (
        <div className="admin-modal">
          <div className="admin-modal-content" style={{ width: window.innerWidth <= 768 ? '95%' : '600px' }}>
            <h3>Process {processingItem.actionType === 'buy' ? 'Buy USDT' : 'Sell USDT'} Request</h3>
            
            {/* User Info */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '10px', color: '#2c3e50' }}>User Information</h4>
              <p><strong>Name:</strong> {processingItem.userId?.name}</p>
              <p><strong>Email:</strong> {processingItem.userId?.email}</p>
            </div>

            {/* Buy USDT Details */}
            {processingItem.actionType === 'buy' && processingItem.buyDetails && (
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '10px', color: '#2c3e50' }}>Buy USDT Details</h4>
                <p><strong>USDT Amount:</strong> {processingItem.buyDetails.usdtAmount?.toFixed(6)} USDT</p>
                <p><strong>INR Amount Paid:</strong> ₹{processingItem.buyDetails.inrAmount?.toFixed(2)}</p>
                <p><strong>Exchange Rate:</strong> ₹{processingItem.buyDetails.rate} per USDT</p>
                <p><strong>Payment Method:</strong> {processingItem.paymentMethod}</p>
                <p><strong>Transaction ID:</strong> {processingItem.transactionId}</p>
              </div>
            )}

            {/* Sell USDT Details */}
            {processingItem.actionType === 'sell' && processingItem.sellDetails && (
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#ffeaea', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '10px', color: '#2c3e50' }}>Sell USDT Details</h4>
                <p><strong>USDT Amount:</strong> {processingItem.sellDetails.usdtAmount?.toFixed(6)} USDT</p>
                <p><strong>INR Amount to Pay:</strong> ₹{processingItem.sellDetails.inrAmount?.toFixed(2)}</p>
                <p><strong>Exchange Rate:</strong> ₹{processingItem.sellDetails.rate} per USDT</p>
                <p><strong>Payment Method:</strong> {processingItem.paymentMethod}</p>
                <p><strong>Payment Details:</strong> {processingItem.withdrawalDetails}</p>
              </div>
            )}
            
            <div style={{ marginBottom: '20px', marginTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Action</label>
              <select
                value={actionForm.status}
                onChange={(e) => setActionForm({ ...actionForm, status: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="completed">
                  {processingItem.actionType === 'buy' ? 'Approve & Credit USDT' : 'Approve & Process Payment'}
                </option>
                <option value="rejected">Reject Request</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Admin Notes</label>
              <textarea
                value={actionForm.adminNotes}
                onChange={(e) => setActionForm({ ...actionForm, adminNotes: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', height: '80px' }}
                placeholder={processingItem.actionType === 'buy' ? 'Payment verification notes...' : 'Payment processing notes...'}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSubmitAction}
                style={{ flex: 1, padding: '12px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
              >
                Submit
              </button>
              <button
                onClick={() => setProcessingItem(null)}
                style={{ flex: 1, padding: '12px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
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

export default Trading;
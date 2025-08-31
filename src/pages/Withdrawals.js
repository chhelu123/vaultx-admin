import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import DateFilter from '../components/DateFilter';

const Withdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [processingWithdrawal, setProcessingWithdrawal] = useState(null);
  const [actionForm, setActionForm] = useState({ status: 'completed', adminNotes: '' });

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async (page = 1, append = false) => {
    try {
      const response = await adminAPI.getWithdrawals(page, 50);
      const withdrawalsData = response.data.withdrawals || response.data;
      const pagination = response.data.pagination;
      
      // Filter to only show trading requests (sell USDT) - exclude regular USDT withdrawals
      const tradingWithdrawals = withdrawalsData.filter(w => w.sellDetails || w.type === 'inr');
      
      if (append) {
        setWithdrawals(prev => [...prev, ...tradingWithdrawals]);
      } else {
        setWithdrawals(tradingWithdrawals);
        setFilteredWithdrawals(tradingWithdrawals);
      }
      
      setHasMore(pagination?.hasNext || false);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
    setLoading(false);
    setLoadingMore(false);
  };

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    await fetchWithdrawals(nextPage, true);
  };

  const filterByDate = () => {
    let filtered = withdrawals;
    
    if (startDate) {
      filtered = filtered.filter(w => new Date(w.createdAt) >= new Date(startDate));
    }
    
    if (endDate) {
      filtered = filtered.filter(w => new Date(w.createdAt) <= new Date(endDate + 'T23:59:59'));
    }
    
    setFilteredWithdrawals(filtered);
  };

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
    setFilteredWithdrawals(withdrawals);
  };

  useEffect(() => {
    filterByDate();
  }, [startDate, endDate, withdrawals]);

  const handleProcessWithdrawal = (withdrawal) => {
    setProcessingWithdrawal(withdrawal);
    setActionForm({ status: 'completed', adminNotes: '' });
  };

  const handleSubmitAction = async () => {
    try {
      await adminAPI.processWithdrawal(processingWithdrawal._id, actionForm);
      alert('Withdrawal processed successfully!');
      setProcessingWithdrawal(null);
      fetchWithdrawals();
    } catch (error) {
      alert('Error processing withdrawal');
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
    return <div>Loading withdrawals...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '30px', color: '#2c3e50' }}>Trade - Sell USDT</h1>
      
      <DateFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onClear={clearFilter}
      />
      
      <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>User</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Type</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Amount</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Chain</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Withdrawal Details</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Status</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Date</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredWithdrawals.map((withdrawal) => (
              <tr key={withdrawal._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '15px' }}>{withdrawal.userId?.name || 'Unknown'}</td>
                <td style={{ padding: '15px' }}>{withdrawal.type.toUpperCase()}</td>
                <td style={{ padding: '15px' }}>
                  {withdrawal.type === 'inr' ? `₹${withdrawal.amount}` : `${withdrawal.amount} USDT`}
                </td>
                <td style={{ padding: '15px' }}>
                  {withdrawal.type === 'usdt' ? (
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
                  ) : 'N/A'}
                </td>
                <td style={{ padding: '15px', fontSize: '12px', maxWidth: '200px', wordBreak: 'break-all' }}>
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
                      onClick={() => handleProcessWithdrawal(withdrawal)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
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
      </div>

      {hasMore && !startDate && !endDate && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={loadMore}
            disabled={loadingMore}
            style={{
              padding: '12px 24px',
              backgroundColor: loadingMore ? '#95a5a6' : '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loadingMore ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {processingWithdrawal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', width: '500px' }}>
            <h3>Process Withdrawal</h3>
            <p><strong>User:</strong> {processingWithdrawal.userId?.name}</p>
            <p><strong>Amount:</strong> {processingWithdrawal.type === 'inr' ? `₹${processingWithdrawal.amount}` : `${processingWithdrawal.amount} USDT`}</p>
            {processingWithdrawal.type === 'usdt' && (
              <p><strong>Chain:</strong> {(processingWithdrawal.chain || 'trc20').toUpperCase()}</p>
            )}
            <p><strong>Details:</strong> {processingWithdrawal.withdrawalDetails}</p>
            
            {processingWithdrawal.sellDetails && (
              <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '10px', color: '#2c3e50' }}>Sell USDT Details</h4>
                <p><strong>USDT Amount:</strong> {processingWithdrawal.sellDetails.usdtAmount?.toFixed(6)} USDT</p>
                <p><strong>INR Amount to Pay:</strong> ₹{processingWithdrawal.sellDetails.inrAmount?.toFixed(2)}</p>
                <p><strong>Rate:</strong> ₹{processingWithdrawal.sellDetails.rate} per USDT</p>
              </div>
            )}
            
            <div style={{ marginBottom: '20px', marginTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Action</label>
              <select
                value={actionForm.status}
                onChange={(e) => setActionForm({ ...actionForm, status: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="completed">Approve & Send</option>
                <option value="rejected">Reject</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Admin Notes</label>
              <textarea
                value={actionForm.adminNotes}
                onChange={(e) => setActionForm({ ...actionForm, adminNotes: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', height: '80px' }}
                placeholder="Transaction hash or rejection reason..."
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
                onClick={() => setProcessingWithdrawal(null)}
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

export default Withdrawals;
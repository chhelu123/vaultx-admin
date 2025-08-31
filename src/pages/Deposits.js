import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import DateFilter from '../components/DateFilter';

const Deposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [filteredDeposits, setFilteredDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [processingDeposit, setProcessingDeposit] = useState(null);
  const [actionForm, setActionForm] = useState({ status: 'completed', adminNotes: '' });

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async (page = 1, append = false) => {
    try {
      const response = await adminAPI.getDeposits(page, 50);
      const depositsData = response.data.deposits || response.data;
      const pagination = response.data.pagination;
      
      // Filter to only show trading requests (buy USDT) - exclude regular USDT deposits
      const tradingDeposits = depositsData.filter(d => d.buyDetails || d.type === 'inr');
      
      if (append) {
        setDeposits(prev => [...prev, ...tradingDeposits]);
      } else {
        setDeposits(tradingDeposits);
        setFilteredDeposits(tradingDeposits);
      }
      
      setHasMore(pagination?.hasNext || false);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching deposits:', error);
    }
    setLoading(false);
    setLoadingMore(false);
  };

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    await fetchDeposits(nextPage, true);
  };

  const filterByDate = () => {
    let filtered = deposits;
    
    if (startDate) {
      filtered = filtered.filter(dep => new Date(dep.createdAt) >= new Date(startDate));
    }
    
    if (endDate) {
      filtered = filtered.filter(dep => new Date(dep.createdAt) <= new Date(endDate + 'T23:59:59'));
    }
    
    setFilteredDeposits(filtered);
  };

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
    setFilteredDeposits(deposits);
  };

  useEffect(() => {
    filterByDate();
  }, [startDate, endDate, deposits]);

  const handleProcessDeposit = (deposit) => {
    setProcessingDeposit(deposit);
    setActionForm({ status: 'completed', adminNotes: '' });
  };

  const handleSubmitAction = async () => {
    try {
      await adminAPI.approveDeposit(processingDeposit._id, actionForm);
      alert('Deposit processed successfully!');
      setProcessingDeposit(null);
      fetchDeposits();
    } catch (error) {
      alert('Error processing deposit');
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
    return <div>Loading deposits...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '30px', color: '#2c3e50' }}>Trade - Buy USDT</h1>
      
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
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Payment Method</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Transaction ID</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Status</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Date</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeposits.map((deposit) => (
              <tr key={deposit._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '15px' }}>{deposit.userId?.name || 'Unknown'}</td>
                <td style={{ padding: '15px' }}>{deposit.type.toUpperCase()}</td>
                <td style={{ padding: '15px' }}>
                  {deposit.type === 'inr' ? `₹${deposit.amount}` : `${deposit.amount} USDT`}
                </td>
                <td style={{ padding: '15px' }}>{deposit.paymentMethod}</td>
                <td style={{ padding: '15px', fontSize: '12px' }}>{deposit.transactionId}</td>
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
                      onClick={() => handleProcessDeposit(deposit)}
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
            {loadingMore ? 'Loading...' : 'Load More Deposits'}
          </button>
        </div>
      )}

      {processingDeposit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', width: '500px' }}>
            <h3>Process Deposit</h3>
            <p><strong>User:</strong> {processingDeposit.userId?.name}</p>
            <p><strong>Amount:</strong> {processingDeposit.type === 'inr' ? `₹${processingDeposit.amount}` : `${processingDeposit.amount} USDT`}</p>
            <p><strong>Transaction ID:</strong> {processingDeposit.transactionId}</p>
            
            {processingDeposit.buyDetails && (
              <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '10px', color: '#2c3e50' }}>Buy USDT Details</h4>
                <p><strong>USDT Amount:</strong> {processingDeposit.buyDetails.usdtAmount?.toFixed(6)} USDT</p>
                <p><strong>INR Amount Paid:</strong> ₹{processingDeposit.buyDetails.inrAmount?.toFixed(2)}</p>
                <p><strong>Rate:</strong> ₹{processingDeposit.buyDetails.rate} per USDT</p>
              </div>
            )}
            
            <div style={{ marginBottom: '20px', marginTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Action</label>
              <select
                value={actionForm.status}
                onChange={(e) => setActionForm({ ...actionForm, status: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="completed">Approve</option>
                <option value="rejected">Reject</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Admin Notes</label>
              <textarea
                value={actionForm.adminNotes}
                onChange={(e) => setActionForm({ ...actionForm, adminNotes: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', height: '80px' }}
                placeholder="Optional notes..."
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
                onClick={() => setProcessingDeposit(null)}
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

export default Deposits;
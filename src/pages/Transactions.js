import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import DateFilter from '../components/DateFilter';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await adminAPI.getTransactions();
      setTransactions(response.data);
      setFilteredTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
    setLoading(false);
  };

  const filterByDate = () => {
    let filtered = transactions;
    
    if (startDate) {
      filtered = filtered.filter(tx => new Date(tx.createdAt) >= new Date(startDate));
    }
    
    if (endDate) {
      filtered = filtered.filter(tx => new Date(tx.createdAt) <= new Date(endDate + 'T23:59:59'));
    }
    
    setFilteredTransactions(filtered);
  };

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
    setFilteredTransactions(transactions);
  };

  useEffect(() => {
    filterByDate();
  }, [startDate, endDate, transactions]);

  const getTypeColor = (type) => {
    return type === 'buy' ? '#2ecc71' : '#e74c3c';
  };

  if (loading) {
    return <div>Loading transactions...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '30px', color: '#2c3e50' }}>Transaction History</h1>
      
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
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>USDT Amount</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Price</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Total INR</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Status</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '15px' }}>{transaction.userId?.name || 'Unknown'}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '12px',
                    backgroundColor: getTypeColor(transaction.type)
                  }}>
                    {transaction.type.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '15px' }}>{transaction.amount.toFixed(6)} USDT</td>
                <td style={{ padding: '15px' }}>₹{transaction.price}</td>
                <td style={{ padding: '15px' }}>₹{transaction.total.toFixed(2)}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '12px',
                    backgroundColor: transaction.status === 'completed' ? '#2ecc71' : '#f39c12'
                  }}>
                    {transaction.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '15px' }}>{new Date(transaction.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {transactions.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>
            No transactions found
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>Transaction Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <p style={{ color: '#7f8c8d', margin: 0 }}>Total Transactions</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50', margin: '5px 0' }}>
              {transactions.length}
            </p>
          </div>
          <div>
            <p style={{ color: '#7f8c8d', margin: 0 }}>Total Volume</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50', margin: '5px 0' }}>
              ₹{transactions.reduce((sum, t) => sum + t.total, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p style={{ color: '#7f8c8d', margin: 0 }}>Buy Orders</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2ecc71', margin: '5px 0' }}>
              {transactions.filter(t => t.type === 'buy').length}
            </p>
          </div>
          <div>
            <p style={{ color: '#7f8c8d', margin: 0 }}>Sell Orders</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c', margin: '5px 0' }}>
              {transactions.filter(t => t.type === 'sell').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
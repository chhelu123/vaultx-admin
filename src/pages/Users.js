import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import UserDetailsModal from '../components/UserDetailsModal';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [walletForm, setWalletForm] = useState({ inr: 0, usdt: 0 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (page = 1, append = false) => {
    try {
      const response = await adminAPI.getUsers(page, 50);
      const userData = response.data.users || response.data;
      const pagination = response.data.pagination;
      
      if (append) {
        setUsers(prev => [...prev, ...userData]);
        if (!searchTerm) setFilteredUsers(prev => [...prev, ...userData]);
      } else {
        setUsers(userData);
        setFilteredUsers(userData);
      }
      
      setHasMore(pagination?.hasNext || false);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    setLoading(false);
    setLoadingMore(false);
  };

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    await fetchUsers(nextPage, true);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term) {
      setFilteredUsers(users);
      return;
    }
    
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(term.toLowerCase()) ||
      user.email.toLowerCase().includes(term.toLowerCase()) ||
      user._id.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleEditWallet = (user) => {
    setEditingUser(user);
    setWalletForm({ inr: user.wallets?.inr || 0, usdt: user.wallets?.usdt || 0 });
  };

  const handleUpdateWallet = async () => {
    try {
      await adminAPI.updateUserWallet(editingUser._id, walletForm);
      alert('Wallet updated successfully!');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      alert('Error updating wallet');
    }
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '30px', color: '#2c3e50' }}>User Management</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search users by name, email, or User ID..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '12px 16px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
      </div>
      
      <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>User ID</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Name</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Email</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>INR Balance</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>USDT Balance</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Joined</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '15px', fontFamily: 'monospace', fontSize: '12px', color: '#007bff' }} title={user._id}>
                  {user._id.slice(0, 8)}...{user._id.slice(-4)}
                </td>
                <td style={{ padding: '15px' }}>{user.name}</td>
                <td style={{ padding: '15px' }}>{user.email}</td>
                <td style={{ padding: '15px' }}>₹{user.wallets?.inr?.toFixed(2) || '0.00'}</td>
                <td style={{ padding: '15px' }}>{user.wallets?.usdt?.toFixed(6) || '0.000000'}</td>
                <td style={{ padding: '15px' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '15px' }}>
                  <button
                    onClick={() => setSelectedUser(user)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#fcd535',
                      color: '#000',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '8px'
                    }}
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleEditWallet(user)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#3498db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Edit Wallet
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && !searchTerm && (
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
            {loadingMore ? 'Loading...' : 'Load More Users'}
          </button>
        </div>
      )}

      {editingUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', width: '400px' }}>
            <h3>Edit Wallet - {editingUser.name}</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>INR Balance</label>
              <input
                type="number"
                value={walletForm.inr}
                onChange={(e) => setWalletForm({ ...walletForm, inr: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>USDT Balance</label>
              <input
                type="number"
                step="0.000001"
                value={walletForm.usdt}
                onChange={(e) => setWalletForm({ ...walletForm, usdt: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleUpdateWallet}
                style={{ flex: 1, padding: '10px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Update
              </button>
              <button
                onClick={() => setEditingUser(null)}
                style={{ flex: 1, padding: '10px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default Users;
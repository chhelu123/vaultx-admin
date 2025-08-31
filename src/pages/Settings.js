import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const Settings = () => {
  const [settings, setSettings] = useState({
    upiId: '',
    bankAccount: '',
    bankIFSC: '',
    bankName: '',
    trc20Address: '',
    bep20Address: '',
    aptosAddress: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await adminAPI.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminAPI.updateSettings(settings);
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating settings');
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#ffffff', marginBottom: '30px' }}>Platform Settings</h1>
      
      {message && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          backgroundColor: message.includes('Error') ? '#f84960' : '#02c076',
          color: '#ffffff',
          borderRadius: '8px'
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* INR Payment Settings */}
        <div style={{ 
          backgroundColor: '#2b3139', 
          padding: '24px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          border: '1px solid #474d57'
        }}>
          <h3 style={{ color: '#ffffff', marginBottom: '20px' }}>INR Payment Settings</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#eaecef', marginBottom: '8px', fontWeight: '600' }}>
              UPI ID
            </label>
            <input
              type="text"
              name="upiId"
              value={settings.upiId}
              onChange={handleChange}
              placeholder="Enter UPI ID"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1e2329',
                border: '1px solid #474d57',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', color: '#eaecef', marginBottom: '8px', fontWeight: '600' }}>
                Bank Account Number
              </label>
              <input
                type="text"
                name="bankAccount"
                value={settings.bankAccount}
                onChange={handleChange}
                placeholder="Enter bank account number"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#1e2329',
                  border: '1px solid #474d57',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '16px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#eaecef', marginBottom: '8px', fontWeight: '600' }}>
                IFSC Code
              </label>
              <input
                type="text"
                name="bankIFSC"
                value={settings.bankIFSC}
                onChange={handleChange}
                placeholder="Enter IFSC code"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#1e2329',
                  border: '1px solid #474d57',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '16px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#eaecef', marginBottom: '8px', fontWeight: '600' }}>
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                value={settings.bankName}
                onChange={handleChange}
                placeholder="Enter bank name"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#1e2329',
                  border: '1px solid #474d57',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '16px'
                }}
              />
            </div>
          </div>
        </div>

        {/* USDT Wallet Addresses */}
        <div style={{ 
          backgroundColor: '#2b3139', 
          padding: '24px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          border: '1px solid #474d57'
        }}>
          <h3 style={{ color: '#ffffff', marginBottom: '20px' }}>USDT Wallet Addresses</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#eaecef', marginBottom: '8px', fontWeight: '600' }}>
              TRC-20 Address (Tron Network)
            </label>
            <input
              type="text"
              name="trc20Address"
              value={settings.trc20Address}
              onChange={handleChange}
              placeholder="Enter TRC-20 wallet address"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1e2329',
                border: '1px solid #474d57',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '16px',
                fontFamily: 'monospace'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#eaecef', marginBottom: '8px', fontWeight: '600' }}>
              BEP-20 Address (BSC Network)
            </label>
            <input
              type="text"
              name="bep20Address"
              value={settings.bep20Address}
              onChange={handleChange}
              placeholder="Enter BEP-20 wallet address"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1e2329',
                border: '1px solid #474d57',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '16px',
                fontFamily: 'monospace'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#eaecef', marginBottom: '8px', fontWeight: '600' }}>
              Aptos Network Address
            </label>
            <input
              type="text"
              name="aptosAddress"
              value={settings.aptosAddress}
              onChange={handleChange}
              placeholder="Enter Aptos wallet address"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1e2329',
                border: '1px solid #474d57',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '16px',
                fontFamily: 'monospace'
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: loading ? '#848e9c' : '#fcd535',
            color: '#000',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {loading ? 'Updating...' : 'Update Settings'}
        </button>
      </form>
    </div>
  );
};

export default Settings;
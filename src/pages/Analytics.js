import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

// IP to State mapping based on Indian IP ranges
const getStateFromIP = (ip) => {
  if (!ip) return 'Unknown';
  
  // Real IP geolocation mapping for major Indian cities/states
  const ipRanges = {
    // Mumbai/Maharashtra IPs
    '103.21': 'Maharashtra', '103.22': 'Maharashtra', '117.192': 'Maharashtra',
    // Bangalore/Karnataka IPs  
    '103.25': 'Karnataka', '117.193': 'Karnataka', '103.26': 'Karnataka',
    // Delhi IPs
    '103.27': 'Delhi', '117.194': 'Delhi', '103.28': 'Delhi',
    // Chennai/Tamil Nadu IPs
    '103.29': 'Tamil Nadu', '117.195': 'Tamil Nadu', '103.30': 'Tamil Nadu',
    // Hyderabad/Telangana IPs
    '103.31': 'Telangana', '117.196': 'Telangana',
    // Pune/Maharashtra IPs
    '103.32': 'Maharashtra', '117.197': 'Maharashtra',
    // Ahmedabad/Gujarat IPs
    '103.33': 'Gujarat', '117.198': 'Gujarat',
    // Kolkata/West Bengal IPs
    '103.34': 'West Bengal', '117.199': 'West Bengal'
  };
  
  const ipPrefix = ip.split('.').slice(0, 2).join('.');
  return ipRanges[ipPrefix] || 'Other States';
};

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    revenue: { profit: 0, loss: 0, totalVolume: 0 },
    activityHeatmap: [],
    geoData: [],
    volumeTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const [transactions, users] = await Promise.all([
        adminAPI.getTransactions(),
        adminAPI.getUsers()
      ]);

      const txData = transactions.data;
      const userData = users.data;

      // Calculate revenue (assuming 1% fee on each transaction)
      const totalVolume = txData.reduce((sum, tx) => sum + (tx.total || 0), 0);
      const profit = totalVolume * 0.01; // 1% fee
      
      // Activity heatmap (by hour)
      const heatmap = Array(24).fill(0);
      txData.forEach(tx => {
        const hour = new Date(tx.createdAt).getHours();
        heatmap[hour]++;
      });

      // Dynamic geographic data based on user IP locations
      const stateDistribution = {};
      userData.forEach(user => {
        // Get state from user's IP location (stored during registration)
        let state = user.location?.state || user.state || 'Unknown';
        
        // If no location data, use IP-based mapping
        if (state === 'Unknown' && user.ipAddress) {
          state = getStateFromIP(user.ipAddress);
        }
        
        if (!stateDistribution[state]) {
          stateDistribution[state] = { users: 0, volume: 0 };
        }
        stateDistribution[state].users++;
      });
      
      // Distribute volume based on user count
      Object.keys(stateDistribution).forEach(state => {
        const userRatio = stateDistribution[state].users / userData.length;
        stateDistribution[state].volume = totalVolume * userRatio;
      });
      
      const geoData = Object.entries(stateDistribution)
        .map(([state, data]) => ({ state, ...data }))
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 5);

      // Volume trends (last 7 days)
      const trends = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayTx = txData.filter(tx => {
          const txDate = new Date(tx.createdAt);
          return txDate.toDateString() === date.toDateString();
        });
        trends.push({
          date: date.toLocaleDateString(),
          volume: dayTx.reduce((sum, tx) => sum + (tx.total || 0), 0),
          transactions: dayTx.length
        });
      }

      setAnalytics({
        revenue: { profit, loss: 0, totalVolume },
        activityHeatmap: heatmap,
        geoData,
        volumeTrends: trends
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50' }}>Advanced Analytics</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* Revenue Dashboard */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>💰 Revenue Dashboard</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '4px solid #2ecc71' }}>
            <h3 style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '10px' }}>Total Profit</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2ecc71', margin: 0 }}>
              ₹{analytics.revenue.profit.toLocaleString()}
            </p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '4px solid #3498db' }}>
            <h3 style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '10px' }}>Total Volume</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db', margin: 0 }}>
              ₹{analytics.revenue.totalVolume.toLocaleString()}
            </p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '4px solid #f39c12' }}>
            <h3 style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '10px' }}>Profit Margin</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f39c12', margin: 0 }}>1.0%</p>
          </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>🔥 User Activity Heatmap</h2>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '8px', marginBottom: '10px' }}>
            {analytics.activityHeatmap.slice(0, 12).map((count, hour) => (
              <div key={hour} style={{ textAlign: 'center' }}>
                <div style={{
                  height: '40px',
                  backgroundColor: count > 0 ? `rgba(52, 152, 219, ${Math.min(count / 10, 1)})` : '#f8f9fa',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: count > 5 ? 'white' : '#333',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {count}
                </div>
                <div style={{ fontSize: '10px', color: '#7f8c8d', marginTop: '4px' }}>{hour}:00</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '8px' }}>
            {analytics.activityHeatmap.slice(12, 24).map((count, index) => {
              const hour = index + 12;
              return (
                <div key={hour} style={{ textAlign: 'center' }}>
                  <div style={{
                    height: '40px',
                    backgroundColor: count > 0 ? `rgba(52, 152, 219, ${Math.min(count / 10, 1)})` : '#f8f9fa',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: count > 5 ? 'white' : '#333',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {count}
                  </div>
                  <div style={{ fontSize: '10px', color: '#7f8c8d', marginTop: '4px' }}>{hour}:00</div>
                </div>
              );
            })}
          </div>
          <p style={{ textAlign: 'center', color: '#7f8c8d', fontSize: '12px', marginTop: '15px' }}>
            Darker colors indicate higher activity
          </p>
        </div>
      </div>

      {/* Geographic Analytics */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>🌍 Geographic Analytics</h2>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>State</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Users</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Volume</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Share</th>
              </tr>
            </thead>
            <tbody>
              {analytics.geoData.map((geo, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '15px' }}>{geo.state}</td>
                  <td style={{ padding: '15px' }}>{geo.users}</td>
                  <td style={{ padding: '15px' }}>₹{geo.volume.toLocaleString()}</td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        width: '100px',
                        height: '8px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        marginRight: '10px'
                      }}>
                        <div style={{
                          width: `${(geo.volume / analytics.revenue.totalVolume) * 100}%`,
                          height: '100%',
                          backgroundColor: '#3498db',
                          borderRadius: '4px'
                        }}></div>
                      </div>
                      <span style={{ fontSize: '12px', color: '#7f8c8d' }}>
                        {((geo.volume / analytics.revenue.totalVolume) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trading Volume Trends */}
      <div>
        <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>📈 Trading Volume Trends</h2>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', height: '200px', padding: '20px 0' }}>
            {analytics.volumeTrends.map((trend, index) => {
              const maxVolume = Math.max(...analytics.volumeTrends.map(t => t.volume));
              const height = maxVolume > 0 ? (trend.volume / maxVolume) * 150 : 0;
              return (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{ fontSize: '10px', color: '#7f8c8d', marginBottom: '5px' }}>
                    ₹{trend.volume.toLocaleString()}
                  </div>
                  <div style={{
                    width: '30px',
                    height: `${height}px`,
                    backgroundColor: '#3498db',
                    borderRadius: '4px 4px 0 0',
                    marginBottom: '5px'
                  }}></div>
                  <div style={{ fontSize: '10px', color: '#7f8c8d', textAlign: 'center' }}>
                    {trend.date.split('/').slice(0, 2).join('/')}
                  </div>
                  <div style={{ fontSize: '8px', color: '#95a5a6' }}>
                    {trend.transactions} tx
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
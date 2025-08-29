import React from 'react';

const LoadingSkeleton = ({ type = 'table', rows = 5 }) => {
  const shimmer = {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite'
  };

  if (type === 'table') {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <style>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
        
        {/* Table Header */}
        <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderBottom: '1px solid #dee2e6' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ ...shimmer, height: '16px', borderRadius: '4px', flex: 1 }}></div>
            ))}
          </div>
        </div>
        
        {/* Table Rows */}
        {Array(rows).fill().map((_, index) => (
          <div key={index} style={{ padding: '15px', borderBottom: '1px solid #dee2e6' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ ...shimmer, height: '14px', borderRadius: '4px', flex: 1 }}></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <style>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
        {Array(4).fill().map((_, index) => (
          <div key={index} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ ...shimmer, height: '20px', borderRadius: '4px', marginBottom: '15px', width: '60%' }}></div>
            <div style={{ ...shimmer, height: '32px', borderRadius: '4px', width: '80%' }}></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      <div style={{ ...shimmer, height: '24px', borderRadius: '4px', marginBottom: '20px', width: '30%' }}></div>
      <div style={{ ...shimmer, height: '200px', borderRadius: '8px' }}></div>
    </div>
  );
};

export default LoadingSkeleton;
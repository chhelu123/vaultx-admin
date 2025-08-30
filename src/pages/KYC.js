import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const KYC = () => {
  const [kycRecords, setKycRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingKYC, setViewingKYC] = useState(null);
  const [reviewForm, setReviewForm] = useState({ status: 'approved', adminNotes: '' });

  useEffect(() => {
    fetchKYC();
  }, []);

  const fetchKYC = async () => {
    try {
      const response = await adminAPI.getKYC();
      const kycData = response.data.kyc || response.data || [];
      setKycRecords(kycData);
    } catch (error) {
      console.error('Error fetching KYC records:', error);
    }
    setLoading(false);
  };

  const handleViewKYC = async (kycId) => {
    try {
      const response = await adminAPI.getKYCById(kycId);
      setViewingKYC(response.data);
      setReviewForm({ status: 'approved', adminNotes: '' });
    } catch (error) {
      alert('Error fetching KYC details');
    }
  };

  const handleReviewKYC = async () => {
    try {
      await adminAPI.reviewKYC(viewingKYC._id, reviewForm);
      alert('KYC reviewed successfully!');
      setViewingKYC(null);
      fetchKYC();
    } catch (error) {
      alert('Error reviewing KYC');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f39c12';
      case 'approved': return '#2ecc71';
      case 'rejected': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return <div>Loading KYC records...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '30px', color: '#2c3e50' }}>KYC Management</h1>
      
      <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>User</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Full Name</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>PAN Number</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Status</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Submitted</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {kycRecords.map((kyc) => (
              <tr key={kyc._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '15px' }}>{kyc.userId?.name || 'Unknown'}</td>
                <td style={{ padding: '15px' }}>{kyc.fullName}</td>
                <td style={{ padding: '15px' }}>{kyc.panNumber}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '12px',
                    backgroundColor: getStatusColor(kyc.status)
                  }}>
                    {kyc.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '15px' }}>{new Date(kyc.submittedAt).toLocaleDateString()}</td>
                <td style={{ padding: '15px' }}>
                  <button
                    onClick={() => handleViewKYC(kyc._id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#3498db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '8px'
                    }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {kycRecords.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>
            No KYC records found
          </div>
        )}
      </div>

      {viewingKYC && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflow: 'auto' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
            <h3 style={{ marginBottom: '20px' }}>KYC Details - {viewingKYC.userId?.name}</h3>
            
            {/* Personal Information */}
            <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '16px', color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '8px' }}>Personal Information</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ margin: '8px 0' }}><strong>Full Name:</strong> {viewingKYC.fullName}</p>
                  <p style={{ margin: '8px 0' }}><strong>Date of Birth:</strong> {new Date(viewingKYC.dateOfBirth).toLocaleDateString()}</p>
                  <p style={{ margin: '8px 0' }}><strong>Mobile Number:</strong> {viewingKYC.mobileNumber}</p>
                </div>
                <div>
                  <p style={{ margin: '8px 0' }}><strong>Aadhar Number:</strong> {viewingKYC.aadharNumber}</p>
                  <p style={{ margin: '8px 0' }}><strong>PAN Number:</strong> {viewingKYC.panNumber}</p>
                  <p style={{ margin: '8px 0' }}><strong>Status:</strong> 
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      color: 'white',
                      fontSize: '12px',
                      backgroundColor: getStatusColor(viewingKYC.status),
                      marginLeft: '8px'
                    }}>
                      {viewingKYC.status.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '16px', color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '8px' }}>Address Information</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ margin: '8px 0' }}><strong>Street Address:</strong> {viewingKYC.streetAddress || 'Not provided'}</p>
                  <p style={{ margin: '8px 0' }}><strong>City:</strong> {viewingKYC.city || 'Not provided'}</p>
                </div>
                <div>
                  <p style={{ margin: '8px 0' }}><strong>State:</strong> {viewingKYC.state || 'Not provided'}</p>
                  <p style={{ margin: '8px 0' }}><strong>PIN Code:</strong> {viewingKYC.pincode || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Review Information */}
            <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '16px', color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '8px' }}>Review Information</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ margin: '8px 0' }}><strong>Submitted:</strong> {new Date(viewingKYC.submittedAt).toLocaleString()}</p>
                  {viewingKYC.reviewedAt && (
                    <p style={{ margin: '8px 0' }}><strong>Reviewed:</strong> {new Date(viewingKYC.reviewedAt).toLocaleString()}</p>
                  )}
                </div>
                <div>
                  {viewingKYC.adminNotes && (
                    <p style={{ margin: '8px 0' }}><strong>Admin Notes:</strong> {viewingKYC.adminNotes}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Document Verification */}
            <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '16px', color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '8px' }}>Document Verification</h4>
              
              {/* Aadhar Documents */}
              <div style={{ marginBottom: '20px' }}>
                <h5 style={{ marginBottom: '12px', color: '#34495e' }}>Aadhar Card Documents</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <h6 style={{ marginBottom: '8px', fontSize: '14px', color: '#7f8c8d' }}>Front Side with Selfie</h6>
                    <div style={{ border: '2px solid #ddd', borderRadius: '8px', padding: '12px', textAlign: 'center', backgroundColor: 'white' }}>
                      {viewingKYC.aadharFrontWithSelfie ? (
                        <img 
                          src={viewingKYC.aadharFrontWithSelfie.startsWith('data:') ? viewingKYC.aadharFrontWithSelfie : `data:image/jpeg;base64,${viewingKYC.aadharFrontWithSelfie}`}
                          alt="Aadhar Front with Selfie"
                          style={{ maxWidth: '100%', maxHeight: '200px', cursor: 'pointer', borderRadius: '4px' }}
                          onClick={() => window.open(viewingKYC.aadharFrontWithSelfie.startsWith('data:') ? viewingKYC.aadharFrontWithSelfie : `data:image/jpeg;base64,${viewingKYC.aadharFrontWithSelfie}`, '_blank')}
                        />
                      ) : viewingKYC.aadharDocument ? (
                        <img 
                          src={viewingKYC.aadharDocument.startsWith('data:') ? viewingKYC.aadharDocument : `data:image/jpeg;base64,${viewingKYC.aadharDocument}`}
                          alt="Aadhar Document (Legacy)"
                          style={{ maxWidth: '100%', maxHeight: '200px', cursor: 'pointer', borderRadius: '4px' }}
                          onClick={() => window.open(viewingKYC.aadharDocument.startsWith('data:') ? viewingKYC.aadharDocument : `data:image/jpeg;base64,${viewingKYC.aadharDocument}`, '_blank')}
                        />
                      ) : (
                        <p style={{ color: '#999', margin: '20px 0' }}>No document uploaded</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h6 style={{ marginBottom: '8px', fontSize: '14px', color: '#7f8c8d' }}>Back Side with Selfie</h6>
                    <div style={{ border: '2px solid #ddd', borderRadius: '8px', padding: '12px', textAlign: 'center', backgroundColor: 'white' }}>
                      {viewingKYC.aadharBackWithSelfie ? (
                        <img 
                          src={viewingKYC.aadharBackWithSelfie.startsWith('data:') ? viewingKYC.aadharBackWithSelfie : `data:image/jpeg;base64,${viewingKYC.aadharBackWithSelfie}`}
                          alt="Aadhar Back with Selfie"
                          style={{ maxWidth: '100%', maxHeight: '200px', cursor: 'pointer', borderRadius: '4px' }}
                          onClick={() => window.open(viewingKYC.aadharBackWithSelfie.startsWith('data:') ? viewingKYC.aadharBackWithSelfie : `data:image/jpeg;base64,${viewingKYC.aadharBackWithSelfie}`, '_blank')}
                        />
                      ) : (
                        <p style={{ color: '#999', margin: '20px 0' }}>No document uploaded</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* PAN Document */}
              <div>
                <h5 style={{ marginBottom: '12px', color: '#34495e' }}>PAN Card Document</h5>
                <div style={{ maxWidth: '400px' }}>
                  <div style={{ border: '2px solid #ddd', borderRadius: '8px', padding: '12px', textAlign: 'center', backgroundColor: 'white' }}>
                    {viewingKYC.panDocument ? (
                      <img 
                        src={viewingKYC.panDocument.startsWith('data:') ? viewingKYC.panDocument : `data:image/jpeg;base64,${viewingKYC.panDocument}`}
                        alt="PAN Document"
                        style={{ maxWidth: '100%', maxHeight: '200px', cursor: 'pointer', borderRadius: '4px' }}
                        onClick={() => window.open(viewingKYC.panDocument.startsWith('data:') ? viewingKYC.panDocument : `data:image/jpeg;base64,${viewingKYC.panDocument}`, '_blank')}
                      />
                    ) : (
                      <p style={{ color: '#999', margin: '20px 0' }}>No document uploaded</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {viewingKYC.status === 'pending' && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Review Decision</label>
                  <select
                    value={reviewForm.status}
                    onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                  </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Admin Notes</label>
                  <textarea
                    value={reviewForm.adminNotes}
                    onChange={(e) => setReviewForm({ ...reviewForm, adminNotes: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', height: '80px' }}
                    placeholder="Optional notes for the user..."
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              {viewingKYC.status === 'pending' && (
                <button
                  onClick={handleReviewKYC}
                  style={{ flex: 1, padding: '12px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Submit Review
                </button>
              )}
              <button
                onClick={() => setViewingKYC(null)}
                style={{ flex: 1, padding: '12px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYC;
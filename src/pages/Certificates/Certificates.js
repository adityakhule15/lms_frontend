import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { certificateAPI } from '../../services/api';
import { FiDownload, FiCheck, FiSearch, FiAward, FiCalendar, FiUser, FiAlertCircle, FiExternalLink } from 'react-icons/fi';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [downloading, setDownloading] = useState({});

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await certificateAPI.getCertificates();
      setCertificates(response.data || []);
    } catch (err) {
      setError('Failed to load certificates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certificateId, certificateData) => {
    try {
      setDownloading(prev => ({ ...prev, [certificateId]: true }));
      
      // Try to download from API first
      const response = await certificateAPI.downloadCertificate(certificateId);
      
      // If PDF file exists in response, create download
      if (response.data?.pdf_file) {
        const link = document.createElement('a');
        link.href = response.data.pdf_file;
        link.download = `Certificate-${certificateData.certificate_id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Generate PDF on client side (simulated)
        simulatePDFGeneration(certificateData);
      }
      
    } catch (err) {
      console.error('Download error:', err);
      // Fallback to simulated generation
      simulatePDFGeneration(certificateData);
    } finally {
      setDownloading(prev => ({ ...prev, [certificateId]: false }));
    }
  };

  const simulatePDFGeneration = (certificateData) => {
    const certificateContent = `
      Certificate of Completion
      
      This certifies that
      ${certificateData.student?.first_name} ${certificateData.student?.last_name}
      
      has successfully completed the course
      "${certificateData.course?.title}"
      
      Certificate ID: ${certificateData.certificate_id}
      Issued: ${new Date(certificateData.issued_at).toLocaleDateString()}
      Instructor: ${certificateData.course?.instructor?.first_name} ${certificateData.course?.instructor?.last_name}
    `;
    
    const blob = new Blob([certificateContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Certificate-${certificateData.certificate_id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Certificate downloaded as text file. In production, this would be a PDF.');
  };

  const handleVerify = async (certificateId) => {
    try {
      setVerifying(true);
      const response = await certificateAPI.verifyCertificate(certificateId);
      setVerificationResult(response.data);
    } catch (err) {
      setVerificationResult({
        valid: false,
        error: err.response?.data?.message || 'Verification failed',
        certificate_id: certificateId
      });
    } finally {
      setVerifying(false);
    }
  };

  const filteredCertificates = certificates.filter(cert =>
    !cert ||
    cert.certificate_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.student?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.student?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your certificates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <FiAlertCircle size={48} style={styles.errorIcon} />
        <h3 style={styles.errorTitle}>Error Loading Certificates</h3>
        <p style={styles.errorMessage}>{error}</p>
        <button 
          onClick={fetchCertificates}
          style={styles.primaryButton}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Certificates</h1>
          <p style={styles.subtitle}>Celebrate your learning achievements</p>
        </div>
        <div style={styles.headerStats}>
          <div style={styles.statBadge}>
            <FiAward size={16} />
            <span>{certificates.length} Certificate{certificates.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div style={styles.searchCard}>
        <div style={styles.searchContainer}>
          <FiSearch style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search certificates by ID, course name, or your name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              style={styles.clearSearchButton}
            >
              Clear
            </button>
          )}
        </div>
        <div style={styles.searchInfo}>
          Showing {filteredCertificates.length} of {certificates.length} certificates
        </div>
      </div>

      {/* Verification Result */}
      {verificationResult && (
        <div style={{
          ...styles.verificationCard,
          ...(verificationResult.valid ? styles.verificationValid : styles.verificationInvalid)
        }}>
          <div style={styles.verificationHeader}>
            <div style={styles.verificationIcon}>
              {verificationResult.valid ? '✅' : '❌'}
            </div>
            <div style={styles.verificationTitle}>
              <h3>{verificationResult.valid ? 'Certificate Verified' : 'Certificate Invalid'}</h3>
              <p style={styles.verificationSubtitle}>
                {verificationResult.valid ? 'This certificate is authentic and valid' : verificationResult.error || 'This certificate could not be verified'}
              </p>
            </div>
            <button
              onClick={() => setVerificationResult(null)}
              style={styles.closeButton}
            >
              ✕
            </button>
          </div>
          
          {verificationResult.valid && verificationResult.certificate && (
            <div style={styles.verificationDetails}>
              <div style={styles.verificationGrid}>
                <div style={styles.verificationItem}>
                  <div style={styles.verificationLabel}>Certificate ID</div>
                  <div style={styles.verificationValue}>{verificationResult.certificate.certificate_id}</div>
                </div>
                <div style={styles.verificationItem}>
                  <div style={styles.verificationLabel}>Student</div>
                  <div style={styles.verificationValue}>
                    {verificationResult.certificate.student?.first_name} {verificationResult.certificate.student?.last_name}
                  </div>
                </div>
                <div style={styles.verificationItem}>
                  <div style={styles.verificationLabel}>Course</div>
                  <div style={styles.verificationValue}>{verificationResult.certificate.course?.title}</div>
                </div>
                <div style={styles.verificationItem}>
                  <div style={styles.verificationLabel}>Issued Date</div>
                  <div style={styles.verificationValue}>{formatDate(verificationResult.certificate.issued_at)}</div>
                </div>
                <div style={styles.verificationItem}>
                  <div style={styles.verificationLabel}>Instructor</div>
                  <div style={styles.verificationValue}>
                    {verificationResult.certificate.course?.instructor?.first_name} {verificationResult.certificate.course?.instructor?.last_name}
                  </div>
                </div>
                <div style={styles.verificationItem}>
                  <div style={styles.verificationLabel}>Status</div>
                  <div style={styles.verificationValue}>
                    <span style={styles.statusVerified}>Verified ✓</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Certificates Grid */}
      {filteredCertificates.length > 0 ? (
        <div style={styles.certificatesGrid}>
          {filteredCertificates.map((certificate) => (
            <div key={certificate.id} style={styles.certificateCard}>
              <div style={styles.certificateHeader}>
                <div style={styles.certificateIcon}>
                  <FiAward size={24} />
                </div>
                <div style={styles.certificateId}>
                  {certificate.certificate_id}
                </div>
              </div>
              
              <div style={styles.certificateBody}>
                <h3 style={styles.certificateTitle}>Certificate of Completion</h3>
                <p style={styles.certificateCourse}>{certificate.course?.title}</p>
                
                <div style={styles.certificateDetails}>
                  <div style={styles.detailItem}>
                    <FiUser size={14} />
                    <span>{certificate.student?.first_name} {certificate.student?.last_name}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <FiCalendar size={14} />
                    <span>Issued {formatDate(certificate.issued_at)}</span>
                  </div>
                </div>
                
                <div style={styles.instructorInfo}>
                  <div style={styles.instructorAvatar}>
                    {certificate.course?.instructor?.first_name?.charAt(0) || 'I'}
                  </div>
                  <div style={styles.instructorText}>
                    <div style={styles.instructorName}>
                      {certificate.course?.instructor?.first_name} {certificate.course?.instructor?.last_name}
                    </div>
                    <div style={styles.instructorRole}>Instructor</div>
                  </div>
                </div>
              </div>
              
              <div style={styles.certificateActions}>
                <button
                  onClick={() => handleDownload(certificate.id, certificate)}
                  style={styles.downloadButton}
                  disabled={downloading[certificate.id]}
                >
                  <FiDownload />
                  {downloading[certificate.id] ? 'Downloading...' : 'Download PDF'}
                </button>
                <button
                  onClick={() => handleVerify(certificate.certificate_id)}
                  style={styles.verifyButton}
                  disabled={verifying}
                >
                  <FiCheck />
                  {verifying ? 'Verifying...' : 'Verify'}
                </button>
                <Link 
                  to={`/courses/${certificate.course?.id}`}
                  style={styles.courseButton}
                >
                  <FiExternalLink />
                  View Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <div style={styles.emptyStateIcon}>
            <FiAward size={64} />
          </div>
          <h2 style={styles.emptyStateTitle}>No Certificates Yet</h2>
          <p style={styles.emptyStateText}>
            {searchTerm ? 'No certificates match your search.' : 'Complete courses to earn certificates.'}
          </p>
          {searchTerm ? (
            <button 
              onClick={() => setSearchTerm('')}
              style={styles.primaryButton}
            >
              Clear Search
            </button>
          ) : (
            <Link to="/courses" style={styles.primaryButton}>
              Browse Courses
            </Link>
          )}
        </div>
      )}

      {/* Public Verification Section */}
      <div style={styles.verificationSection}>
        <div style={styles.verificationCardPublic}>
          <div style={styles.verificationHeaderPublic}>
            <FiCheck size={24} />
            <h3>Verify Any Certificate</h3>
          </div>
          <p style={styles.verificationText}>
            Enter a Certificate ID below to verify its authenticity. This verification is public and free to use.
          </p>
          <div style={styles.verificationInputGroup}>
            <input
              type="text"
              placeholder="Enter Certificate ID (e.g., CERT-A1B2C3D4E5F6)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.verificationInput}
            />
            <button
              onClick={() => {
                const certId = searchTerm.match(/CERT-[A-Z0-9]+/i)?.[0];
                if (certId) {
                  handleVerify(certId);
                } else {
                  alert('Please enter a valid certificate ID starting with CERT-');
                }
              }}
              style={styles.verificationSubmitButton}
              disabled={verifying}
            >
              {verifying ? 'Verifying...' : 'Verify Now'}
            </button>
          </div>
          <div style={styles.verificationExamples}>
            <p style={styles.verificationExamplesTitle}>Example Certificate IDs:</p>
            <div style={styles.exampleList}>
              <code style={styles.exampleCode}>CERT-3BE755FC96B9</code>
              <code style={styles.exampleCode}>CERT-A1B2C3D4E5F6</code>
              <code style={styles.exampleCode}>CERT-123456789ABC</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem',
  },
  
  errorContainer: {
    textAlign: 'center',
    padding: '3rem',
    background: '#fef2f2',
    borderRadius: '12px',
    border: '1px solid #fecaca',
  },
  errorIcon: {
    color: '#dc2626',
    marginBottom: '1rem',
  },
  errorTitle: {
    color: '#dc2626',
    marginBottom: '0.5rem',
  },
  errorMessage: {
    color: '#6b7280',
    marginBottom: '1.5rem',
  },
  
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '1.125rem',
  },
  headerStats: {
    display: 'flex',
    gap: '1rem',
  },
  statBadge: {
    background: '#e0e7ff',
    color: '#4f46e5',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  
  searchCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: '2rem',
  },
  searchContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    color: '#9ca3af',
  },
  searchInput: {
    flex: 1,
    padding: '0.75rem 1rem 0.75rem 3rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'all 0.2s',
  },
  clearSearchButton: {
    position: 'absolute',
    right: '1rem',
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  searchInfo: {
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  
  verificationCard: {
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
    transition: 'all 0.3s ease',
  },
  verificationValid: {
    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    border: '1px solid #a7f3d0',
  },
  verificationInvalid: {
    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    border: '1px solid #fecaca',
  },
  verificationHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  verificationIcon: {
    fontSize: '2rem',
    marginRight: '1rem',
    flexShrink: 0,
  },
  verificationTitle: {
    flex: 1,
  },
  verificationSubtitle: {
    color: '#6b7280',
    fontSize: '0.875rem',
    marginTop: '0.25rem',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background-color 0.2s',
  },
  verificationDetails: {
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
  },
  verificationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
  },
  verificationItem: {
    marginBottom: '0.75rem',
  },
  verificationLabel: {
    color: '#6b7280',
    fontSize: '0.875rem',
    marginBottom: '0.25rem',
  },
  verificationValue: {
    fontWeight: '500',
    color: '#1f2937',
  },
  statusVerified: {
    color: '#065f46',
    fontWeight: '600',
  },
  
  certificatesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem',
  },
  certificateCard: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  certificateHeader: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '1.5rem',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  certificateIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  certificateId: {
    flex: 1,
    fontSize: '0.875rem',
    fontFamily: 'monospace',
    letterSpacing: '0.5px',
  },
  certificateBody: {
    padding: '1.5rem',
  },
  certificateTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.5rem',
    textAlign: 'center',
  },
  certificateCourse: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#4f46e5',
    marginBottom: '1rem',
    textAlign: 'center',
    lineHeight: '1.4',
  },
  certificateDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  instructorInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  instructorAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    flexShrink: 0,
  },
  instructorText: {
    flex: 1,
  },
  instructorName: {
    fontWeight: '600',
    color: '#1f2937',
    fontSize: '0.875rem',
  },
  instructorRole: {
    color: '#6b7280',
    fontSize: '0.75rem',
  },
  certificateActions: {
    padding: '1.5rem',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  downloadButton: {
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'background-color 0.2s',
  },
  verifyButton: {
    background: 'white',
    color: '#10b981',
    border: '1px solid #10b981',
    padding: '0.75rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
  },
  courseButton: {
    background: '#f3f4f6',
    color: '#374151',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
    transition: 'background-color 0.2s',
  },
  
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: '3rem',
  },
  emptyStateIcon: {
    color: '#9ca3af',
    marginBottom: '1.5rem',
  },
  emptyStateTitle: {
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  emptyStateText: {
    color: '#6b7280',
    maxWidth: '500px',
    margin: '0 auto 1.5rem',
    lineHeight: '1.6',
  },
  
  verificationSection: {
    marginTop: '3rem',
  },
  verificationCardPublic: {
    background: 'white',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  verificationHeaderPublic: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  },
  verificationText: {
    color: '#6b7280',
    lineHeight: '1.6',
    marginBottom: '1.5rem',
  },
  verificationInputGroup: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  verificationInput: {
    flex: 1,
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '1rem',
  },
  verificationSubmitButton: {
    background: '#10b981',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  verificationExamples: {
    paddingTop: '1.5rem',
    borderTop: '1px solid #e5e7eb',
  },
  verificationExamplesTitle: {
    color: '#6b7280',
    fontSize: '0.875rem',
    marginBottom: '0.5rem',
  },
  exampleList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  exampleCode: {
    background: '#f3f4f6',
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontFamily: 'monospace',
    color: '#374151',
  },
  
  primaryButton: {
    background: '#4f46e5',
    color: 'white',
    textDecoration: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    display: 'inline-block',
    border: 'none',
    cursor: 'pointer',
  },
};

// Add global styles
const globalStyles = document.createElement('style');
globalStyles.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .certificate-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
  }
  
  .search-input:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
  
  .close-button:hover {
    background: rgba(0, 0, 0, 0.1);
  }
  
  .download-button:hover:not(:disabled) {
    background: #4338ca;
  }
  
  .verify-button:hover:not(:disabled) {
    background: #10b981;
    color: white;
  }
  
  .course-button:hover {
    background: #e5e7eb;
  }
  
  .verification-submit-button:hover:not(:disabled) {
    background: #059669;
  }
  
  .primary-button:hover {
    background: #4338ca;
  }
`;
document.head.appendChild(globalStyles);

export default Certificates;
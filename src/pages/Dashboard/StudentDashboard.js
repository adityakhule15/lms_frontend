import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBook, FiAward, FiTrendingUp, FiChevronRight, FiAlertCircle } from 'react-icons/fi';
import { dashboardAPI, progressAPI } from '../../services/api';
import ProgressChart from '../../components/dashboard/ProgressChart';

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [overallProgress, setOverallProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    fetchOverallProgress();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getStudentDashboard();
      setDashboardData(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverallProgress = async () => {
    try {
      const response = await progressAPI.getOverallProgress();
      setOverallProgress(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCertificatesClick = () => {
    navigate('/certificates');
  };

  // Base styles
  const baseStyles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    loading: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      fontSize: '18px',
      color: '#666'
    },
    error: {
      textAlign: 'center',
      padding: '40px',
      color: '#dc2626'
    },
    header: {
      marginBottom: '30px'
    },
    welcomeText: {
      fontSize: '28px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '8px'
    },
    highlight: {
      color: '#4f46e5'
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '16px'
    },
    sectionCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '24px'
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1f2937'
    },
    viewAll: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      color: '#4f46e5',
      textDecoration: 'none',
      fontWeight: '500',
      fontSize: '14px'
    },
    btn: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      textDecoration: 'none',
      display: 'inline-block',
      textAlign: 'center'
    },
    btnPrimary: {
      background: '#4f46e5',
      color: 'white'
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#6b7280'
    }
  };

  // Responsive styles
  const responsiveStyles = {
    container: {
      padding: {
        base: '20px',
        md: '16px',
        sm: '12px'
      }
    },
    welcomeText: {
      fontSize: {
        base: '28px',
        md: '24px',
        sm: '20px'
      }
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: {
        base: 'repeat(auto-fit, minmax(250px, 1fr))',
        md: 'repeat(2, 1fr)',
        sm: '1fr'
      },
      gap: {
        base: '20px',
        md: '16px',
        sm: '12px'
      },
      marginBottom: '30px'
    },
    statCard: {
      background: 'white',
      borderRadius: '12px',
      padding: {
        base: '24px',
        md: '20px',
        sm: '16px'
      },
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: {
        base: '16px',
        md: '12px'
      },
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer'
    },
    statIcon: {
      width: {
        base: '56px',
        md: '48px',
        sm: '40px'
      },
      height: {
        base: '56px',
        md: '48px',
        sm: '40px'
      },
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: {
        base: '24px',
        md: '20px',
        sm: '18px'
      }
    },
    statLabel: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '8px'
    },
    statNumber: {
      fontSize: {
        base: '28px',
        md: '24px',
        sm: '20px'
      },
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '4px'
    },
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: {
        base: '2fr 1fr',
        lg: '1.5fr 1fr',
        md: '1fr'
      },
      gap: {
        base: '30px',
        lg: '24px',
        md: '20px'
      }
    },
    coursesGrid: {
      display: 'grid',
      gridTemplateColumns: {
        base: 'repeat(auto-fit, minmax(300px, 1fr))',
        lg: 'repeat(auto-fit, minmax(280px, 1fr))',
        sm: '1fr'
      },
      gap: '20px'
    },
    courseCard: {
      border: '1px solid #e5e7eb',
      borderRadius: '10px',
      padding: {
        base: '20px',
        sm: '16px'
      },
      transition: 'border-color 0.2s, box-shadow 0.2s'
    },
    courseTitle: {
      fontSize: {
        base: '18px',
        md: '16px'
      },
      fontWeight: '600',
      color: '#1f2937',
      flex: '1'
    },
    courseDescription: {
      color: '#6b7280',
      fontSize: '14px',
      marginBottom: '16px',
      lineHeight: '1.5'
    },
    courseMeta: {
      display: 'flex',
      gap: '12px',
      fontSize: '14px',
      color: '#9ca3af',
      marginBottom: '12px'
    },
    courseActions: {
      display: 'flex',
      gap: '12px',
      marginTop: '16px'
    }
  };

  // Get window width for responsive behavior
  const getWindowWidth = () => {
    return window.innerWidth;
  };

  // Get responsive value
  const getResponsiveValue = (obj) => {
    const width = getWindowWidth();
    if (width < 640 && obj.sm !== undefined) return obj.sm;
    if (width < 1024 && obj.md !== undefined) return obj.md;
    return obj.base || obj;
  };

  // Apply styles based on window width
  const applyResponsiveStyles = () => {
    const width = getWindowWidth();
    const isMobile = width < 640;
    const isTablet = width < 1024;
    
    return {
      container: { 
        ...baseStyles.container, 
        padding: getResponsiveValue(responsiveStyles.container.padding) 
      },
      welcomeText: { 
        ...baseStyles.welcomeText, 
        fontSize: getResponsiveValue(responsiveStyles.welcomeText.fontSize) 
      },
      statsGrid: {
        display: 'grid',
        gridTemplateColumns: getResponsiveValue(responsiveStyles.statsGrid.gridTemplateColumns),
        gap: getResponsiveValue(responsiveStyles.statsGrid.gap),
        marginBottom: '30px'
      },
      statCard: {
        background: 'white',
        borderRadius: '12px',
        padding: getResponsiveValue(responsiveStyles.statCard.padding),
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: getResponsiveValue(responsiveStyles.statCard.gap),
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer'
      },
      statIcon: {
        width: getResponsiveValue(responsiveStyles.statIcon.width),
        height: getResponsiveValue(responsiveStyles.statIcon.height),
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: getResponsiveValue(responsiveStyles.statIcon.fontSize)
      },
      statLabel: {
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '8px'
      },
      statNumber: { 
        fontSize: getResponsiveValue(responsiveStyles.statNumber.fontSize),
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '4px'
      },
      contentGrid: {
        display: 'grid',
        gridTemplateColumns: getResponsiveValue(responsiveStyles.contentGrid.gridTemplateColumns),
        gap: getResponsiveValue(responsiveStyles.contentGrid.gap)
      },
      coursesGrid: {
        display: 'grid',
        gridTemplateColumns: getResponsiveValue(responsiveStyles.coursesGrid.gridTemplateColumns),
        gap: '20px'
      },
      courseCard: {
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        padding: getResponsiveValue(responsiveStyles.courseCard.padding),
        transition: 'border-color 0.2s, box-shadow 0.2s'
      },
      courseTitle: { 
        fontSize: getResponsiveValue(responsiveStyles.courseTitle.fontSize),
        fontWeight: '600',
        color: '#1f2937',
        flex: '1'
      },
      ...baseStyles
    };
  };

  const [styles, setStyles] = useState(applyResponsiveStyles());
  const [windowWidth, setWindowWidth] = useState(getWindowWidth());

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(getWindowWidth());
      setStyles(applyResponsiveStyles());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #4f46e5',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
        <p>Loading your dashboard...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.error}>
        <FiAlertCircle size={48} style={{ marginBottom: '16px' }} />
        <h3 style={{ marginBottom: '8px' }}>Oops! Something went wrong</h3>
        <p style={{ marginBottom: '16px' }}>{error}</p>
        <button 
          onClick={fetchDashboardData}
          style={{ 
            ...styles.btn, 
            ...styles.btnPrimary,
            background: '#4f46e5',
            color: 'white'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { student, enrollments, stats, certificates } = dashboardData;

  // Calculate completion percentage safely
  const calculateCompletionRate = () => {
    if (!stats || !stats.total_courses) return 0;
    const completed = stats.completed_courses || 0;
    return Math.round((completed / stats.total_courses) * 100);
  };

  // Get total certificates
  const getTotalCertificates = () => {
    return certificates ? certificates.length : 0;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.welcomeText}>
          Welcome back, <span style={styles.highlight}>{student.first_name || student.username}</span>!
        </h1>
        <p style={styles.subtitle}>Track your learning progress and achievements</p>
      </header>

      {/* Stats Overview */}
      <div style={styles.statsGrid}>
        <div 
          style={{
            ...styles.statCard,
            ':hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }
          }}
          onClick={() => navigate('/courses')}
          title="View all courses"
        >
          <div style={{
            ...styles.statIcon,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}>
            <FiBook />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statLabel}>Courses Enrolled</h3>
            <div style={styles.statNumber}>
              {stats?.total_courses || 0}
            </div>
          </div>
        </div>

        <div 
          style={{
            ...styles.statCard,
            ':hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }
          }}
          onClick={() => navigate('/progress')}
          title="View progress details"
        >
          <div style={{ 
            ...styles.statIcon, 
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' 
          }}>
            <FiTrendingUp />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statLabel}>Completion Rate</h3>
            <div style={styles.statNumber}>
              {calculateCompletionRate()}%
            </div>
          </div>
        </div>

        <div 
          style={{
            ...styles.statCard,
            ':hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }
          }}
          onClick={handleCertificatesClick}
          title="Click to view certificates"
        >
          <div style={{ 
            ...styles.statIcon, 
            background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' 
          }}>
            <FiAward />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statLabel}>Certificates</h3>
            <div style={styles.statNumber}>
              {getTotalCertificates()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.contentGrid}>
        {/* Left Column - Main Content */}
        <div>
          {/* Courses Section */}
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>My Courses</h2>
              {enrollments && enrollments.length > 3 && (
                <Link to="/courses" style={styles.viewAll}>
                  View All <FiChevronRight />
                </Link>
              )}
            </div>
            
            {enrollments && enrollments.length > 0 ? (
              <div style={styles.coursesGrid}>
                {enrollments.slice(0, 3).map((enrollment) => (
                  <div 
                    key={enrollment.id} 
                    style={{
                      ...styles.courseCard,
                      ':hover': {
                        borderColor: '#4f46e5',
                        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.1)'
                      }
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <h3 style={styles.courseTitle}>{enrollment.course.title}</h3>
                      <span style={{
                        background: enrollment.progress_percentage === 100 ? '#d1fae5' : '#dbeafe',
                        color: enrollment.progress_percentage === 100 ? '#065f46' : '#1d4ed8',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        {enrollment.progress_percentage?.toFixed(0) || 0}%
                      </span>
                    </div>
                    <p style={styles.courseDescription}>
                      {enrollment.course.description?.substring(0, 100) || 'No description available'}
                      {enrollment.course.description?.length > 100 ? '...' : ''}
                    </p>
                    <div style={{
                      ...styles.courseMeta,
                      flexWrap: windowWidth < 480 ? 'wrap' : 'nowrap'
                    }}>
                      <span>{enrollment.progress?.completed_lessons || 0}/{enrollment.progress?.total_lessons || 0} lessons</span>
                      <span>•</span>
                      <span>{enrollment.progress_percentage === 100 ? 'Completed' : 'In Progress'}</span>
                    </div>
                    <div style={{
                      height: '8px',
                      background: '#e5e7eb',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      marginBottom: '16px'
                    }}>
                      <div style={{
                        height: '100%',
                        background: enrollment.progress_percentage === 100 ? 
                          'linear-gradient(90deg, #10b981, #34d399)' : 
                          'linear-gradient(90deg, #3b82f6, #60a5fa)',
                        width: `${enrollment.progress_percentage || 0}%`
                      }} />
                    </div>
                    <div style={{
                      ...styles.courseActions,
                      flexDirection: windowWidth < 480 ? 'column' : 'row'
                    }}>
                      <Link 
                        to={`/courses/${enrollment.course.id}`}
                        style={{ 
                          ...styles.btn, 
                          background: '#4f46e5',
                          color: 'white',
                          ':hover': {
                            background: '#4338ca'
                          },
                          width: windowWidth < 480 ? '100%' : 'auto'
                        }}
                      >
                        {enrollment.progress_percentage > 0 ? 'Continue' : 'Start Learning'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <FiBook size={48} style={{ marginBottom: '16px', color: '#9ca3af' }} />
                <h3 style={{ marginBottom: '8px' }}>No courses enrolled yet</h3>
                <p style={{ marginBottom: '16px' }}>Start your learning journey today!</p>
                <Link to="/courses" style={{ 
                  ...styles.btn, 
                  background: '#4f46e5',
                  color: 'white',
                  ':hover': {
                    background: '#4338ca'
                  }
                }}>
                  Browse Courses
                </Link>
              </div>
            )}
          </div>

          {/* Progress Chart */}
          {overallProgress && overallProgress.course_progress && overallProgress.course_progress.length > 0 && (
            <div style={styles.sectionCard}>
              <h2 style={styles.sectionTitle}>Learning Progress</h2>
              <ProgressChart data={overallProgress} />
            </div>
          )}
        </div>
      </div>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .section-card {
            padding: 20px !important;
          }
          
          .course-meta span:nth-child(2) {
            display: none;
          }
        }
        
        @media (max-width: 480px) {
          .welcome-text {
            font-size: 22px !important;
          }
          
          .subtitle {
            font-size: 14px !important;
          }
          
          .section-title {
            font-size: 18px !important;
          }
          
          .stat-number {
            font-size: 22px !important;
          }
          
          .course-title {
            font-size: 16px !important;
          }
          
          .btn-primary {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;
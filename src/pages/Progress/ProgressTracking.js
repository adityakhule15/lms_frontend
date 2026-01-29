import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { progressAPI, enrollmentAPI } from '../../services/api';
import { FiTrendingUp, FiCheckCircle, FiClock, FiAward, FiBook, FiCalendar, FiActivity, FiAlertCircle } from 'react-icons/fi';

const ProgressTracking = () => {
  const [overallProgress, setOverallProgress] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProgressData();
    fetchEnrollments();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await progressAPI.getOverallProgress();
      setOverallProgress(response.data);
    } catch (err) {
      setError('Failed to load progress data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const response = await enrollmentAPI.getEnrollments();
      setEnrollments(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your progress data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <FiAlertCircle size={48} style={styles.errorIcon} />
        <h3 style={styles.errorTitle}>Error Loading Progress</h3>
        <p style={styles.errorMessage}>{error}</p>
        <button 
          onClick={fetchProgressData}
          style={styles.primaryButton}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!overallProgress) {
    return (
      <div style={styles.emptyState}>
        <FiTrendingUp size={64} style={styles.emptyStateIcon} />
        <h2>No Progress Data Available</h2>
        <p style={styles.emptyStateText}>
          You haven't enrolled in any courses yet. Start your learning journey today!
        </p>
        <Link to="/courses" style={styles.primaryButton}>
          Browse Courses
        </Link>
      </div>
    );
  }

  const { student, summary, course_progress } = overallProgress;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Learning Progress</h1>
          <p style={styles.subtitle}>Track your learning journey and achievements</p>
        </div>
        <div style={styles.headerActions}>
          <Link to="/certificates" style={styles.certificatesButton}>
            <FiAward /> View Certificates
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <FiTrendingUp size={24} />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{summary.average_progress?.toFixed(1) || 0}%</div>
            <div style={styles.statLabel}>Overall Progress</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'}}>
            <FiCheckCircle size={24} />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{summary.completed_courses || 0}</div>
            <div style={styles.statLabel}>Completed Courses</div>
            <div style={styles.statSubtext}>of {summary.total_courses || 0} total</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'}}>
            <FiClock size={24} />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{summary.in_progress_courses || 0}</div>
            <div style={styles.statLabel}>In Progress</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)'}}>
            <FiAward size={24} />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{summary.total_certificates || 0}</div>
            <div style={styles.statLabel}>Certificates</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={styles.tabsContainer}>
        <button 
          style={{
            ...styles.tabButton,
            ...(activeTab === 'overview' ? styles.tabButtonActive : {})
          }}
          onClick={() => setActiveTab('overview')}
        >
          <FiBook /> Course Progress
        </button>
        <button 
          style={{
            ...styles.tabButton,
            ...(activeTab === 'enrollments' ? styles.tabButtonActive : {})
          }}
          onClick={() => setActiveTab('enrollments')}
        >
          <FiCalendar /> Recent Enrollments
        </button>
      </div>

      {/* Course Progress Table */}
      {activeTab === 'overview' && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Course Progress Details</h2>
            <span style={styles.cardBadge}>{course_progress?.length || 0} courses</span>
          </div>
          
          {course_progress && course_progress.length > 0 ? (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Course</th>
                    <th style={styles.tableHeader}>Progress</th>
                    <th style={styles.tableHeader}>Lessons</th>
                    <th style={styles.tableHeader}>Enrollment</th>
                    <th style={styles.tableHeader}>Last Activity</th>
                    <th style={styles.tableHeader}>Status</th>
                    <th style={styles.tableHeader}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {course_progress.map((course) => (
                    <tr key={course.course_id} style={styles.tableRow}>
                      <td style={styles.courseCell}>
                        <div style={styles.courseInfo}>
                          <div style={styles.courseAvatar}>
                            {course.course_title?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <div style={styles.courseName}>{course.course_title}</div>
                            <div style={styles.courseDescription}>
                              {course.course_description?.substring(0, 60) || 'No description'}
                              {course.course_description?.length > 60 ? '...' : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.progressCell}>
                        <div style={styles.progressContainer}>
                          <div style={styles.progressInfo}>
                            <span style={styles.progressPercentage}>
                              {course.progress_percentage?.toFixed(1) || 0}%
                            </span>
                            <div style={styles.progressBar}>
                              <div 
                                style={{
                                  ...styles.progressBarFill,
                                  width: `${course.progress_percentage || 0}%`,
                                  background: course.course_completed 
                                    ? 'linear-gradient(90deg, #10b981, #34d399)' 
                                    : 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.lessonsCell}>
                        <div style={styles.lessonsCount}>
                          <span style={styles.lessonsCompleted}>{course.completed_lessons || 0}</span>
                          <span style={styles.lessonsSeparator}>/</span>
                          <span style={styles.lessonsTotal}>{course.total_lessons || 0}</span>
                        </div>
                        <div style={styles.lessonsLabel}>lessons</div>
                      </td>
                      <td style={styles.dateCell}>
                        <div style={styles.dateWrapper}>
                          <div style={styles.dateIcon}>📅</div>
                          <div>
                            <div style={styles.dateText}>{formatDate(course.enrolled_at)}</div>
                            <div style={styles.daysAgo}>
                              {Math.floor((new Date() - new Date(course.enrolled_at)) / (1000 * 60 * 60 * 24))} days ago
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.dateCell}>
                        <div style={styles.dateWrapper}>
                          <div style={styles.dateIcon}>🕒</div>
                          <div>
                            <div style={styles.dateText}>{formatDateTime(course.last_activity)}</div>
                            <div style={styles.activityStatus}>
                              {course.last_activity ? 'Active' : 'No activity'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.statusCell}>
                        <span style={{
                          ...styles.statusBadge,
                          ...(course.course_completed ? styles.statusCompleted : styles.statusInProgress)
                        }}>
                          {course.course_completed ? 'Completed' : 'In Progress'}
                        </span>
                      </td>
                      <td style={styles.actionsCell}>
                        <div style={styles.actionButtons}>
                          <Link 
                            to={`/courses/${course.course_id}`}
                            style={styles.viewButton}
                          >
                            View Course
                          </Link>
                          {course.certificate && (
                            <Link
                              to="/certificates"
                              style={styles.certificateButton}
                            >
                              Certificate
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={styles.emptyTable}>
              <FiBook size={48} style={styles.emptyTableIcon} />
              <h3 style={styles.emptyTableTitle}>No Course Progress</h3>
              <p style={styles.emptyTableText}>
                You haven't enrolled in any courses yet. Start learning today!
              </p>
              <Link to="/courses" style={styles.primaryButton}>
                Browse Courses
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Recent Enrollments Tab */}
      {activeTab === 'enrollments' && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Recent Enrollments</h2>
            <Link to="/courses" style={styles.viewAllLink}>
              View All Courses
            </Link>
          </div>
          
          {enrollments && enrollments.length > 0 ? (
            <div style={styles.enrollmentsGrid}>
              {enrollments.slice(0, 6).map((enrollment) => (
                <div key={enrollment.id} style={styles.enrollmentCard}>
                  <div style={styles.enrollmentHeader}>
                    <div style={styles.enrollmentAvatar}>
                      {enrollment.course?.title?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <h3 style={styles.enrollmentTitle}>{enrollment.course?.title}</h3>
                      <div style={styles.enrollmentMeta}>
                        <span>Enrolled {formatDate(enrollment.enrolled_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={styles.enrollmentProgress}>
                    <div style={styles.enrollmentProgressBar}>
                      <div 
                        style={{
                          ...styles.enrollmentProgressFill,
                          width: `${enrollment.progress_percentage || 0}%`
                        }}
                      />
                    </div>
                    <div style={styles.enrollmentProgressText}>
                      <span>{enrollment.progress_percentage || 0}% Complete</span>
                    </div>
                  </div>
                  
                  <div style={styles.enrollmentStatus}>
                    <span style={{
                      ...styles.enrollmentStatusBadge,
                      ...(enrollment.completed ? styles.statusCompleted : styles.statusInProgress)
                    }}>
                      {enrollment.completed ? 'Completed' : 'In Progress'}
                    </span>
                    {enrollment.completed_at && (
                      <span style={styles.completionDate}>
                        Completed {formatDate(enrollment.completed_at)}
                      </span>
                    )}
                  </div>
                  
                  <div style={styles.enrollmentActions}>
                    <Link 
                      to={`/courses/${enrollment.course?.id}`}
                      style={styles.continueButton}
                    >
                      {enrollment.completed ? 'Review Course' : 'Continue Learning'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyEnrollments}>
              <FiCalendar size={48} style={styles.emptyEnrollmentsIcon} />
              <h3 style={styles.emptyEnrollmentsTitle}>No Enrollments</h3>
              <p style={styles.emptyEnrollmentsText}>
                You haven't enrolled in any courses yet.
              </p>
              <Link to="/courses" style={styles.primaryButton}>
                Browse Courses
              </Link>
            </div>
          )}
        </div>
      )}
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
  
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
  },
  emptyStateIcon: {
    color: '#9ca3af',
    marginBottom: '1.5rem',
  },
  emptyStateText: {
    color: '#6b7280',
    maxWidth: '500px',
    margin: '0 auto 2rem',
    lineHeight: '1.6',
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
  headerActions: {
    display: 'flex',
    gap: '1rem',
  },
  certificatesButton: {
    background: 'white',
    color: '#4f46e5',
    textDecoration: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontWeight: '500',
    border: '2px solid #4f46e5',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  statIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    flexShrink: 0,
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: '1',
  },
  statLabel: {
    color: '#6b7280',
    fontSize: '0.875rem',
    marginTop: '0.25rem',
  },
  statSubtext: {
    color: '#9ca3af',
    fontSize: '0.75rem',
    marginTop: '0.125rem',
  },
  
  tabsContainer: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '0.5rem',
  },
  tabButton: {
    background: 'none',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    color: '#6b7280',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
  },
  tabButtonActive: {
    background: '#4f46e5',
    color: 'white',
  },
  
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
  },
  cardBadge: {
    background: '#e0e7ff',
    color: '#4f46e5',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  viewAllLink: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    padding: '1rem',
    textAlign: 'left',
    borderBottom: '1px solid #e5e7eb',
    color: '#6b7280',
    fontWeight: '600',
    fontSize: '0.875rem',
  },
  tableRow: {
    borderBottom: '1px solid #f3f4f6',
    '&:hover': {
      backgroundColor: '#f9fafb',
    },
  },
  
  courseCell: {
    padding: '1rem',
  },
  courseInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  courseAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    flexShrink: 0,
  },
  courseName: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.25rem',
  },
  courseDescription: {
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  
  progressCell: {
    padding: '1rem',
  },
  progressContainer: {
    minWidth: '120px',
  },
  progressInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  progressPercentage: {
    fontWeight: '600',
    color: '#1f2937',
  },
  progressBar: {
    height: '6px',
    background: '#e5e7eb',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  
  lessonsCell: {
    padding: '1rem',
    textAlign: 'center',
  },
  lessonsCount: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
  },
  lessonsCompleted: {
    color: '#10b981',
  },
  lessonsSeparator: {
    color: '#9ca3af',
    margin: '0 0.25rem',
  },
  lessonsTotal: {
    color: '#6b7280',
  },
  lessonsLabel: {
    color: '#9ca3af',
    fontSize: '0.75rem',
    marginTop: '0.25rem',
  },
  
  dateCell: {
    padding: '1rem',
  },
  dateWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  dateIcon: {
    fontSize: '1.25rem',
    flexShrink: 0,
  },
  dateText: {
    fontWeight: '500',
    color: '#1f2937',
    fontSize: '0.875rem',
  },
  daysAgo: {
    color: '#9ca3af',
    fontSize: '0.75rem',
    marginTop: '0.125rem',
  },
  activityStatus: {
    color: '#9ca3af',
    fontSize: '0.75rem',
    marginTop: '0.125rem',
  },
  
  statusCell: {
    padding: '1rem',
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '500',
    display: 'inline-block',
  },
  statusCompleted: {
    background: '#d1fae5',
    color: '#065f46',
  },
  statusInProgress: {
    background: '#fef3c7',
    color: '#92400e',
  },
  
  actionsCell: {
    padding: '1rem',
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  viewButton: {
    background: '#4f46e5',
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  certificateButton: {
    background: '#10b981',
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  
  emptyTable: {
    textAlign: 'center',
    padding: '3rem',
  },
  emptyTableIcon: {
    color: '#9ca3af',
    marginBottom: '1rem',
  },
  emptyTableTitle: {
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  emptyTableText: {
    color: '#6b7280',
    marginBottom: '1.5rem',
  },
  
  enrollmentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  
  enrollmentCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1.5rem',
    transition: 'all 0.2s',
  },
  enrollmentHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  },
  enrollmentAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '1.25rem',
    flexShrink: 0,
  },
  enrollmentTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.25rem',
  },
  enrollmentMeta: {
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  
  enrollmentProgress: {
    marginBottom: '1rem',
  },
  enrollmentProgressBar: {
    height: '6px',
    background: '#e5e7eb',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  enrollmentProgressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
    borderRadius: '3px',
  },
  enrollmentProgressText: {
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  
  enrollmentStatus: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  enrollmentStatusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  completionDate: {
    color: '#9ca3af',
    fontSize: '0.75rem',
  },
  
  enrollmentActions: {
    display: 'flex',
  },
  continueButton: {
    flex: 1,
    background: '#4f46e5',
    color: 'white',
    textDecoration: 'none',
    padding: '0.75rem',
    borderRadius: '6px',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  emptyEnrollments: {
    textAlign: 'center',
    padding: '3rem',
  },
  emptyEnrollmentsIcon: {
    color: '#9ca3af',
    marginBottom: '1rem',
  },
  emptyEnrollmentsTitle: {
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  emptyEnrollmentsText: {
    color: '#6b7280',
    marginBottom: '1.5rem',
  },
  
  activityStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  activityStat: {
    textAlign: 'center',
    padding: '1rem',
    background: '#f9fafb',
    borderRadius: '8px',
  },
  activityStatNumber: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.25rem',
  },
  activityStatLabel: {
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  
  activityEmpty: {
    textAlign: 'center',
    padding: '3rem',
  },
  activityEmptyIcon: {
    color: '#9ca3af',
    marginBottom: '1rem',
  },
  activityEmptyTitle: {
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  activityEmptyText: {
    color: '#6b7280',
    maxWidth: '500px',
    margin: '0 auto',
    lineHeight: '1.6',
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
  },
};

// Add global styles
const globalStyles = document.createElement('style');
globalStyles.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .tab-button:hover:not(.tab-button-active) {
    background: #f3f4f6;
    color: #374151;
  }
  
  .enrollment-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .view-button:hover {
    background: #4338ca;
  }
  
  .certificate-button:hover {
    background: #059669;
  }
  
  .continue-button:hover {
    background: #4338ca;
  }
  
  .certificates-button:hover {
    background: #4f46e5;
    color: white;
  }
`;
document.head.appendChild(globalStyles);

export default ProgressTracking;
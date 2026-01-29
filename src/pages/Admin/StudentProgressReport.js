import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../../services/api';
import { FiUsers, FiTrendingUp, FiAward, FiSearch, FiBook, FiAlertCircle, FiChevronDown, FiChevronUp, FiMail, FiCalendar, FiActivity } from 'react-icons/fi';

const StudentProgressReport = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseReports, setCourseReports] = useState(null);
  const [expandedCourses, setExpandedCourses] = useState({});

  useEffect(() => {
    fetchProgressReports();
  }, []);

  const fetchProgressReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsAPI.getStudentProgressReports();
      setReports(response.data.course_reports || []);
      setCourseReports(response.data);
    } catch (err) {
      setError('Failed to load progress reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCourseExpansion = (courseId) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(selectedCourse?.course_id === course.course_id ? null : course);
    if (selectedCourse?.course_id === course.course_id) {
      toggleCourseExpansion(course.course_id);
    }
  };

  const getCompletionRateColor = (rate) => {
    if (rate >= 80) return '#10b981';
    if (rate >= 50) return '#f59e0b';
    return '#dc2626';
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return '#10b981';
    if (progress >= 50) return '#3b82f6';
    return '#f59e0b';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter students based on search term for selected course
  const filteredStudents = selectedCourse
    ? (selectedCourse.student_progress || []).filter(student =>
        student.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading progress reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <FiAlertCircle size={48} style={styles.errorIcon} />
        <h3 style={styles.errorTitle}>Error Loading Reports</h3>
        <p style={styles.errorMessage}>{error}</p>
        <button 
          onClick={fetchProgressReports}
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
          <h1 style={styles.title}>Student Progress Reports</h1>
          <p style={styles.subtitle}>Track student performance across all your courses</p>
        </div>
        <div style={styles.headerStats}>
          <div style={styles.statBadge}>
            <FiUsers size={16} />
            <span>{reports.length} Courses</span>
          </div>
        </div>
      </div>

      {/* Overall Stats */}
      {courseReports && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <FiUsers size={24} />
            </div>
            <div style={styles.statContent}>
              <div style={styles.statNumber}>{courseReports.summary?.total_students || 0}</div>
              <div style={styles.statLabel}>Total Students</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'}}>
              <FiBook size={24} />
            </div>
            <div style={styles.statContent}>
              <div style={styles.statNumber}>{courseReports.summary?.total_courses || 0}</div>
              <div style={styles.statLabel}>Total Courses</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'}}>
              <FiTrendingUp size={24} />
            </div>
            <div style={styles.statContent}>
              <div style={styles.statNumber}>{courseReports.summary?.total_enrollments || 0}</div>
              <div style={styles.statLabel}>Total Enrollments</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)'}}>
              <FiAward size={24} />
            </div>
            <div style={styles.statContent}>
              <div style={styles.statNumber}>{courseReports.summary?.total_certificates || 0}</div>
              <div style={styles.statLabel}>Certificates Issued</div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div style={styles.searchCard}>
        <div style={styles.searchContainer}>
          <FiSearch style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search students by name, username, or email..."
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
        {selectedCourse && (
          <div style={styles.selectedCourseInfo}>
            <span style={styles.selectedCourseText}>
              Showing students for: <strong>{selectedCourse.course_title}</strong>
            </span>
            <button
              onClick={() => setSelectedCourse(null)}
              style={styles.clearFilterButton}
            >
              Clear Filter
            </button>
          </div>
        )}
      </div>

      {/* Course Reports */}
      <div style={styles.mainCard}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Course Performance</h2>
          <span style={styles.cardBadge}>{reports.length} courses</span>
        </div>
        
        {reports.length > 0 ? (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Course</th>
                  <th style={styles.tableHeader}>Students</th>
                  <th style={styles.tableHeader}>Completed</th>
                  <th style={styles.tableHeader}>Completion Rate</th>
                  <th style={styles.tableHeader}>Avg Progress</th>
                  <th style={styles.tableHeader}>Avg Quiz Score</th>
                  <th style={styles.tableHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <React.Fragment key={report.course_id}>
                    <tr 
                      style={{
                        ...styles.tableRow,
                        cursor: 'pointer',
                        backgroundColor: selectedCourse?.course_id === report.course_id ? '#f0f9ff' : 'white'
                      }}
                      onClick={() => handleSelectCourse(report)}
                    >
                      <td style={styles.courseCell}>
                        <div style={styles.courseInfo}>
                          <div style={styles.courseAvatar}>
                            {report.course_title?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <div style={styles.courseName}>{report.course_title}</div>
                            <div style={styles.courseMeta}>
                              <span style={styles.courseStudents}>
                                <FiUsers size={12} /> {report.total_students} students
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.numberCell}>
                        <div style={styles.studentCount}>{report.total_students}</div>
                      </td>
                      <td style={styles.numberCell}>
                        <div style={styles.completedCount}>
                          {report.completed_students}
                          <span style={styles.completedPercent}>
                            ({report.total_students ? Math.round((report.completed_students / report.total_students) * 100) : 0}%)
                          </span>
                        </div>
                      </td>
                      <td style={styles.progressCell}>
                        <div style={styles.progressContainer}>
                          <div style={styles.progressInfo}>
                            <span style={styles.progressPercentage}>
                              {report.completion_rate?.toFixed(1) || 0}%
                            </span>
                            <div style={styles.progressBar}>
                              <div 
                                style={{
                                  ...styles.progressBarFill,
                                  width: `${report.completion_rate || 0}%`,
                                  background: getCompletionRateColor(report.completion_rate || 0)
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.progressCell}>
                        <div style={styles.progressContainer}>
                          <div style={styles.progressInfo}>
                            <span style={styles.progressPercentage}>
                              {report.average_progress?.toFixed(1) || 0}%
                            </span>
                            <div style={styles.progressBar}>
                              <div 
                                style={{
                                  ...styles.progressBarFill,
                                  width: `${report.average_progress || 0}%`,
                                  background: getProgressColor(report.average_progress || 0)
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.quizCell}>
                        {report.average_quiz_score ? (
                          <div style={styles.quizScore}>
                            <span style={styles.quizScoreValue}>{report.average_quiz_score.toFixed(1)}%</span>
                          </div>
                        ) : (
                          <span style={styles.noData}>N/A</span>
                        )}
                      </td>
                      <td style={styles.actionsCell}>
                        <button
                          style={styles.viewStudentsButton}
                          onClick={() => handleSelectCourse(report)}
                          title="View Students"
                        >
                          {selectedCourse?.course_id === report.course_id ? 'Hide' : 'View'} Students
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Student List */}
                    {selectedCourse?.course_id === report.course_id && (
                      <tr>
                        <td colSpan="7" style={styles.expandedCell}>
                          <div style={styles.studentListSection}>
                            <div style={styles.studentListHeader}>
                              <h3 style={styles.studentListTitle}>
                                Students in {report.course_title}
                                <span style={styles.studentCountBadge}>
                                  {filteredStudents.length} students
                                </span>
                              </h3>
                              <div style={styles.studentSearchInfo}>
                                <span style={styles.studentSearchText}>
                                  {searchTerm ? `Searching: "${searchTerm}"` : 'All students'}
                                </span>
                              </div>
                            </div>
                            
                            {filteredStudents.length > 0 ? (
                              <div style={styles.studentsTableContainer}>
                                <table style={styles.studentsTable}>
                                  <thead>
                                    <tr>
                                      <th style={styles.studentTableHeader}>Student</th>
                                      <th style={styles.studentTableHeader}>Enrollment Date</th>
                                      <th style={styles.studentTableHeader}>Progress</th>
                                      <th style={styles.studentTableHeader}>Status</th>
                                      <th style={styles.studentTableHeader}>Quiz Score</th>
                                      <th style={styles.studentTableHeader}>Last Activity</th>
                                      <th style={styles.studentTableHeader}>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {filteredStudents.map((student) => (
                                      <tr key={student.student_id} style={styles.studentTableRow}>
                                        <td style={styles.studentCell}>
                                          <div style={styles.studentInfo}>
                                            <div style={styles.studentAvatar}>
                                              {student.student_name?.charAt(0) || 'S'}
                                            </div>
                                            <div>
                                              <div style={styles.studentName}>{student.student_name}</div>
                                              <div style={styles.studentDetails}>
                                                <span style={styles.studentUsername}>@{student.username}</span>
                                                <span style={styles.studentEmail}>
                                                  <FiMail size={10} /> {student.email}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        </td>
                                        <td style={styles.dateCell}>
                                          <div style={styles.dateWrapper}>
                                            <div style={styles.dateIcon}>📅</div>
                                            <div style={styles.dateText}>
                                              {formatDate(student.enrollment_date)}
                                            </div>
                                          </div>
                                        </td>
                                        <td style={styles.progressCell}>
                                          <div style={styles.studentProgress}>
                                            <div style={styles.progressInfo}>
                                              <span style={styles.progressPercentage}>
                                                {student.progress_percentage?.toFixed(1) || 0}%
                                              </span>
                                              <div style={styles.progressBar}>
                                                <div 
                                                  style={{
                                                    ...styles.progressBarFill,
                                                    width: `${student.progress_percentage || 0}%`,
                                                    background: getProgressColor(student.progress_percentage || 0)
                                                  }}
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        </td>
                                        <td style={styles.statusCell}>
                                          <span style={{
                                            ...styles.statusBadge,
                                            ...(student.course_completed ? styles.statusCompleted : styles.statusInProgress)
                                          }}>
                                            {student.course_completed ? 'Completed' : 'In Progress'}
                                          </span>
                                          {student.course_completed && student.completion_date && (
                                            <div style={styles.completionDate}>
                                              {formatDate(student.completion_date)}
                                            </div>
                                          )}
                                        </td>
                                        <td style={styles.quizCell}>
                                          {student.avg_quiz_score ? (
                                            <div style={styles.quizScore}>
                                              <span style={styles.quizScoreValue}>{student.avg_quiz_score.toFixed(1)}%</span>
                                            </div>
                                          ) : (
                                            <span style={styles.noData}>N/A</span>
                                          )}
                                        </td>
                                        <td style={styles.dateCell}>
                                          <div style={styles.dateWrapper}>
                                            <div style={styles.dateIcon}>🕒</div>
                                            <div>
                                              <div style={styles.dateText}>{formatDateTime(student.last_activity)}</div>
                                              <div style={styles.activityStatus}>
                                                {student.last_activity ? 'Active' : 'No activity'}
                                              </div>
                                            </div>
                                          </div>
                                        </td>
                                        <td style={styles.actionsCell}>
                                          <Link
                                            to={`/student-progress-reports/${student.student_id}`}
                                            style={styles.viewDetailsButton}
                                            title="View Detailed Report"
                                          >
                                            View Details
                                          </Link>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div style={styles.noStudentsFound}>
                                <FiUsers size={48} style={styles.noStudentsIcon} />
                                <h4 style={styles.noStudentsTitle}>No Students Found</h4>
                                <p style={styles.noStudentsText}>
                                  {searchTerm 
                                    ? 'No students match your search criteria. Try a different search term.'
                                    : 'No students enrolled in this course yet.'}
                                </p>
                                {searchTerm && (
                                  <button 
                                    onClick={() => setSearchTerm('')}
                                    style={styles.clearSearchButton}
                                  >
                                    Clear Search
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={styles.emptyState}>
            <FiBook size={64} style={styles.emptyStateIcon} />
            <h3 style={styles.emptyStateTitle}>No Course Reports Available</h3>
            <p style={styles.emptyStateText}>
              You don't have any courses with student progress data yet.
            </p>
            <Link to="/instructor/courses" style={styles.primaryButton}>
              Create Your First Course
            </Link>
          </div>
        )}
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
    marginBottom: '1rem',
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
  selectedCourseInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb',
  },
  selectedCourseText: {
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  clearFilterButton: {
    background: 'none',
    border: '1px solid #d1d5db',
    color: '#374151',
    padding: '0.375rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  
  mainCard: {
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
    fontSize: '1.5rem',
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
    whiteSpace: 'nowrap',
  },
  tableRow: {
    borderBottom: '1px solid #f3f4f6',
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
  courseMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  courseStudents: {
    color: '#6b7280',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  
  numberCell: {
    padding: '1rem',
  },
  studentCount: {
    fontWeight: '600',
    color: '#1f2937',
    fontSize: '1.125rem',
  },
  completedCount: {
    fontWeight: '600',
    color: '#10b981',
    fontSize: '1.125rem',
  },
  completedPercent: {
    color: '#9ca3af',
    fontSize: '0.875rem',
    marginLeft: '0.25rem',
  },
  
  progressCell: {
    padding: '1rem',
    minWidth: '120px',
  },
  progressContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  progressInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  progressPercentage: {
    fontWeight: '600',
    color: '#1f2937',
    fontSize: '0.875rem',
    minWidth: '40px',
  },
  progressBar: {
    flex: 1,
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
  
  quizCell: {
    padding: '1rem',
  },
  quizScore: {
    display: 'flex',
    alignItems: 'center',
  },
  quizScoreValue: {
    fontWeight: '600',
    color: '#1f2937',
  },
  noData: {
    color: '#9ca3af',
    fontSize: '0.875rem',
    fontStyle: 'italic',
  },
  
  actionsCell: {
    padding: '1rem',
  },
  viewStudentsButton: {
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  
  expandedCell: {
    backgroundColor: '#f9fafb',
    padding: '0',
  },
  
  studentListSection: {
    padding: '1.5rem',
  },
  studentListHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  studentListTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  studentCountBadge: {
    background: '#e0e7ff',
    color: '#4f46e5',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  studentSearchInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  studentSearchText: {
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  
  studentsTableContainer: {
    overflowX: 'auto',
  },
  studentsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    background: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  studentTableHeader: {
    padding: '1rem',
    textAlign: 'left',
    borderBottom: '1px solid #e5e7eb',
    color: '#6b7280',
    fontWeight: '600',
    fontSize: '0.875rem',
    whiteSpace: 'nowrap',
  },
  studentTableRow: {
    borderBottom: '1px solid #f3f4f6',
  },
  
  studentCell: {
    padding: '1rem',
  },
  studentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  studentAvatar: {
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
  studentName: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.25rem',
  },
  studentDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
  },
  studentUsername: {
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  studentEmail: {
    color: '#9ca3af',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  
  dateCell: {
    padding: '1rem',
    minWidth: '120px',
  },
  dateWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  dateIcon: {
    fontSize: '1rem',
    flexShrink: 0,
  },
  dateText: {
    fontSize: '0.875rem',
    color: '#374151',
  },
  activityStatus: {
    color: '#9ca3af',
    fontSize: '0.75rem',
    marginTop: '0.125rem',
  },
  
  studentProgress: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
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
  completionDate: {
    color: '#9ca3af',
    fontSize: '0.75rem',
    marginTop: '0.25rem',
  },
  
  viewDetailsButton: {
    background: '#4f46e5',
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    display: 'inline-block',
  },
  
  noStudentsFound: {
    textAlign: 'center',
    padding: '3rem',
  },
  noStudentsIcon: {
    color: '#9ca3af',
    marginBottom: '1rem',
  },
  noStudentsTitle: {
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  noStudentsText: {
    color: '#6b7280',
    maxWidth: '500px',
    margin: '0 auto 1.5rem',
    lineHeight: '1.6',
  },
  
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
  },
  emptyStateIcon: {
    color: '#9ca3af',
    marginBottom: '1rem',
  },
  emptyStateTitle: {
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  emptyStateText: {
    color: '#6b7280',
    marginBottom: '1.5rem',
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
  
  .search-input:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
  
  .clear-search-button:hover {
    color: #374151;
  }
  
  .clear-filter-button:hover {
    background: #f9fafb;
  }
  
  .view-students-button:hover {
    background: #4338ca;
  }
  
  .view-details-button:hover {
    background: #4338ca;
  }
  
  .primary-button:hover {
    background: #4338ca;
  }
  
  .table-row:hover {
    background-color: #f9fafb;
  }
`;
document.head.appendChild(globalStyles);

export default StudentProgressReport;
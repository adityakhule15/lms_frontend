import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiBook, FiTrendingUp, FiDollarSign, FiAward, FiActivity, FiAlertCircle, FiEye, FiBarChart2 } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import { dashboardAPI } from '../../services/api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const InstructorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardAPI.getInstructorDashboard();
      setDashboardData(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <FiAlertCircle size={48} style={styles.errorIcon} />
        <h3 style={styles.errorTitle}>Error Loading Dashboard</h3>
        <p style={styles.errorMessage}>{error}</p>
        <button 
          onClick={fetchDashboardData}
          style={styles.primaryButton}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { instructor, overall_stats, course_statistics, recent_activity } = dashboardData;

  // Prepare chart data
  const courseChartData = {
    labels: course_statistics?.map(course => course.course_title) || [],
    datasets: [
      {
        label: 'Total Students',
        data: course_statistics?.map(course => course.total_students) || [],
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderRadius: 4,
      },
      {
        label: 'Completed Students',
        data: course_statistics?.map(course => course.completed_students) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 4,
      },
    ],
  };

  const progressChartData = {
    labels: course_statistics?.map(course => course.course_title) || [],
    datasets: [
      {
        label: 'Average Progress (%)',
        data: course_statistics?.map(course => course.average_progress) || [],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 4,
      },
    ],
  };

  const revenueChartData = {
    labels: course_statistics?.map(course => course.course_title) || [],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: course_statistics?.map(course => course.total_revenue || 0) || [],
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderRadius: 4,
      },
    ],
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Welcome back, {instructor.first_name || instructor.username}!</h1>
          <p style={styles.subtitle}>Track your courses, students, and revenue</p>
        </div>
        {/* <Link to="/instructor/courses/create" style={styles.createCourseButton}>
          Create New Course
        </Link> */}
      </div>

      {/* Stats Overview */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <FiBook size={24} />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{overall_stats.total_courses || 0}</div>
            <div style={styles.statLabel}>Total Courses</div>
            <div style={styles.statSubtext}>
              {overall_stats.published_courses || 0} published • {overall_stats.draft_courses || 0} draft
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'}}>
            <FiUsers size={24} />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{overall_stats.total_students || 0}</div>
            <div style={styles.statLabel}>Total Students</div>
            <div style={styles.statSubtext}>
              {overall_stats.active_students || 0} active • {overall_stats.new_students || 0} new this month
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'}}>
            <FiAward size={24} />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{overall_stats.recent_completions || 0}</div>
            <div style={styles.statLabel}>Recent Completions</div>
            <div style={styles.statSubtext}>Last 30 days</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)'}}>
            <FaRupeeSign size={20} />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{formatCurrency(overall_stats.total_revenue)}</div>
            <div style={styles.statLabel}>Total Revenue</div>
            <div style={styles.statSubtext}>
              {formatCurrency(overall_stats.monthly_revenue)} this month
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Student Enrollment</h3>
            <span style={styles.chartBadge}>by course</span>
          </div>
          <div style={styles.chartContainer}>
            <Bar
              data={courseChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      padding: 20,
                      usePointStyle: true,
                    }
                  },
                },
                scales: {
                  x: {
                    grid: {
                      display: false,
                    }
                  },
                  y: {
                    beginAtZero: true,
                    grid: {
                      borderDash: [5, 5],
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Average Progress</h3>
            <span style={styles.chartBadge}>by course</span>
          </div>
          <div style={styles.chartContainer}>
            <Bar
              data={progressChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      padding: 20,
                      usePointStyle: true,
                    }
                  },
                },
                scales: {
                  x: {
                    grid: {
                      display: false,
                    }
                  },
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: function(value) {
                        return value + '%';
                      }
                    },
                    grid: {
                      borderDash: [5, 5],
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Course Statistics Table */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>Course Performance</h2>
          <Link to="/instructor/courses" style={styles.manageCoursesButton}>
            Manage All Courses
          </Link>
        </div>
        
        {course_statistics && course_statistics.length > 0 ? (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeaderCell}>Course</th>
                  <th style={styles.tableHeaderCell}>Students</th>
                  <th style={styles.tableHeaderCell}>Completed</th>
                  <th style={styles.tableHeaderCell}>Avg Progress</th>
                  <th style={styles.tableHeaderCell}>Avg Rating</th>
                  <th style={styles.tableHeaderCell}>Revenue</th>
                  <th style={styles.tableHeaderCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {course_statistics.map((course) => (
                  <tr key={course.course_id} style={styles.tableRow}>
                    <td style={styles.courseCell}>
                      <div style={styles.courseInfo}>
                        <div style={styles.courseAvatar}>
                          {course.course_title?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <div style={styles.courseName}>{course.course_title}</div>
                          <div style={styles.courseStatus}>
                            {course.is_published ? 'Published' : 'Draft'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.numberCell}>
                      <div style={styles.studentCount}>
                        {course.total_students}
                      </div>
                    </td>
                    <td style={styles.numberCell}>
                      <div style={styles.completionCount}>
                        {course.completed_students}
                        <span style={styles.completionPercent}>
                          ({course.total_students ? Math.round((course.completed_students / course.total_students) * 100) : 0}%)
                        </span>
                      </div>
                    </td>
                    <td style={styles.progressCell}>
                      <div style={styles.progressBarContainer}>
                        <div 
                          style={{
                            ...styles.progressBar,
                            width: `${course.average_progress || 0}%`,
                            background: course.average_progress === 100 
                              ? 'linear-gradient(90deg, #10b981, #34d399)' 
                              : 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                          }}
                        />
                      </div>
                      <span style={styles.progressText}>
                        {course.average_progress?.toFixed(1) || 0}%
                      </span>
                    </td>
                    <td style={styles.ratingCell}>
                      {course.average_rating ? (
                        <div style={styles.ratingContainer}>
                          <span style={styles.ratingStar}>★</span>
                          <span style={styles.ratingValue}>{course.average_rating.toFixed(1)}</span>
                          <span style={styles.ratingCount}>({course.total_ratings || 0})</span>
                        </div>
                      ) : (
                        <span style={styles.noRating}>No ratings</span>
                      )}
                    </td>
                    <td style={styles.revenueCell}>
                      <div style={styles.revenueAmount}>
                        {formatCurrency(course.total_revenue)}
                      </div>
                    </td>
                    <td style={styles.actionsCell}>
                      <div style={styles.actionButtons}>
                        <Link
                          to={`/courses/${course.course_id}`}
                          style={styles.viewButton}
                          title="View Course"
                        >
                          <FiEye size={16} />
                        </Link>
                        <Link
                          to={`/courses/${course.course_id}/analytics`}
                          style={styles.analyticsButton}
                          title="View Analytics"
                        >
                          <FiBarChart2 size={16} />
                        </Link>
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
            <h3 style={styles.emptyTableTitle}>No Courses Created</h3>
            <p style={styles.emptyTableText}>
              Create your first course to start earning and teaching students.
            </p>
            <Link to="/instructor/courses/create" style={styles.primaryButton}>
              Create Your First Course
            </Link>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div style={styles.activityCard}>
        <div style={styles.activityHeader}>
          <h2 style={styles.activityTitle}>Recent Student Activity</h2>
          <FiActivity size={20} />
        </div>
        
        {recent_activity && recent_activity.length > 0 ? (
          <div style={styles.activityList}>
            {recent_activity.slice(0, 10).map((activity, index) => (
              <div key={index} style={styles.activityItem}>
                <div style={styles.activityAvatar}>
                  {activity.student_name?.charAt(0) || 'S'}
                </div>
                <div style={styles.activityContent}>
                  <div style={styles.activityInfo}>
                    <span style={styles.activityStudent}>{activity.student_name}</span>
                    <span style={styles.activityAction}>
                      {activity.type === 'lesson_completion' ? 'completed a lesson' : 'attempted a quiz'}
                    </span>
                    <span style={styles.activityCourse}>{activity.course}</span>
                  </div>
                  <div style={styles.activityMeta}>
                    <span style={styles.activityDate}>
                      {new Date(activity.completed_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                <div style={styles.activityStatus}>
                  {activity.type === 'lesson_completion' ? (
                    <span style={styles.statusCompleted}>✓</span>
                  ) : (
                    <span style={styles.statusQuiz}>?</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyActivity}>
            <FiActivity size={48} style={styles.emptyActivityIcon} />
            <h3 style={styles.emptyActivityTitle}>No Recent Activity</h3>
            <p style={styles.emptyActivityText}>
              Student activity will appear here as they engage with your courses.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    maxWidth: '1400px',
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
  createCourseButton: {
    background: '#4f46e5',
    color: 'white',
    textDecoration: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontWeight: '600',
    transition: 'background-color 0.2s',
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
  
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  chartCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  chartTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
  },
  chartBadge: {
    background: '#e0e7ff',
    color: '#4f46e5',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  chartContainer: {
    height: '300px',
    position: 'relative',
  },
  
  tableCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: '2rem',
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  tableTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
  },
  manageCoursesButton: {
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
  tableHeaderCell: {
    padding: '1rem',
    textAlign: 'left',
    borderBottom: '1px solid #e5e7eb',
    color: '#6b7280',
    fontWeight: '600',
    fontSize: '0.875rem',
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
  courseStatus: {
    background: '#f3f4f6',
    color: '#6b7280',
    padding: '0.125rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    display: 'inline-block',
  },
  numberCell: {
    padding: '1rem',
    fontWeight: '600',
    color: '#1f2937',
  },
  studentCount: {
    fontSize: '1.125rem',
  },
  completionCount: {
    fontSize: '1.125rem',
  },
  completionPercent: {
    color: '#9ca3af',
    fontSize: '0.875rem',
    marginLeft: '0.25rem',
  },
  progressCell: {
    padding: '1rem',
    minWidth: '120px',
  },
  progressBarContainer: {
    height: '8px',
    background: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  progressBar: {
    height: '100%',
    borderRadius: '4px',
  },
  progressText: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#6b7280',
  },
  ratingCell: {
    padding: '1rem',
  },
  ratingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  ratingStar: {
    color: '#f59e0b',
  },
  ratingValue: {
    fontWeight: '600',
    color: '#1f2937',
  },
  ratingCount: {
    color: '#9ca3af',
    fontSize: '0.75rem',
  },
  noRating: {
    color: '#9ca3af',
    fontSize: '0.875rem',
    fontStyle: 'italic',
  },
  revenueCell: {
    padding: '1rem',
    fontWeight: '600',
    color: '#1f2937',
  },
  revenueAmount: {
    fontSize: '1rem',
  },
  actionsCell: {
    padding: '1rem',
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  viewButton: {
    width: '32px',
    height: '32px',
    background: '#e0e7ff',
    color: '#4f46e5',
    border: 'none',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background-color 0.2s',
  },
  analyticsButton: {
    width: '32px',
    height: '32px',
    background: '#f0fdf4',
    color: '#10b981',
    border: 'none',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background-color 0.2s',
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
  
  activityCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  activityHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  activityTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    transition: 'background-color 0.2s',
  },
  activityAvatar: {
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
  activityContent: {
    flex: 1,
  },
  activityInfo: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.25rem',
  },
  activityStudent: {
    fontWeight: '600',
    color: '#1f2937',
  },
  activityAction: {
    color: '#6b7280',
  },
  activityCourse: {
    color: '#4f46e5',
    fontWeight: '500',
    fontSize: '0.875rem',
  },
  activityMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  activityDate: {
    color: '#9ca3af',
    fontSize: '0.875rem',
  },
  activityStatus: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statusCompleted: {
    width: '20px',
    height: '20px',
    background: '#10b981',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
  },
  statusQuiz: {
    width: '20px',
    height: '20px',
    background: '#f59e0b',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
  },
  
  emptyActivity: {
    textAlign: 'center',
    padding: '3rem',
  },
  emptyActivityIcon: {
    color: '#9ca3af',
    marginBottom: '1rem',
  },
  emptyActivityTitle: {
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  emptyActivityText: {
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
    border: 'none',
    cursor: 'pointer',
  },
};

// Add global styles for animations and hover effects
const globalStyles = document.createElement('style');
globalStyles.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
  }
  
  .create-course-button:hover {
    background: #4338ca;
  }
  
  .manage-courses-button:hover {
    text-decoration: underline;
  }
  
  .view-button:hover {
    background: #c7d2fe;
  }
  
  .analytics-button:hover {
    background: #bbf7d0;
  }
  
  .activity-item:hover {
    background: #f9fafb;
  }
`;
document.head.appendChild(globalStyles);

export default InstructorDashboard;
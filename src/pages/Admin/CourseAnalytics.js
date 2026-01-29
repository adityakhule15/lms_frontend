import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { analyticsAPI } from '../../services/api';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
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
import { FiUsers, FiTrendingUp, FiClock, FiAward, FiBook, FiBarChart2, FiAlertCircle, FiActivity, FiTarget } from 'react-icons/fi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const CourseAnalytics = () => {
  const { id } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsAPI.getCourseAnalytics(id);
      setAnalytics(response.data);
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (hours) => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} min`;
    }
    return `${hours.toFixed(1)} hours`;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading course analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <FiAlertCircle size={48} style={styles.errorIcon} />
        <h3 style={styles.errorTitle}>Error Loading Analytics</h3>
        <p style={styles.errorMessage}>{error}</p>
        <button 
          onClick={fetchAnalytics}
          style={styles.primaryButton}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div style={styles.emptyState}>
        <FiBarChart2 size={64} style={styles.emptyStateIcon} />
        <h2 style={styles.emptyStateTitle}>No Analytics Data Available</h2>
        <p style={styles.emptyStateText}>
          Analytics data will appear as students engage with this course.
        </p>
      </div>
    );
  }

  const { course, progress_distribution, engagement, time_analysis, quiz_performance, recent_completions } = analytics;

  // Prepare chart data
  const progressChartData = {
    labels: ['0-25%', '26-50%', '51-75%', '76-99%', '100%'],
    datasets: [
      {
        label: 'Number of Students',
        data: [
          progress_distribution?.['0-25%'] || 0,
          progress_distribution?.['26-50%'] || 0,
          progress_distribution?.['51-75%'] || 0,
          progress_distribution?.['76-99%'] || 0,
          progress_distribution?.['100%'] || 0,
        ],
        backgroundColor: [
          '#ef4444', // Red
          '#f59e0b', // Amber
          '#10b981', // Emerald
          '#3b82f6', // Blue
          '#8b5cf6', // Violet
        ],
        borderColor: [
          '#dc2626',
          '#d97706',
          '#059669',
          '#2563eb',
          '#7c3aed',
        ],
        borderWidth: 1,
      },
    ],
  };

  const engagementChartData = {
    labels: ['Active', 'Inactive'],
    datasets: [
      {
        data: [engagement?.active_students || 0, engagement?.inactive_students || 0],
        backgroundColor: ['#10b981', '#6b7280'],
        borderColor: ['#059669', '#4b5563'],
        borderWidth: 1,
      },
    ],
  };

  const quizChartData = {
    labels: quiz_performance?.map(quiz => quiz.title) || [],
    datasets: [
      {
        label: 'Average Score (%)',
        data: quiz_performance?.map(quiz => quiz.average_score) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 4,
      },
      {
        label: 'Pass Rate (%)',
        data: quiz_performance?.map(quiz => quiz.pass_rate) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 4,
      },
    ],
  };

  const progressDistributionTotal = Object.values(progress_distribution || {}).reduce((a, b) => a + b, 0);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Course Analytics</h1>
          <div style={styles.courseInfo}>
            <div style={styles.courseAvatar}>
              {course?.title?.charAt(0) || 'C'}
            </div>
            <div>
              <h2 style={styles.courseTitle}>{course?.title || 'Course'}</h2>
              <p style={styles.courseDescription}>
                {course?.description || 'No description available'}
              </p>
            </div>
          </div>
        </div>
        <div style={styles.headerStats}>
          <div style={styles.statBadge}>
            <FiUsers size={16} />
            <span>{course?.total_students || 0} Students</span>
          </div>
        </div>
      </div>

      {/* Course Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <FiUsers size={24} />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{course?.total_students || 0}</div>
            <div style={styles.statLabel}>Total Students</div>
            <div style={styles.statSubtext}>
              {course?.total_lessons || 0} lessons • {course?.category || 'Uncategorized'}
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'}}>
            <FiTrendingUp size={24} />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{course?.completion_rate || 0}%</div>
            <div style={styles.statLabel}>Completion Rate</div>
            <div style={styles.statSubtext}>
              {progress_distribution?.['100%'] || 0} students completed
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'}}>
            <FiActivity size={24} />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{engagement?.activity_rate || 0}%</div>
            <div style={styles.statLabel}>Engagement Rate</div>
            <div style={styles.statSubtext}>
              {engagement?.active_students || 0} active students
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)'}}>
            <FiAward size={24} />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{recent_completions || 0}</div>
            <div style={styles.statLabel}>Recent Completions</div>
            <div style={styles.statSubtext}>Last 30 days</div>
          </div>
        </div>
      </div>

      {/* Progress Distribution Chart */}
      <div style={styles.chartGrid}>
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Progress Distribution</h3>
            <span style={styles.chartBadge}>{progressDistributionTotal} students</span>
          </div>
          <div style={styles.chartContainer}>
            <Doughnut
              data={progressChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      padding: 20,
                      usePointStyle: true,
                      pointStyle: 'circle',
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} students (${percentage}%)`;
                      }
                    }
                  }
                },
                cutout: '60%',
              }}
            />
          </div>
          <div style={styles.chartLegend}>
            {progressChartData.labels.map((label, index) => (
              <div key={label} style={styles.legendItem}>
                <div style={{...styles.legendColor, backgroundColor: progressChartData.datasets[0].backgroundColor[index]}} />
                <span style={styles.legendLabel}>{label}</span>
                <span style={styles.legendValue}>
                  {progressChartData.datasets[0].data[index]} students
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Student Engagement</h3>
            <span style={styles.chartBadge}>{engagement?.total_students || 0} students</span>
          </div>
          <div style={styles.chartContainer}>
            <Pie
              data={engagementChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      padding: 20,
                      usePointStyle: true,
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} students (${percentage}%)`;
                      }
                    }
                  }
                },
              }}
            />
          </div>
          <div style={styles.engagementStats}>
            <div style={styles.engagementStat}>
              <div style={{...styles.engagementIcon, backgroundColor: '#10b981'}}>
                <FiActivity size={16} />
              </div>
              <div style={styles.engagementInfo}>
                <div style={styles.engagementNumber}>{engagement?.active_students || 0}</div>
                <div style={styles.engagementLabel}>Active Students</div>
              </div>
            </div>
            <div style={styles.engagementStat}>
              <div style={{...styles.engagementIcon, backgroundColor: '#6b7280'}}>
                <FiClock size={16} />
              </div>
              <div style={styles.engagementInfo}>
                <div style={styles.engagementNumber}>{engagement?.inactive_students || 0}</div>
                <div style={styles.engagementLabel}>Inactive Students</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time Analysis */}
      <div style={styles.timeAnalysisCard}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Time Analysis</h2>
          <span style={styles.cardBadge}>Learning Patterns</span>
        </div>
        <div style={styles.timeStatsGrid}>
          <div style={styles.timeStatCard}>
            <div style={styles.timeStatIcon}>
              <FiClock size={24} />
            </div>
            <div style={styles.timeStatContent}>
              <div style={styles.timeStatNumber}>
                {formatTime(time_analysis?.total_time_spent_hours || 0)}
              </div>
              <div style={styles.timeStatLabel}>Total Time Spent</div>
              <div style={styles.timeStatSubtext}>Across all students</div>
            </div>
          </div>
          
          <div style={styles.timeStatCard}>
            <div style={styles.timeStatIcon}>
              <FiUsers size={24} />
            </div>
            <div style={styles.timeStatContent}>
              <div style={styles.timeStatNumber}>
                {formatTime(time_analysis?.average_time_spent_hours || 0)}
              </div>
              <div style={styles.timeStatLabel}>Average per Student</div>
              <div style={styles.timeStatSubtext}>Hours spent per student</div>
            </div>
          </div>
          
          <div style={styles.timeStatCard}>
            <div style={styles.timeStatIcon}>
              <FiBook size={24} />
            </div>
            <div style={styles.timeStatContent}>
              <div style={styles.timeStatNumber}>
                {time_analysis?.average_time_per_lesson_minutes?.toFixed(0) || 0} min
              </div>
              <div style={styles.timeStatLabel}>Average per Lesson</div>
              <div style={styles.timeStatSubtext}>Minutes per lesson</div>
            </div>
          </div>
          
          <div style={styles.timeStatCard}>
            <div style={styles.timeStatIcon}>
              <FiTarget size={24} />
            </div>
            <div style={styles.timeStatContent}>
              <div style={styles.timeStatNumber}>
                {time_analysis?.completion_time_average_days?.toFixed(0) || 0} days
              </div>
              <div style={styles.timeStatLabel}>Avg Completion Time</div>
              <div style={styles.timeStatSubtext}>Days to complete course</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Performance */}
      {quiz_performance && quiz_performance.length > 0 && (
        <div style={styles.quizPerformanceCard}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Quiz Performance</h2>
            <span style={styles.cardBadge}>{quiz_performance.length} quizzes</span>
          </div>
          
          {/* Quiz Chart */}
          <div style={styles.quizChartContainer}>
            <Bar
              data={quizChartData}
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
          
          {/* Quiz Performance Details */}
          <div style={styles.quizTableContainer}>
            <table style={styles.quizTable}>
              <thead>
                <tr>
                  <th style={styles.quizTableHeader}>Quiz</th>
                  <th style={styles.quizTableHeader}>Total Attempts</th>
                  <th style={styles.quizTableHeader}>Average Score</th>
                  <th style={styles.quizTableHeader}>Pass Rate</th>
                  <th style={styles.quizTableHeader}>Passing Score</th>
                </tr>
              </thead>
              <tbody>
                {quiz_performance.map((quiz) => (
                  <tr key={quiz.quiz_id} style={styles.quizTableRow}>
                    <td style={styles.quizCell}>
                      <div style={styles.quizInfo}>
                        <div style={styles.quizAvatar}>
                          Q{quiz.order || '?'}
                        </div>
                        <div>
                          <div style={styles.quizTitle}>{quiz.title}</div>
                          <div style={styles.quizMeta}>
                            {quiz.total_questions || 0} questions
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.quizAttempts}>
                      <div style={styles.attemptsCount}>{quiz.total_attempts}</div>
                    </td>
                    <td style={styles.quizScore}>
                      <div style={styles.scoreContainer}>
                        <div style={styles.scoreBar}>
                          <div 
                            style={{
                              ...styles.scoreBarFill,
                              width: `${quiz.average_score || 0}%`,
                              background: quiz.average_score >= (quiz.passing_score || 70) 
                                ? 'linear-gradient(90deg, #10b981, #34d399)' 
                                : 'linear-gradient(90deg, #ef4444, #f87171)'
                            }}
                          />
                        </div>
                        <span style={styles.scoreValue}>{quiz.average_score?.toFixed(1) || 0}%</span>
                      </div>
                    </td>
                    <td style={styles.quizPassRate}>
                      <div style={styles.passRateContainer}>
                        <div style={styles.passRateBar}>
                          <div 
                            style={{
                              ...styles.passRateBarFill,
                              width: `${quiz.pass_rate || 0}%`,
                            }}
                          />
                        </div>
                        <span style={styles.passRateValue}>{quiz.pass_rate?.toFixed(1) || 0}%</span>
                      </div>
                    </td>
                    <td style={styles.passingScore}>
                      <div style={styles.passingScoreContainer}>
                        <span style={styles.passingScoreValue}>{quiz.passing_score || 70}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
  emptyStateTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  emptyStateText: {
    color: '#6b7280',
    maxWidth: '500px',
    margin: '0 auto',
    lineHeight: '1.6',
  },
  
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '1rem',
  },
  courseInfo: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  courseAvatar: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '1.5rem',
    flexShrink: 0,
  },
  courseTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.25rem',
  },
  courseDescription: {
    color: '#6b7280',
    fontSize: '0.875rem',
    lineHeight: '1.4',
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
  statSubtext: {
    color: '#9ca3af',
    fontSize: '0.75rem',
    marginTop: '0.125rem',
  },
  
  chartGrid: {
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
    height: '250px',
    position: 'relative',
    marginBottom: '1.5rem',
  },
  
  chartLegend: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem',
    borderRadius: '6px',
    transition: 'background-color 0.2s',
  },
  legendColor: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  legendLabel: {
    flex: 1,
    fontSize: '0.875rem',
    color: '#374151',
  },
  legendValue: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#1f2937',
  },
  
  engagementStats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  engagementStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    background: '#f9fafb',
    borderRadius: '8px',
  },
  engagementIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    flexShrink: 0,
  },
  engagementInfo: {
    flex: 1,
  },
  engagementNumber: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: '1',
  },
  engagementLabel: {
    color: '#6b7280',
    fontSize: '0.875rem',
    marginTop: '0.125rem',
  },
  
  timeAnalysisCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: '2rem',
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
  timeStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
  },
  timeStatCard: {
    background: '#f9fafb',
    borderRadius: '8px',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  timeStatIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  timeStatContent: {
    flex: 1,
  },
  timeStatNumber: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: '1',
  },
  timeStatLabel: {
    color: '#6b7280',
    fontSize: '0.875rem',
    marginTop: '0.25rem',
  },
  timeStatSubtext: {
    color: '#9ca3af',
    fontSize: '0.75rem',
    marginTop: '0.125rem',
  },
  
  quizPerformanceCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  quizChartContainer: {
    height: '300px',
    position: 'relative',
    marginBottom: '2rem',
  },
  quizTableContainer: {
    overflowX: 'auto',
  },
  quizTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  quizTableHeader: {
    padding: '1rem',
    textAlign: 'left',
    borderBottom: '1px solid #e5e7eb',
    color: '#6b7280',
    fontWeight: '600',
    fontSize: '0.875rem',
    whiteSpace: 'nowrap',
  },
  quizTableRow: {
    borderBottom: '1px solid #f3f4f6',
  },
  quizCell: {
    padding: '1rem',
  },
  quizInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  quizAvatar: {
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
  quizTitle: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.25rem',
  },
  quizMeta: {
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  quizAttempts: {
    padding: '1rem',
  },
  attemptsCount: {
    fontWeight: '600',
    color: '#1f2937',
  },
  quizScore: {
    padding: '1rem',
    minWidth: '120px',
  },
  scoreContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  scoreBar: {
    flex: 1,
    height: '6px',
    background: '#e5e7eb',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: '3px',
  },
  scoreValue: {
    fontWeight: '600',
    color: '#1f2937',
    fontSize: '0.875rem',
    minWidth: '40px',
  },
  quizPassRate: {
    padding: '1rem',
    minWidth: '120px',
  },
  passRateContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  passRateBar: {
    flex: 1,
    height: '6px',
    background: '#e5e7eb',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  passRateBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #10b981, #34d399)',
    borderRadius: '3px',
  },
  passRateValue: {
    fontWeight: '600',
    color: '#10b981',
    fontSize: '0.875rem',
    minWidth: '40px',
  },
  passingScore: {
    padding: '1rem',
  },
  passingScoreContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passingScoreValue: {
    background: '#f3f4f6',
    color: '#374151',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  
  primaryButton: {
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
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
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .time-stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .legend-item:hover {
    background-color: #f9fafb;
  }
  
  .quiz-table-row:hover {
    background-color: #f9fafb;
  }
  
  .primary-button:hover {
    background: #4338ca;
  }
  
  @media (max-width: 768px) {
    .chart-grid {
      grid-template-columns: 1fr;
    }
    
    .stats-grid {
      grid-template-columns: 1fr 1fr;
    }
    
    .engagement-stats {
      grid-template-columns: 1fr;
    }
    
    .time-stats-grid {
      grid-template-columns: 1fr;
    }
  }
  
  @media (max-width: 640px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
    
    .header {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .course-info {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;
document.head.appendChild(globalStyles);

export default CourseAnalytics;
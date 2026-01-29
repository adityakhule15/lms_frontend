import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { courseAPI, progressAPI } from '../../services/api';
import { FiClock, FiUsers, FiBook, FiAward, FiChevronRight, FiUser, FiAlertCircle } from 'react-icons/fi';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [unenrolling, setUnenrolling] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
    if (user?.role === 'student') {
      fetchCourseProgress();
    }
  }, [id, user]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await courseAPI.getCourse(id);
      setCourse(response.data);
    } catch (err) {
      setError('Failed to load course details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseProgress = async () => {
    try {
      const response = await progressAPI.getCourseProgress(id);
      setProgress(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await courseAPI.enroll(id);
      alert('Successfully enrolled in the course!');
      fetchCourseDetails();
      fetchCourseProgress();
    } catch (err) {
      if (err.response?.status === 200 || err.response?.data?.message?.includes('already enrolled')) {
        alert('Already enrolled in this course');
        // Update UI to show enrolled status
        setCourse(prev => prev ? { ...prev, is_enrolled: true } : null);
      } else {
        alert(err.response?.data?.message || 'Failed to enroll in the course');
      }
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    if (!window.confirm('Are you sure you want to unenroll from this course? All your progress will be lost.')) {
      return;
    }
    
    try {
      setUnenrolling(true);
      await courseAPI.unenroll(id);
      alert('Successfully unenrolled from the course');
      fetchCourseDetails();
      setProgress(null);
      navigate('/courses');
    } catch (err) {
      alert('Failed to unenroll from the course');
    } finally {
      setUnenrolling(false);
    }
  };

  const formatDuration = (hours) => {
    if (!hours) return 'N/A';
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    if (wholeHours === 0) {
      return `${minutes} min`;
    } else if (minutes === 0) {
      return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''}`;
    } else {
      return `${wholeHours} hr ${minutes} min`;
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading course details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <FiAlertCircle size={48} style={styles.errorIcon} />
        <h3 style={styles.errorTitle}>Error Loading Course</h3>
        <p style={styles.errorMessage}>{error}</p>
        <button 
          onClick={fetchCourseDetails}
          style={styles.primaryButton}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={styles.notFoundContainer}>
        <h2>Course Not Found</h2>
        <p>The course you're looking for doesn't exist or has been removed.</p>
        <Link to="/courses" style={styles.primaryButton}>
          Browse All Courses
        </Link>
      </div>
    );
  }

  const isInstructor = user?.role === 'instructor';
  const isEnrolled = course.is_enrolled;
  const isCourseInstructor = isInstructor && user?.id === course.instructor?.id;
  const showEnrollment = user?.role === 'student' && !isCourseInstructor;

  return (
    <div style={styles.container}>
      {/* Course Hero Section */}
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.breadcrumb}>
            <Link to="/courses" style={styles.breadcrumbLink}>Courses</Link>
            <FiChevronRight size={16} />
            <span style={styles.breadcrumbCurrent}>{course.title}</span>
          </div>
          
          <h1 style={styles.courseTitle}>{course.title}</h1>
          <p style={styles.courseDescription}>{course.description}</p>
          
          <div style={styles.courseMeta}>
            <div style={styles.metaItem}>
              <FiClock size={16} />
              <span>{formatDuration(course.duration_hours)}</span>
            </div>
            <div style={styles.metaItem}>
              <FiBook size={16} />
              <span>{course.total_lessons || 0} lessons</span>
            </div>
            <div style={styles.metaItem}>
              <FiUsers size={16} />
              <span>{course.total_students || 0} students</span>
            </div>
            {course.level && (
              <div style={styles.metaItem}>
                <FiAward size={16} />
                <span style={styles.levelBadge}>{course.level}</span>
              </div>
            )}
            {course.category && (
              <div style={styles.metaItem}>
                <span style={styles.categoryBadge}>{course.category}</span>
              </div>
            )}
          </div>
        </div>
        
        <div style={styles.heroActions}>
          <div style={styles.priceContainer}>
            {course.price ? (
              <div style={styles.priceTag}>
                <span style={styles.priceCurrency}>₹ </span>
                <span style={styles.priceAmount}>{course.price}</span>
              </div>
            ) : (
              <div style={styles.freeTag}>Free</div>
            )}
          </div>
          
          {showEnrollment && (
            <div style={styles.enrollmentActions}>
              {isEnrolled ? (
                <>
                  {progress?.enrollment?.exists && progress.progress_summary?.next_lesson && (
                    <Link
                      to={`/lessons/${progress.progress_summary.next_lesson.id}`}
                      style={styles.continueButton}
                    >
                      Continue Learning
                    </Link>
                  )}
                  <button 
                    onClick={handleUnenroll} 
                    style={styles.unenrollButton}
                    disabled={unenrolling}
                  >
                    {unenrolling ? 'Processing...' : 'Unenroll'}
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleEnroll} 
                  style={styles.enrollButton}
                  disabled={enrolling}
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              )}
            </div>
          )}
          
          {isCourseInstructor && (
            <div style={styles.instructorActions}>
              {/* <Link 
                to={`/instructor/courses/${id}/edit`}
                style={styles.editButton}
              >
                Edit Course
              </Link> */}
              <Link 
                to={`/courses/${id}/analytics`}
                style={styles.analyticsButton}
              >
                View Analytics
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Left Column */}
        <div style={styles.leftColumn}>
          {/* Progress Section */}
          {progress && progress.enrollment?.exists && (
            <div style={styles.progressCard}>
              <h3 style={styles.sectionTitle}>Your Progress</h3>
              <div style={styles.progressContent}>
                <div style={styles.progressStats}>
                  <div style={styles.progressPercentage}>
                    {progress.progress_summary?.progress_percentage?.toFixed(1) || 0}%
                  </div>
                  <div style={styles.progressText}>
                    <span>
                      {progress.progress_summary?.completed_lessons || 0} of {progress.progress_summary?.total_lessons || 0} lessons completed
                    </span>
                    {progress.progress_summary?.course_completed && (
                      <span style={styles.completedBadge}>🎉 Course Completed!</span>
                    )}
                  </div>
                </div>
                <div style={styles.progressBar}>
                  <div 
                    style={{
                      ...styles.progressBarFill,
                      width: `${progress.progress_summary?.progress_percentage || 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Instructor Section */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Instructor</h3>
            <div style={styles.instructorInfo}>
              <div style={styles.instructorAvatar}>
                {course.instructor?.first_name?.[0] || 'I'}
              </div>
              <div style={styles.instructorDetails}>
                <h4 style={styles.instructorName}>
                  {course.instructor?.first_name || 'Instructor'} {course.instructor?.last_name || ''}
                </h4>
                <p style={styles.instructorUsername}>@{course.instructor?.username || 'instructor'}</p>
                {course.instructor?.bio && (
                  <p style={styles.instructorBio}>{course.instructor.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Lessons Section */}
          {course.lessons_with_progress && course.lessons_with_progress.length > 0 && (
            <div style={styles.card}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Course Curriculum</h3>
                <span style={styles.lessonsCount}>{course.lessons_with_progress.length} lessons</span>
              </div>
              
              <div style={styles.lessonsList}>
                {course.lessons_with_progress.map((lesson, index) => (
                  <div 
                    key={lesson.id} 
                    style={{
                      ...styles.lessonItem,
                      ...(lesson.progress?.completed ? styles.lessonCompleted : {})
                    }}
                  >
                    <div style={styles.lessonContent}>
                      <div style={styles.lessonNumber}>{index + 1}</div>
                      <div style={styles.lessonDetails}>
                        <h4 style={styles.lessonTitle}>{lesson.title}</h4>
                        <p style={styles.lessonDescription}>{lesson.description}</p>
                        <div style={styles.lessonMeta}>
                          {lesson.duration_minutes && (
                            <span style={styles.lessonDuration}>{lesson.duration_minutes} min</span>
                          )}
                          {lesson.has_quiz && (
                            <span style={styles.quizBadge}>Quiz</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={styles.lessonActions}>
                      {lesson.progress?.completed ? (
                        <Link 
                          to={`/lessons/${lesson.id}`}
                          style={styles.reviewButton}
                        >
                          Review
                        </Link>
                      ) : (
                        <Link 
                          to={`/lessons/${lesson.id}`}
                          style={styles.startButton}
                        >
                          {progress?.enrollment?.exists ? 'Continue' : 'Start'}
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={styles.rightColumn}>
          {/* Course Stats */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Course Statistics</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{course.total_students || 0}</div>
                <div style={styles.statLabel}>Students</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{course.total_lessons || 0}</div>
                <div style={styles.statLabel}>Lessons</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{formatDuration(course.duration_hours)}</div>
                <div style={styles.statLabel}>Duration</div>
              </div>
              {course.average_rating && (
                <div style={styles.statItem}>
                  <div style={styles.statValue}>
                    <span style={styles.ratingStar}>★</span> {course.average_rating.toFixed(1)}
                  </div>
                  <div style={styles.statLabel}>Rating</div>
                </div>
              )}
            </div>
          </div>

          {/* Course Actions */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Quick Actions</h3>
            <div style={styles.actionButtons}>
              {isEnrolled && (
                <>
                  <Link to={`/progress`} style={styles.viewProgressButton}>
                    View Progress
                  </Link>
                </>
              )}
              
              {!user && (
                <button 
                  onClick={() => navigate('/login', { state: { from: `/courses/${id}` } })}
                  style={styles.loginButton}
                >
                  Login to Enroll
                </button>
              )}
            </div>
          </div>

          {/* Certificate Info */}
          {progress?.certificate?.exists && (
            <div style={{...styles.card, ...styles.certificateCard}}>
              <div style={styles.certificateIcon}>🏆</div>
              <h3 style={styles.certificateTitle}>Certificate Available</h3>
              <p style={styles.certificateText}>
                Congratulations! You've completed this course and earned a certificate.
              </p>
              <Link to="/certificates" style={styles.viewCertificateButton}>
                View Certificate
              </Link>
            </div>
          )}
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
  
  notFoundContainer: {
    textAlign: 'center',
    padding: '4rem 2rem',
  },
  
  heroSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    marginBottom: '2rem',
    padding: '2rem',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#6b7280',
    fontSize: '0.875rem',
    marginBottom: '1rem',
  },
  breadcrumbLink: {
    color: '#4f46e5',
    textDecoration: 'none',
  },
  breadcrumbCurrent: {
    color: '#1f2937',
    fontWeight: '500',
  },
  
  courseTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '1rem',
  },
  courseDescription: {
    fontSize: '1.125rem',
    color: '#6b7280',
    lineHeight: '1.6',
    marginBottom: '1.5rem',
  },
  
  courseMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#6b7280',
  },
  levelBadge: {
    background: '#e0e7ff',
    color: '#4f46e5',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  categoryBadge: {
    background: '#f3f4f6',
    color: '#374151',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  
  heroActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '1.5rem',
    borderTop: '1px solid #e5e7eb',
  },
  
  priceContainer: {
    display: 'flex',
    alignItems: 'baseline',
  },
  priceTag: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
  },
  priceCurrency: {
    fontSize: '1.5rem',
    color: '#4f46e5',
  },
  priceAmount: {
    marginLeft: '0.25rem',
  },
  freeTag: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#10b981',
  },
  
  enrollmentActions: {
    display: 'flex',
    gap: '1rem',
  },
  enrollButton: {
    background: '#10b981',
    color: 'white',
    border: 'none',
    padding: '0.75rem 2rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  unenrollButton: {
    background: '#f3f4f6',
    color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '0.75rem 2rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  continueButton: {
    background: '#4f46e5',
    color: 'white',
    textDecoration: 'none',
    padding: '0.75rem 2rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    display: 'inline-block',
    textAlign: 'center',
  },
  
  instructorActions: {
    display: 'flex',
    gap: '1rem',
  },
  editButton: {
    background: '#4f46e5',
    color: 'white',
    textDecoration: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
  },
  analyticsButton: {
    background: 'white',
    color: '#4f46e5',
    textDecoration: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    border: '2px solid #4f46e5',
  },
  
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '2rem',
  },
  
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  
  progressCard: {
    background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '1rem',
  },
  
  progressContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  
  progressStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  
  progressPercentage: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#4f46e5',
  },
  
  progressText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  
  completedBadge: {
    color: '#059669',
    fontWeight: '600',
  },
  
  progressBar: {
    height: '8px',
    background: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  
  progressBarFill: {
    height: '100%',
    background: '#4f46e5',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  
  instructorInfo: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  
  instructorAvatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: '600',
    flexShrink: 0,
  },
  
  instructorDetails: {
    flex: 1,
  },
  
  instructorName: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.25rem',
  },
  
  instructorUsername: {
    color: '#6b7280',
    fontSize: '0.875rem',
    marginBottom: '0.5rem',
  },
  
  instructorBio: {
    color: '#6b7280',
    lineHeight: '1.6',
  },
  
  detailSection: {
    marginBottom: '1.5rem',
  },
  
  detailTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  
  detailText: {
    color: '#6b7280',
    lineHeight: '1.6',
  },
  
  learningList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  
  learningItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    marginBottom: '0.75rem',
    color: '#6b7280',
  },
  
  checkIcon: {
    color: '#10b981',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  
  lessonsCount: {
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  
  lessonsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  
  lessonItem: {
    padding: '1rem',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  
  lessonCompleted: {
    background: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  
  lessonContent: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    flex: 1,
  },
  
  lessonNumber: {
    width: '32px',
    height: '32px',
    background: '#f3f4f6',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280',
    fontWeight: '600',
    flexShrink: 0,
  },
  
  lessonDetails: {
    flex: 1,
  },
  
  lessonTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.25rem',
  },
  
  lessonDescription: {
    color: '#6b7280',
    fontSize: '0.875rem',
    marginBottom: '0.5rem',
  },
  
  lessonMeta: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  
  lessonDuration: {
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  
  quizBadge: {
    background: '#fef3c7',
    color: '#92400e',
    padding: '0.125rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  
  lessonActions: {
    flexShrink: 0,
  },
  
  startButton: {
    background: '#4f46e5',
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  
  reviewButton: {
    background: '#f3f4f6',
    color: '#374151',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  
  statItem: {
    textAlign: 'center',
    padding: '1rem',
    background: '#f9fafb',
    borderRadius: '8px',
  },
  
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.25rem',
  },
  
  statLabel: {
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  
  ratingStar: {
    color: '#f59e0b',
  },
  
  actionButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  
  viewProgressButton: {
    background: '#4f46e5',
    color: 'white',
    textDecoration: 'none',
    padding: '0.75rem',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  notesButton: {
    background: 'white',
    color: '#4f46e5',
    textDecoration: 'none',
    padding: '0.75rem',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: '500',
    border: '1px solid #4f46e5',
  },
  
  loginButton: {
    background: '#10b981',
    color: 'white',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    width: '100%',
  },
  
  certificateCard: {
    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
  },
  
  certificateIcon: {
    fontSize: '2.5rem',
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  
  certificateTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1e40af',
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  
  certificateText: {
    color: '#374151',
    textAlign: 'center',
    marginBottom: '1rem',
    lineHeight: '1.6',
  },
  
  viewCertificateButton: {
    background: '#1e40af',
    color: 'white',
    textDecoration: 'none',
    padding: '0.75rem',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: '600',
    display: 'block',
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
    textDecoration: 'none',
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
  
  .enroll-button:hover:not(:disabled) {
    background: #059669;
  }
  
  .unenroll-button:hover:not(:disabled) {
    background: #fecaca;
  }
  
  .continue-button:hover {
    background: #4338ca;
  }
  
  .lesson-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .start-button:hover {
    background: #4338ca;
  }
  
  .review-button:hover {
    background: #e5e7eb;
  }
  
  .edit-button:hover {
    background: #4338ca;
  }
  
  .analytics-button:hover {
    background: #4f46e5;
    color: white;
  }
  
  .view-certificate-button:hover {
    background: #1e3a8a;
  }
  
  .view-progress-button:hover {
    background: #4338ca;
  }
  
  .notes-button:hover {
    background: #e0e7ff;
  }
  
  .login-button:hover {
    background: #059669;
  }
`;
document.head.appendChild(globalStyles);

export default CourseDetail;
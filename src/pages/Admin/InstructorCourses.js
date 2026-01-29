import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI, lessonAPI } from '../../services/api';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiBook, FiUsers, FiClock, FiBarChart2, FiChevronDown, FiChevronUp, FiAlertCircle } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import CreateCourseModal from '../../components/courses/CreateCourseModal';
import EditCourseModal from '../../components/courses/EditCourseModal';
import CreateLessonModal from '../../components/courses/CreateLessonModal';

const InstructorCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showEditLessonModal, setShowEditLessonModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [courseLessons, setCourseLessons] = useState({});
  const [loadingLessons, setLoadingLessons] = useState({});
  const [deletingLesson, setDeletingLesson] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    fetchCourses();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await courseAPI.getCourses();
      setCourses(response.data || []);
    } catch (err) {
      setError('Failed to load courses. Please try again.');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetails = async (courseId) => {
    try {
      setLoadingLessons(prev => ({ ...prev, [courseId]: true }));
      const response = await courseAPI.getCourse(courseId);
      const courseData = response.data;
      
      let lessons = [];
      if (courseData.lessons_with_progress) {
        lessons = courseData.lessons_with_progress;
      } else {
        try {
          const lessonsResponse = await lessonAPI.getLessons({ course: courseId });
          lessons = lessonsResponse.data || [];
        } catch (err) {
          console.error('Error fetching lessons separately:', err);
          lessons = [];
        }
      }
      
      setCourseLessons(prev => ({
        ...prev,
        [courseId]: lessons
      }));
    } catch (err) {
      console.error(`Error fetching course ${courseId} details:`, err);
      setCourseLessons(prev => ({
        ...prev,
        [courseId]: []
      }));
    } finally {
      setLoadingLessons(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const handleCreateCourse = async (courseData) => {
    try {
      await courseAPI.createCourse(courseData);
      setShowCourseModal(false);
      await fetchCourses();
      alert('Course created successfully!');
    } catch (err) {
      console.error('Error creating course:', err);
      alert(`Failed to create course: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleEditCourse = async (courseData) => {
    try {
      await courseAPI.updateCourse(selectedCourse.id, courseData);
      setShowEditCourseModal(false);
      setSelectedCourse(null);
      await fetchCourses();
      alert('Course updated successfully!');
    } catch (err) {
      console.error('Error updating course:', err);
      alert(`Failed to update course: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleCreateLesson = async (lessonData) => {
    try {
      await lessonAPI.createLesson(lessonData);
      setShowLessonModal(false);
      setSelectedCourse(null);
      if (selectedCourse) {
        await fetchCourseDetails(selectedCourse.id);
      }
      alert('Lesson created successfully!');
    } catch (err) {
      console.error('Error creating lesson:', err);
      alert(`Failed to create lesson: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleEditLesson = async (lessonData) => {
    try {
      await lessonAPI.updateLesson(selectedLesson.id, lessonData);
      setShowEditLessonModal(false);
      setSelectedLesson(null);
      setSelectedCourse(null);
      if (selectedCourse) {
        await fetchCourseDetails(selectedCourse.id);
      }
      alert('Lesson updated successfully!');
    } catch (err) {
      console.error('Error updating lesson:', err);
      alert(`Failed to update lesson: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This will also delete all lessons and student progress. This action cannot be undone.')) {
      try {
        await courseAPI.deleteCourse(courseId);
        await fetchCourses();
        alert('Course deleted successfully!');
      } catch (err) {
        console.error('Error deleting course:', err);
        alert(`Failed to delete course: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const handleDeleteLesson = async (lessonId, courseId) => {
    if (window.confirm('Are you sure you want to delete this lesson? This will also delete all student progress for this lesson. This action cannot be undone.')) {
      try {
        setDeletingLesson(lessonId);
        await lessonAPI.deleteLesson(lessonId);
        
        setCourseLessons(prev => {
          const updatedLessons = { ...prev };
          if (updatedLessons[courseId]) {
            updatedLessons[courseId] = updatedLessons[courseId].filter(lesson => lesson.id !== lessonId);
          }
          return updatedLessons;
        });
        
        alert('Lesson deleted successfully!');
      } catch (err) {
        console.error('Error deleting lesson:', err);
        alert(`Failed to delete lesson: ${err.response?.data?.message || err.message}`);
      } finally {
        setDeletingLesson(null);
      }
    }
  };

  const handlePublishToggle = async (courseId, currentStatus) => {
    try {
      const updatedCourse = {
        is_published: !currentStatus
      };
      
      await courseAPI.updateCourse(courseId, updatedCourse);
      await fetchCourses();
      alert(`Course ${!currentStatus ? 'published' : 'unpublished'} successfully!`);
    } catch (err) {
      console.error('Error toggling publish status:', err);
      alert(`Failed to update course: ${err.response?.data?.message || err.message}`);
    }
  };

  const toggleLessons = (course) => {
    if (courseLessons[course.id]) {
      setCourseLessons(prev => {
        const newLessons = { ...prev };
        delete newLessons[course.id];
        return newLessons;
      });
    } else {
      fetchCourseDetails(course.id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Loading state
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your courses...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={styles.errorContainer}>
        <FiAlertCircle size={48} style={styles.errorIcon} />
        <h3 style={styles.errorTitle}>Error Loading Courses</h3>
        <p style={styles.errorMessage}>{error}</p>
        <button 
          onClick={fetchCourses}
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
          <h1 style={styles.title}>My Courses</h1>
          <p style={styles.subtitle}>Manage your courses and lessons</p>
        </div>
        <button 
          onClick={() => setShowCourseModal(true)}
          style={styles.createCourseButton}
        >
          <FiPlus /> Create New Course
        </button>
      </div>

      {/* Stats Summary */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <FiBook size={24} />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{courses.length}</div>
            <div style={styles.statLabel}>Total Courses</div>
            <div style={styles.statSubtext}>
              {courses.filter(course => course.is_published).length} published • {courses.filter(course => !course.is_published).length} draft
            </div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'}}>
            <FiUsers size={24} />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>
              {courses.reduce((sum, course) => sum + (course.total_students || 0), 0)}
            </div>
            <div style={styles.statLabel}>Total Students</div>
            <div style={styles.statSubtext}>
              Across all courses
            </div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'}}>
            <FiBook size={24} />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>
              {courses.reduce((sum, course) => sum + (course.total_lessons || 0), 0)}
            </div>
            <div style={styles.statLabel}>Total Lessons</div>
            <div style={styles.statSubtext}>
              All lessons combined
            </div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)'}}>
            <FaRupeeSign size={20} />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>
              {formatCurrency(courses.reduce((sum, course) => sum + (course.price || 0), 0))}
            </div>
            <div style={styles.statLabel}>Total Value</div>
            <div style={styles.statSubtext}>
              Combined course value
            </div>
          </div>
        </div>
      </div>

      {/* Courses List */}
      {courses.length > 0 ? (
        <div style={styles.coursesList}>
          {courses.map((course) => (
            <div key={course.id} style={styles.courseCard}>
              <div style={styles.courseHeader}>
                <div style={styles.courseInfo}>
                  <div style={styles.courseTitleSection}>
                    <div style={styles.courseTitleRow}>
                      <h2 style={styles.courseTitle}>{course.title}</h2>
                      <div style={styles.courseStatusRow}>
                        <span style={{
                          ...styles.statusBadge,
                          ...(course.is_published ? styles.statusPublished : styles.statusDraft)
                        }}>
                          {course.is_published ? 'Published' : 'Draft'}
                        </span>
                        <span style={styles.createdDate}>
                          Created: {formatDate(course.created_at)}
                        </span>
                        {course.updated_at !== course.created_at && (
                          <span style={styles.updatedDate}>
                            Updated: {formatDate(course.updated_at)}
                          </span>
                        )}
                      </div>
                    </div>
                    <p style={styles.courseDescription}>{course.description}</p>
                    
                    <div style={styles.courseTags}>
                      {course.category && (
                        <span style={styles.tag}>
                          <FiBook size={12} /> {course.category}
                        </span>
                      )}
                      {course.level && (
                        <span style={styles.tag}>
                          {course.level}
                        </span>
                      )}
                      {course.duration_hours && (
                        <span style={styles.tag}>
                          <FiClock size={12} /> {course.duration_hours} hours
                        </span>
                      )}
                      <span style={styles.tag}>
                        <FiUsers size={12} /> {course.total_students || 0} students
                      </span>
                      {course.price && (
                        <span style={styles.tag}>
                          <FaRupeeSign size={12} /> {formatCurrency(course.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={styles.courseActions}>
                  <div style={styles.actionButtons}>
                    <Link
                      to={`/courses/${course.id}`}
                      style={styles.viewButton}
                      title="View Course Details"
                    >
                      <FiEye size={16} />
                      {!isMobile && ' View'}
                    </Link>
                    <Link
                      to={`/courses/${course.id}/analytics`}
                      style={styles.analyticsButton}
                      title="View Analytics"
                    >
                      <FiBarChart2 size={16} />
                      {!isMobile && ' Analytics'}
                    </Link>
                    <button
                      style={styles.editButton}
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowEditCourseModal(true);
                      }}
                      title="Edit Course"
                    >
                      <FiEdit size={16} />
                      {!isMobile && ' Edit'}
                    </button>
                    <button
                      style={{
                        ...styles.publishButton,
                        ...(course.is_published ? styles.unpublishButton : styles.publishButtonActive)
                      }}
                      onClick={() => handlePublishToggle(course.id, course.is_published)}
                      title={course.is_published ? 'Unpublish Course' : 'Publish Course'}
                    >
                      {course.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      style={styles.deleteButton}
                      onClick={() => handleDeleteCourse(course.id)}
                      title="Delete Course"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div style={styles.courseLessonsSection}>
                <button
                  style={styles.toggleLessonsButton}
                  onClick={() => toggleLessons(course)}
                  disabled={loadingLessons[course.id]}
                >
                  {courseLessons[course.id] ? <FiChevronUp /> : <FiChevronDown />}
                  <FiBook /> 
                  {loadingLessons[course.id] ? (
                    'Loading...'
                  ) : (
                    <>
                      {courseLessons[course.id] ? 'Hide' : 'Show'} Lessons 
                      <span style={styles.lessonsCount}>({course.total_lessons || 0})</span>
                    </>
                  )}
                </button>

                {courseLessons[course.id] && (
                  <div style={styles.lessonsContainer}>
                    <div style={styles.lessonsHeader}>
                      <h4 style={styles.lessonsTitle}>Course Lessons</h4>
                      <button
                        style={styles.addLessonButton}
                        onClick={() => {
                          setSelectedCourse(course);
                          setShowLessonModal(true);
                        }}
                      >
                        <FiPlus /> Add New Lesson
                      </button>
                    </div>
                    
                    {courseLessons[course.id].length > 0 ? (
                      <div style={styles.lessonsTableContainer}>
                        <table style={styles.lessonsTable}>
                          <thead>
                            <tr>
                              <th style={styles.tableHeader}>#</th>
                              <th style={styles.tableHeader}>Lesson Title</th>
                              <th style={styles.tableHeader}>Type</th>
                              <th style={styles.tableHeader}>Duration</th>
                              <th style={styles.tableHeader}>Status</th>
                              <th style={styles.tableHeader}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {courseLessons[course.id]
                              .sort((a, b) => (a.order || 0) - (b.order || 0))
                              .map((lesson) => (
                                <tr key={lesson.id} style={styles.tableRow}>
                                  <td style={styles.lessonOrder}>{lesson.order || '-'}</td>
                                  <td style={styles.lessonTitleCell}>
                                    <div style={styles.lessonTitle}>{lesson.title}</div>
                                    {lesson.description && (
                                      <div style={styles.lessonDescription}>{lesson.description}</div>
                                    )}
                                  </td>
                                  <td>
                                    <span style={{
                                      ...styles.lessonType,
                                      ...(lesson.content_type === 'video' ? styles.videoType : 
                                           lesson.content_type === 'quiz' ? styles.quizType : 
                                           styles.contentType)
                                    }}>
                                      {lesson.content_type || 'content'}
                                    </span>
                                  </td>
                                  <td style={styles.lessonDuration}>
                                    {lesson.duration_minutes ? `${lesson.duration_minutes} min` : '-'}
                                  </td>
                                  <td>
                                    <span style={{
                                      ...styles.lessonStatus,
                                      ...(lesson.completed ? styles.statusCompleted : styles.statusIncomplete)
                                    }}>
                                      {lesson.completed ? 'Completed' : 'Not Started'}
                                    </span>
                                  </td>
                                  <td style={styles.lessonActions}>
                                    <div style={styles.actionButtonsSmall}>
                                      <Link
                                        to={`/lessons/${lesson.id}`}
                                        style={styles.smallViewButton}
                                        title="View Lesson"
                                      >
                                        <FiEye size={14} />
                                      </Link>
                                      <button
                                        style={styles.smallEditButton}
                                        onClick={() => {
                                          setSelectedCourse(course);
                                          setSelectedLesson(lesson);
                                          setShowEditLessonModal(true);
                                        }}
                                        title="Edit Lesson"
                                        disabled={deletingLesson === lesson.id}
                                      >
                                        <FiEdit size={14} />
                                      </button>
                                      <button
                                        style={styles.smallDeleteButton}
                                        onClick={() => handleDeleteLesson(lesson.id, course.id)}
                                        title="Delete Lesson"
                                        disabled={deletingLesson === lesson.id}
                                      >
                                        {deletingLesson === lesson.id ? (
                                          <div style={styles.deletingSpinner}></div>
                                        ) : (
                                          <FiTrash2 size={14} />
                                        )}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={styles.noLessonsMessage}>
                        <FiBook size={32} style={styles.noLessonsIcon} />
                        <h4 style={styles.noLessonsTitle}>No Lessons Yet</h4>
                        <p style={styles.noLessonsText}>Start building your course by adding lessons</p>
                        <button
                          style={styles.addFirstLessonButton}
                          onClick={() => {
                            setSelectedCourse(course);
                            setShowLessonModal(true);
                          }}
                        >
                          <FiPlus /> Add Your First Lesson
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <div style={styles.emptyStateIcon}>
            <FiBook size={64} />
          </div>
          <h3 style={styles.emptyStateTitle}>No Courses Created Yet</h3>
          <p style={styles.emptyStateDescription}>
            Create your first course to start teaching and sharing your knowledge with students
          </p>
          <button 
            style={styles.createFirstCourseButton}
            onClick={() => setShowCourseModal(true)}
          >
            <FiPlus /> Create Your First Course
          </button>
          <div style={styles.emptyStateTips}>
            <h4 style={styles.tipsTitle}>Tips for creating great courses:</h4>
            <ul style={styles.tipsList}>
              <li>Choose a clear, descriptive title</li>
              <li>Write a compelling description</li>
              <li>Structure your content with clear lessons</li>
              <li>Add quizzes and assignments for engagement</li>
              <li>Include real-world examples and projects</li>
            </ul>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {showCourseModal && (
        <CreateCourseModal
          onClose={() => setShowCourseModal(false)}
          onSubmit={handleCreateCourse}
        />
      )}

      {/* Edit Course Modal */}
      {showEditCourseModal && selectedCourse && (
        <EditCourseModal
          course={selectedCourse}
          onClose={() => {
            setShowEditCourseModal(false);
            setSelectedCourse(null);
          }}
          onSubmit={handleEditCourse}
        />
      )}

      {/* Create Lesson Modal */}
      {showLessonModal && selectedCourse && (
        <CreateLessonModal
          course={selectedCourse}
          onClose={() => {
            setShowLessonModal(false);
            setSelectedCourse(null);
          }}
          onSubmit={handleCreateLesson}
        />
      )}

      {/* Edit Lesson Modal */}
      {showEditLessonModal && selectedLesson && selectedCourse && (
        <CreateLessonModal
          course={selectedCourse}
          lesson={selectedLesson}
          isEditing={true}
          onClose={() => {
            setShowEditLessonModal(false);
            setSelectedLesson(null);
            setSelectedCourse(null);
          }}
          onSubmit={handleEditLesson}
        />
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
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '1.125rem',
  },
  createCourseButton: {
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    whiteSpace: 'nowrap',
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
  
  coursesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  
  courseCard: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s',
  },
  
  courseHeader: {
    padding: '1.5rem',
  },
  
  courseInfo: {
    marginBottom: '1rem',
  },
  
  courseTitleSection: {
    marginBottom: '1rem',
  },
  
  courseTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  
  courseTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0,
    flex: 1,
  },
  
  courseStatusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  
  statusPublished: {
    background: '#d1fae5',
    color: '#065f46',
  },
  
  statusDraft: {
    background: '#f3f4f6',
    color: '#4b5563',
  },
  
  createdDate: {
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  
  updatedDate: {
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  
  courseDescription: {
    color: '#6b7280',
    lineHeight: '1.6',
    marginBottom: '1rem',
  },
  
  courseTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  
  tag: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    background: '#f3f4f6',
    color: '#374151',
    padding: '0.375rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  
  courseActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  
  actionButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  
  viewButton: {
    background: '#e0e7ff',
    color: '#4f46e5',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
  },
  
  analyticsButton: {
    background: '#f0fdf4',
    color: '#10b981',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
  },
  
  editButton: {
    background: '#fef3c7',
    color: '#92400e',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  
  publishButton: {
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  
  publishButtonActive: {
    background: '#10b981',
    color: 'white',
  },
  
  unpublishButton: {
    background: '#f3f4f6',
    color: '#374151',
  },
  
  deleteButton: {
    background: '#fef2f2',
    color: '#dc2626',
    border: 'none',
    padding: '0.5rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  courseLessonsSection: {
    borderTop: '1px solid #e5e7eb',
  },
  
  toggleLessonsButton: {
    width: '100%',
    background: 'none',
    border: 'none',
    padding: '1rem 1.5rem',
    color: '#4f46e5',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'background-color 0.2s',
  },
  
  lessonsCount: {
    color: '#9ca3af',
    marginLeft: '0.25rem',
  },
  
  lessonsContainer: {
    padding: '0 1.5rem 1.5rem',
  },
  
  lessonsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  
  lessonsTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
  },
  
  addLessonButton: {
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  
  lessonsTableContainer: {
    overflowX: 'auto',
  },
  
  lessonsTable: {
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
  
  lessonOrder: {
    padding: '1rem',
    fontWeight: '600',
    color: '#1f2937',
  },
  
  lessonTitleCell: {
    padding: '1rem',
    minWidth: '200px',
  },
  
  lessonTitle: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.25rem',
  },
  
  lessonDescription: {
    color: '#6b7280',
    fontSize: '0.875rem',
    lineHeight: '1.4',
  },
  
  lessonType: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '500',
    display: 'inline-block',
  },
  
  videoType: {
    background: '#dbeafe',
    color: '#1e40af',
  },
  
  quizType: {
    background: '#fef3c7',
    color: '#92400e',
  },
  
  contentType: {
    background: '#f3f4f6',
    color: '#374151',
  },
  
  lessonDuration: {
    padding: '1rem',
    color: '#6b7280',
  },
  
  lessonStatus: {
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
  
  statusIncomplete: {
    background: '#fef3c7',
    color: '#92400e',
  },
  
  lessonActions: {
    padding: '1rem',
  },
  
  actionButtonsSmall: {
    display: 'flex',
    gap: '0.25rem',
  },
  
  smallViewButton: {
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
  },
  
  smallEditButton: {
    width: '32px',
    height: '32px',
    background: '#fef3c7',
    color: '#92400e',
    border: 'none',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  
  smallDeleteButton: {
    width: '32px',
    height: '32px',
    background: '#fef2f2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  
  deletingSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #f3f4f6',
    borderTop: '2px solid #dc2626',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  
  noLessonsMessage: {
    textAlign: 'center',
    padding: '2rem',
  },
  
  noLessonsIcon: {
    color: '#9ca3af',
    marginBottom: '1rem',
  },
  
  noLessonsTitle: {
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  
  noLessonsText: {
    color: '#6b7280',
    marginBottom: '1.5rem',
  },
  
  addFirstLessonButton: {
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
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
  
  emptyStateDescription: {
    color: '#6b7280',
    maxWidth: '500px',
    margin: '0 auto 2rem',
    lineHeight: '1.6',
  },
  
  createFirstCourseButton: {
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '8px',
    fontSize: '1.125rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    margin: '0 auto 2rem',
  },
  
  emptyStateTips: {
    background: '#f9fafb',
    borderRadius: '8px',
    padding: '1.5rem',
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'left',
  },
  
  tipsTitle: {
    color: '#1f2937',
    marginBottom: '1rem',
  },
  
  tipsList: {
    color: '#6b7280',
    paddingLeft: '1.5rem',
    margin: 0,
    lineHeight: '1.8',
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
  
  .course-card:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .toggle-lessons-button:hover:not(:disabled) {
    background: #f9fafb;
  }
  
  .create-course-button:hover {
    background: #4338ca;
  }
  
  .view-button:hover {
    background: #c7d2fe;
  }
  
  .analytics-button:hover {
    background: #bbf7d0;
  }
  
  .edit-button:hover {
    background: #fde68a;
  }
  
  .publish-button-active:hover {
    background: #059669;
  }
  
  .unpublish-button:hover {
    background: #e5e7eb;
  }
  
  .delete-button:hover {
    background: #fecaca;
  }
  
  .add-lesson-button:hover {
    background: #4338ca;
  }
  
  .add-first-lesson-button:hover {
    background: #4338ca;
  }
  
  .create-first-course-button:hover {
    background: #4338ca;
  }
  
  .small-view-button:hover {
    background: #c7d2fe;
  }
  
  .small-edit-button:hover:not(:disabled) {
    background: #fde68a;
  }
  
  .small-delete-button:hover:not(:disabled) {
    background: #fecaca;
  }
`;
document.head.appendChild(globalStyles);

export default InstructorCourses;
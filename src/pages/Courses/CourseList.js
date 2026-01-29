import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { courseAPI } from '../../services/api';
import { FiSearch, FiBookOpen, FiUsers, FiClock, FiStar, FiBook, FiX } from 'react-icons/fi';

const CourseList = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [ordering, setOrdering] = useState('newest');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterAndSortCourses();
  }, [courses, searchTerm, category, level, ordering]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await courseAPI.getCourses();
      const allCourses = response.data || [];
      setCourses(allCourses);
      
      const uniqueCategories = [...new Set(allCourses
        .map(course => course.category)
        .filter(Boolean)
        .sort())];
      setCategories(uniqueCategories);
      
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again.');
      setCourses([]);
      setFilteredCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCourses = () => {
    let result = [...courses];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(course => 
        course.title.toLowerCase().includes(term) ||
        course.description.toLowerCase().includes(term) ||
        (course.instructor?.first_name && course.instructor.first_name.toLowerCase().includes(term)) ||
        (course.instructor?.last_name && course.instructor.last_name.toLowerCase().includes(term)) ||
        (course.category && course.category.toLowerCase().includes(term))
      );
    }
    
    // Apply category filter
    if (category) {
      result = result.filter(course => course.category === category);
    }
    
    // Apply level filter
    if (level) {
      result = result.filter(course => course.level === level);
    }
    
    // Apply sorting
    switch(ordering) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'price-low':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'duration-short':
        result.sort((a, b) => (a.duration_hours || 0) - (b.duration_hours || 0));
        break;
      case 'duration-long':
        result.sort((a, b) => (b.duration_hours || 0) - (a.duration_hours || 0));
        break;
      case 'popular':
        result.sort((a, b) => (b.total_students || 0) - (a.total_students || 0));
        break;
      case 'lessons':
        result.sort((a, b) => (b.total_lessons || 0) - (a.total_lessons || 0));
        break;
      default:
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    setFilteredCourses(result);
  };

  const handleEnroll = async (courseId) => {
    try {
      // Show loading state for this specific course
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.id === courseId 
            ? { ...course, enrolling: true }
            : course
        )
      );
      
      // Call the enroll API - make sure this endpoint exists in your API service
      const response = await courseAPI.enroll(courseId);
      
      if (response.status === 200 || response.status === 201) {
        // Success - update the course status
        setCourses(prevCourses => 
          prevCourses.map(course => 
            course.id === courseId 
              ? { 
                  ...course, 
                  is_enrolled: true, 
                  enrolling: false,
                  // Increment student count for visual feedback
                  total_students: (course.total_students || 0) + 1
                }
              : course
          )
        );
        
        // Show success message
        alert('Successfully enrolled in the course!');
      }
      
    } catch (err) {
      console.error('Error enrolling in course:', err);
      
      // Reset enrolling state
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.id === courseId 
            ? { ...course, enrolling: false }
            : course
        )
      );
      
      // Handle specific error cases
      let errorMessage = 'Failed to enroll. Please try again.';
      
      if (err.response) {
        const { status, data } = err.response;
        
        switch(status) {
          case 400:
            if (data.message && data.message.includes('already enrolled')) {
              // User is already enrolled - update UI
              setCourses(prevCourses => 
                prevCourses.map(course => 
                  course.id === courseId 
                    ? { ...course, is_enrolled: true }
                    : course
                )
              );
              errorMessage = 'You are already enrolled in this course.';
            } else {
              errorMessage = data.message || 'Invalid request. Please check the course details.';
            }
            break;
            
          case 401:
            errorMessage = 'Please log in to enroll in courses.';
            break;
            
          case 403:
            errorMessage = 'You do not have permission to enroll in this course.';
            break;
            
          case 404:
            errorMessage = 'Course not found.';
            break;
            
          default:
            errorMessage = data.message || 'An error occurred. Please try again.';
        }
      } else if (err.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      // Show error message if not already enrolled
      const course = courses.find(c => c.id === courseId);
      if (!course?.is_enrolled) {
        alert(errorMessage);
      }
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setLevel('');
    setOrdering('newest');
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleClearCategory = () => {
    setCategory('');
  };

  const handleClearLevel = () => {
    setLevel('');
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (err) {
      return 'Recent';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <h3>Error Loading Courses</h3>
        <p>{error}</p>
        <button style={styles.primaryButton} onClick={fetchCourses}>
          Try Again
        </button>
      </div>
    );
  }

  // Add disabled button style
  const disabledButton = {
    opacity: 0.6,
    cursor: 'not-allowed',
  };

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Discover Your Next Learning Journey</h1>
          <p style={styles.heroSubtitle}>Browse through our collection of courses taught by expert instructors</p>
        </div>
        {user?.role === 'instructor' && (
          <Link to="/instructor/courses" style={styles.heroButton}>
            Create New Course
          </Link>
        )}
      </div>

      {/* Filters Section */}
      <div style={styles.filtersSection}>
        <div style={styles.filtersCard}>
          <div style={styles.filtersHeader}>
            <FiSearch />
            <h3 style={styles.filtersTitle}>Find Courses</h3>
            {(searchTerm || category || level) && (
              <button style={styles.clearAllButton} onClick={handleClearFilters}>
                Clear All Filters
              </button>
            )}
          </div>

          <div style={styles.filtersGrid}>
            {/* Search Input */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Search Courses</label>
              <div style={styles.searchInputWrapper}>
                <FiSearch style={styles.searchIcon} />
                <input
                  type="text"
                  style={styles.searchInput}
                  placeholder="Search by title, description, instructor, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button style={styles.clearSearchButton} onClick={handleClearSearch}>
                    <FiX size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Category</label>
              <div style={styles.selectWrapper}>
                <select
                  style={styles.selectInput}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Level Filter */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Level</label>
              <div style={styles.selectWrapper}>
                <select
                  style={styles.selectInput}
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Sort Filter */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Sort By</label>
              <div style={styles.selectWrapper}>
                <select
                  style={styles.selectInput}
                  value={ordering}
                  onChange={(e) => setOrdering(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="duration-short">Duration: Short to Long</option>
                  <option value="duration-long">Duration: Long to Short</option>
                  <option value="popular">Most Popular</option>
                  <option value="lessons">Most Lessons</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || category || level) && (
            <div style={styles.activeFilters}>
              <span style={styles.activeFiltersLabel}>Active Filters:</span>
              {searchTerm && (
                <span style={styles.activeFilterTag}>
                  Search: "{searchTerm}"
                  <button onClick={handleClearSearch} style={styles.tagCloseButton}>
                    <FiX size={12} />
                  </button>
                </span>
              )}
              {category && (
                <span style={styles.activeFilterTag}>
                  Category: {category}
                  <button onClick={handleClearCategory} style={styles.tagCloseButton}>
                    <FiX size={12} />
                  </button>
                </span>
              )}
              {level && (
                <span style={styles.activeFilterTag}>
                  Level: {level}
                  <button onClick={handleClearLevel} style={styles.tagCloseButton}>
                    <FiX size={12} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div style={styles.resultsSummary}>
        <h3 style={styles.resultsTitle}>
          {filteredCourses.length} Course{filteredCourses.length !== 1 ? 's' : ''} Found
          {(searchTerm || category || level) && ' (Filtered)'}
        </h3>
      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div style={styles.coursesGrid}>
          {filteredCourses.map((course) => (
            <div key={course.id} style={styles.courseCard}>
              {/* Course Image */}
              <div style={styles.courseImage}>
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} style={styles.courseImageImg} />
                ) : (
                  <div style={styles.courseImagePlaceholder}>
                    <FiBook size={40} />
                    <span>{course.category || 'Course'}</span>
                  </div>
                )}
                <div style={styles.courseBadges}>
                  <span style={{
                    ...styles.statusBadge,
                    ...(course.is_published ? styles.publishedBadge : styles.draftBadge)
                  }}>
                    {course.is_published ? 'Published' : 'Draft'}
                  </span>
                  {course.level && (
                    <span style={styles.levelBadge}>{course.level}</span>
                  )}
                </div>
              </div>

              {/* Course Content */}
              <div style={styles.courseContent}>
                <h3 style={styles.courseTitle}>{course.title}</h3>
                <p style={styles.courseDescription}>
                  {course.description || 'No description available.'}
                </p>

                {/* Course Meta */}
                <div style={styles.courseMeta}>
                  <div style={styles.metaItem}>
                    <FiBook size={14} />
                    <span>{course.total_lessons || 0} lessons</span>
                  </div>
                  <div style={styles.metaItem}>
                    <FiClock size={14} />
                    <span>{course.duration_hours || 'N/A'} hours</span>
                  </div>
                  <div style={styles.metaItem}>
                    <FiUsers size={14} />
                    <span>{course.total_students || 0} students</span>
                  </div>
                </div>

                {/* Instructor Info */}
                <div style={styles.instructorInfo}>
                  <div style={styles.instructorAvatar}>
                    {course.instructor?.first_name?.charAt(0) || 'I'}
                  </div>
                  <div style={styles.instructorDetails}>
                    <span style={styles.instructorName}>
                      {course.instructor?.first_name} {course.instructor?.last_name}
                    </span>
                    <span style={styles.instructorRole}>Instructor</span>
                  </div>
                </div>

                {/* Enrollment Status */}
                <div style={styles.enrollmentStatus}>
                  {course.is_enrolled ? (
                    <span style={styles.enrolledBadge}>
                      ✓ Already Enrolled
                    </span>
                  ) : (
                    <span style={styles.notEnrolled}>
                      Not Enrolled
                    </span>
                  )}
                  <span style={styles.courseDate}>Added {formatDate(course.created_at)}</span>
                </div>

                {/* Action Buttons */}
                <div style={styles.courseActions}>
                  <Link to={`/courses/${course.id}`} style={styles.viewDetailsButton}>
                    View Details
                  </Link>
                  {user?.role === 'student' && (
                    <button
                      style={{
                        ...styles.enrollButton,
                        ...(course.is_enrolled ? styles.enrolledButton : styles.enrollButtonActive),
                        ...(course.enrolling ? disabledButton : {})
                      }}
                      onClick={() => !course.enrolling && !course.is_enrolled && handleEnroll(course.id)}
                      disabled={course.is_enrolled || course.enrolling}
                    >
                      {course.enrolling ? 'Enrolling...' : (course.is_enrolled ? 'Enrolled' : 'Enroll Now')}
                    </button>
                  )}
                  {user?.role === 'instructor' && course.instructor?.id === user?.id && (
                    <Link
                      to={`/instructor/courses/${course.id}`}
                      style={styles.manageButton}
                    >
                      Manage Course
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.noCoursesFound}>
          <div style={styles.noCoursesIcon}>
            <FiBookOpen size={64} />
          </div>
          <h3>No courses found</h3>
          <p style={styles.noCoursesText}>
            {searchTerm || category || level 
              ? 'Try adjusting your search filters or clear all filters to see all courses.'
              : 'There are no courses available at the moment.'}
          </p>
          {(searchTerm || category || level) && (
            <button style={styles.primaryButton} onClick={handleClearFilters}>
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// All CSS styles in JavaScript object
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  
  // Loading States
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
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  
  // Hero Section
  heroSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '3rem',
    padding: '3rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '20px',
    color: 'white',
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '1rem',
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    opacity: '0.9',
    maxWidth: '600px',
  },
  heroButton: {
    background: 'white',
    color: '#667eea',
    border: 'none',
    fontWeight: '600',
    padding: '0.75rem 2rem',
    borderRadius: '10px',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
  },
  
  // Filters Section
  filtersSection: {
    marginBottom: '2rem',
  },
  filtersCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
  },
  filtersHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  filtersTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    margin: '0',
    flex: '1',
  },
  clearAllButton: {
    padding: '0.375rem 0.75rem',
    fontSize: '0.875rem',
    background: 'white',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  
  // Filters Grid
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '1.5rem',
  },
  filterGroup: {
    marginBottom: '0',
  },
  filterLabel: {
    display: 'block',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#374151',
  },
  
  // Search Input
  searchInputWrapper: {
    position: 'relative',
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.95rem',
    transition: 'all 0.2s',
  },
  searchIcon: {
    position: 'absolute',
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
  },
  clearSearchButton: {
    position: 'absolute',
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    transition: 'all 0.2s',
  },
  
  // Select Inputs
  selectWrapper: {
    position: 'relative',
  },
  selectInput: {
    width: '100%',
    padding: '0.75rem 2.5rem 0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.95rem',
    appearance: 'none',
    background: 'white',
    cursor: 'pointer',
  },
  
  // Active Filters
  activeFilters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    alignItems: 'center',
    paddingTop: '1.5rem',
    borderTop: '1px solid #e5e7eb',
  },
  activeFiltersLabel: {
    fontWeight: '600',
    color: '#374151',
  },
  activeFilterTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: '#e0e7ff',
    color: '#4f46e5',
    padding: '0.375rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  tagCloseButton: {
    background: 'none',
    border: 'none',
    color: '#4f46e5',
    cursor: 'pointer',
    padding: '0.125rem',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    transition: 'background-color 0.2s',
  },
  
  // Results Summary
  resultsSummary: {
    marginBottom: '2rem',
  },
  resultsTitle: {
    fontSize: '1.5rem',
    color: '#1f2937',
  },
  
  // Course Grid
  coursesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '2rem',
  },
  
  // Course Card
  courseCard: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    border: '1px solid #e5e7eb',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  courseImage: {
    position: 'relative',
    height: '180px',
    overflow: 'hidden',
  },
  courseImageImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  courseImagePlaceholder: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  courseBadges: {
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  publishedBadge: {
    background: '#dcfce7',
    color: '#166534',
  },
  draftBadge: {
    background: '#f3f4f6',
    color: '#4b5563',
  },
  levelBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    background: 'rgba(255, 255, 255, 0.9)',
    color: '#1f2937',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  
  // Course Content
  courseContent: {
    padding: '1.5rem',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  courseTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.75rem',
    lineHeight: '1.3',
  },
  courseDescription: {
    color: '#6b7280',
    fontSize: '0.95rem',
    lineHeight: '1.6',
    marginBottom: '1rem',
    flex: 1,
  },
  
  // Course Meta
  courseMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e5e7eb',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  
  // Instructor Info
  instructorInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  instructorAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '0.875rem',
  },
  instructorDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  instructorName: {
    fontWeight: '600',
    color: '#1f2937',
    fontSize: '0.95rem',
  },
  instructorRole: {
    color: '#6b7280',
    fontSize: '0.75rem',
  },
  
  // Enrollment Status
  enrollmentStatus: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    padding: '0.75rem',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  enrolledBadge: {
    background: 'linear-gradient(135deg, #10b981, #34d399)',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  notEnrolled: {
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  courseDate: {
    color: '#9ca3af',
    fontSize: '0.875rem',
  },
  
  // Course Actions
  courseActions: {
    display: 'flex',
    gap: '0.75rem',
  },
  viewDetailsButton: {
    flex: 2,
    padding: '0.625rem 1.25rem',
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '500',
    textDecoration: 'none',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  enrollButton: {
    flex: 1,
    padding: '0.625rem 1.25rem',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '500',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  enrollButtonActive: {
    background: '#10b981',
    color: 'white',
  },
  enrolledButton: {
    background: 'white',
    color: '#374151',
    border: '1px solid #d1d5db',
  },
  manageButton: {
    flex: 1,
    padding: '0.625rem 1.25rem',
    background: 'white',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontWeight: '500',
    textDecoration: 'none',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  
  // No Courses Found
  noCoursesFound: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: 'white',
    borderRadius: '16px',
    border: '2px dashed #e5e7eb',
  },
  noCoursesIcon: {
    color: '#9ca3af',
    marginBottom: '1.5rem',
  },
  noCoursesText: {
    color: '#6b7280',
    maxWidth: '500px',
    margin: '0 auto 2rem',
    lineHeight: '1.6',
  },
  
  // Primary Button
  primaryButton: {
    padding: '0.625rem 1.25rem',
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

// Add global CSS animation
const styleSheet = document.createElement('style');
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .course-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
  
  .search-input:focus,
  .select-input:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
  
  .clear-search-button:hover,
  .tag-close-button:hover {
    background: #f3f4f6;
    color: #374151;
  }
  
  .view-details-button:hover {
    background: #4338ca;
  }
  
  .enroll-button:hover:not(:disabled) {
    background: #059669;
  }
  
  .manage-button:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
  
  .hero-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
  
  .clear-all-button:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
`;
document.head.appendChild(styleSheet);

export default CourseList;
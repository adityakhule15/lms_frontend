import axios from 'axios';

const API_BASE_URL = 'https://lms-1rkz.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  login: (credentials) => api.post('/login/', credentials),
  register: (userData) => api.post('/register/', userData),
  logout: () => api.post('/logout/'),
};

// Course APIs
export const courseAPI = {
  // Course management
  getCourses: (params) => api.get('/courses/', { params }),
  getCourse: (id) => api.get(`/courses/${id}/`),
  createCourse: (data) => api.post('/courses/', data),
  updateCourse: (id, data) => api.put(`/courses/${id}/`, data),
  deleteCourse: (id) => api.delete(`/courses/${id}/`),
  
  // Enrollment
  enroll: (courseId) => api.post(`/courses/${courseId}/enroll/`),
  unenroll: (courseId) => api.post(`/courses/${courseId}/unenroll/`),
  
  // Student-specific
  getEnrolledCourses: () => api.get('/courses/enrolled_courses/'),
  getAvailableCourses: () => api.get('/courses/available_courses/'),
};

// Lesson APIs
export const lessonAPI = {
  getLesson: (id) => api.get(`/lessons/${id}/`),
  createLesson: (data) => api.post('/lessons/', data),
  updateLesson: (id, data) => api.patch(`/lessons/${id}/`, data),
  deleteLesson: (id) => api.delete(`/lessons/${id}/`),
  markComplete: (id) => api.post(`/lessons/${id}/mark_complete/`),
};

// Progress Tracking APIs
export const progressAPI = {
  getCourseProgress: (courseId) => api.get(`/course-progress/${courseId}/`),
  getOverallProgress: () => api.get('/course-progress/overall/'),
  getLessonProgressDetails: (lessonId) => api.get(`/lesson-progress/${lessonId}/details/`),
  resetLessonProgress: (lessonId) => api.post(`/lesson-progress/${lessonId}/reset/`),
};

// Enrollment APIs
export const enrollmentAPI = {
  getEnrollments: () => api.get('/enrollments/'),
  getEnrollment: (id) => api.get(`/enrollments/${id}/`),
  getEnrollmentProgress: (id) => api.get(`/enrollments/${id}/progress/`),
  getEnrollmentCertificate: (id) => api.get(`/enrollments/${id}/certificate/`),
};

// Quiz APIs
export const quizAPI = {
  getQuiz: (id) => api.get(`/quizzes/${id}/`),
  createQuiz: (data) => api.post('/quizzes/', data),
  createQuestion: (data) => api.post('/questions/', data),
  submitQuizAttempt: (quizId, answers) => api.post(`/quizzes/${quizId}/attempt/`, { answers }),
  getQuizAttemptHistory: (quizId) => api.get(`/quiz-attempts/quiz/${quizId}/history/`),
};

// Certificate APIs
export const certificateAPI = {
  getCertificates: () => api.get('/certificates/'),
  getCertificate: (id) => api.get(`/certificates/${id}/`),
  downloadCertificate: (id) => api.get(`/certificates/${id}/download/`),
  verifyCertificate: (certificateId) => api.get(`/certificates/verify/${certificateId}/`),
  regenerateCertificate: (courseId) => api.post('/certificates/regenerate/', { course_id: courseId }),
};

// Dashboard APIs
export const dashboardAPI = {
  getStudentDashboard: () => api.get('/dashboard/student/'),
  getInstructorDashboard: () => api.get('/dashboard/instructor/'),
};

// Analytics APIs
export const analyticsAPI = {
  getCourseAnalytics: (courseId) => api.get(`/courses/${courseId}/analytics/`),
  getStudentProgressReports: () => api.get('/student-progress-reports/'),
  getStudentProgressReport: (studentId) => api.get(`/student-progress-reports/${studentId}/`),
  getActivity: () => api.get('/activity/'),
};

export default api;


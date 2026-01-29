import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import StudentDashboard from './pages/Dashboard/StudentDashboard';
import InstructorDashboard from './pages/Dashboard/InstructorDashboard';
import CourseList from './pages/Courses/CourseList';
import CourseDetail from './pages/Courses/CourseDetail';
import LessonDetail from './pages/Courses/LessonDetail';
import QuizDetail from './pages/Quizzes/QuizDetail';
import ProgressTracking from './pages/Progress/ProgressTracking';
import Certificates from './pages/Certificates/Certificates';
import InstructorCourses from './pages/Admin/InstructorCourses';
import StudentProgressReport from './pages/Admin/StudentProgressReport';
import CourseAnalytics from './pages/Admin/CourseAnalytics';
import './App.css';

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
}

function App() {
  const { user } = useAuth();
  
  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="main-content">
          {user && <Sidebar />}
          <main className="content-area">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <PrivateRoute>
                  {user?.role === 'instructor' ? (
                    <Navigate to="/instructor-dashboard" />
                  ) : (
                    <Navigate to="/student-dashboard" />
                  )}
                </PrivateRoute>
              } />
              
              <Route path="/student-dashboard" element={
                <PrivateRoute roles={['student']}>
                  <StudentDashboard />
                </PrivateRoute>
              } />
              
              <Route path="/instructor-dashboard" element={
                <PrivateRoute roles={['instructor']}>
                  <InstructorDashboard />
                </PrivateRoute>
              } />
              
              <Route path="/courses" element={
                <PrivateRoute>
                  <CourseList />
                </PrivateRoute>
              } />
              
              <Route path="/courses/:id" element={
                <PrivateRoute>
                  <CourseDetail />
                </PrivateRoute>
              } />
              
              <Route path="/lessons/:id" element={
                <PrivateRoute>
                  <LessonDetail />
                </PrivateRoute>
              } />
              
              <Route path="/quizzes/:id" element={
                <PrivateRoute>
                  <QuizDetail />
                </PrivateRoute>
              } />
              
              <Route path="/progress" element={
                <PrivateRoute>
                  <ProgressTracking />
                </PrivateRoute>
              } />
              
              <Route path="/certificates" element={
                <PrivateRoute>
                  <Certificates />
                </PrivateRoute>
              } />
              
              {/* Instructor-only Routes */}
              <Route path="/instructor/courses" element={
                <PrivateRoute roles={['instructor']}>
                  <InstructorCourses />
                </PrivateRoute>
              } />
              
              <Route path="/instructor/progress-reports" element={
                <PrivateRoute roles={['instructor']}>
                  <StudentProgressReport />
                </PrivateRoute>
              } />
              
              <Route path="/courses/:id/analytics" element={
                <PrivateRoute roles={['instructor']}>
                  <CourseAnalytics />
                </PrivateRoute>
              } />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
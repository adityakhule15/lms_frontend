import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { lessonAPI, quizAPI } from '../../services/api';
import { FiCheckCircle, FiClock, FiBook, FiArrowLeft } from 'react-icons/fi';

const LessonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    fetchLessonDetails();
  }, [id]);

  const fetchLessonDetails = async () => {
    try {
      setLoading(true);
      const response = await lessonAPI.getLesson(id);
      setLesson(response.data);
    } catch (err) {
      setError('Failed to load lesson details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (lesson.quiz && !lesson.quiz.passed && lesson.quiz.attempts_remaining > 0) {
      alert('You must pass the quiz before marking this lesson as complete.');
      return;
    }

    try {
      setMarkingComplete(true);
      await lessonAPI.markComplete(id);
      alert('Lesson marked as complete!');
      fetchLessonDetails(); // Refresh lesson data
      
      // Navigate to next lesson or back to course
      if (lesson.course?.next_lesson) {
        navigate(`/lessons/${lesson.course.next_lesson.id}`);
      }
    } catch (err) {
      alert('Failed to mark lesson as complete');
    } finally {
      setMarkingComplete(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading lesson...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!lesson) {
    return <div>Lesson not found</div>;
  }

  return (
    <div className="container">
      <div className="card">
        {/* Lesson Header */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                {/* <Link to={`/courses/${lesson.course?.id}`} className="btn btn-sm btn-outline">
                  <FiArrowLeft /> Back to Course
                </Link> */}
                <span style={{ color: '#6b7280' }}>
                  Lesson {lesson.order} • {lesson.course?.title}
                </span>
              </div>
              <h1>{lesson.title}</h1>
              <p style={{ color: '#6b7280', marginBottom: '15px' }}>{lesson.description}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              {lesson.progress?.completed && (
                <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FiCheckCircle />
                  <span>Completed</span>
                </div>
              )}
            </div>
          </div>

          {/* Lesson Metadata */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FiClock />
              <span>{lesson.duration_minutes} minutes</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FiBook />
              <span>{lesson.content_type}</span>
            </div>
            {lesson.quiz && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>Quiz: {lesson.quiz.attempts_remaining} attempts remaining</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Status */}
        {lesson.progress && (
          <div className="card" style={{ marginBottom: '20px', backgroundColor: '#f0f9ff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4>Your Progress</h4>
                <p>
                  {lesson.progress.completed ? 'Completed on ' : 'Last accessed '}
                  {new Date(lesson.progress.last_accessed).toLocaleDateString()}
                </p>
              </div>
              {!lesson.progress.completed && (
                <button
                  className="btn btn-success"
                  onClick={handleMarkComplete}
                  disabled={markingComplete}
                >
                  {markingComplete ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    'Mark as Complete'
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Lesson Content */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Lesson Content</h3>
          {lesson.content_type === 'video' && lesson.video_url ? (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                <iframe
                  src={lesson.video_url.replace('watch?v=', 'embed/')}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={lesson.title}
                ></iframe>
              </div>
            </div>
          ) : (
            <div className="lesson-content" style={{ lineHeight: '1.6' }}>
              {lesson.content.split('\n').map((paragraph, index) => (
                <p key={index} style={{ marginBottom: '15px' }}>
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {lesson.attachment && (
            <div style={{ marginTop: '20px' }}>
              <h4>Attachments</h4>
              <a
                href={lesson.attachment}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                Download Attachment
              </a>
            </div>
          )}
        </div>

        {/* Quiz Section */}
        {lesson.quiz && (
          <div className="card">
            <h3>Quiz</h3>
            <div style={{ marginBottom: '20px' }}>
              <h4>{lesson.quiz.title}</h4>
              <p>{lesson.quiz.description}</p>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <div>
                  <strong>Passing Score:</strong> {lesson.quiz.passing_score}%
                </div>
                <div>
                  <strong>Time Limit:</strong> {lesson.quiz.time_limit_minutes} minutes
                </div>
                <div>
                  <strong>Attempts Remaining:</strong> {lesson.quiz.attempts_remaining}
                </div>
                {lesson.quiz.best_score && (
                  <div>
                    <strong>Best Score:</strong> {lesson.quiz.best_score}%
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Link
                to={`/quizzes/${lesson.quiz.id}`}
                className="btn btn-primary"
                disabled={lesson.quiz.attempts_remaining === 0}
              >
                {lesson.quiz.attempts_remaining === 0
                  ? 'No Attempts Remaining'
                  : 'Take Quiz'}
              </Link>
              <Link
                to={`/quiz-attempts/quiz/${lesson.quiz.id}/history`}
                className="btn btn-outline"
              >
                View Attempt History
              </Link>
            </div>

            {lesson.quiz.passed && (
              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#d1fae5', borderRadius: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiCheckCircle size={24} color="#10b981" />
                  <div>
                    <strong>Quiz passed!</strong>
                    <p>You can now mark this lesson as complete.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
          <div>
            {lesson.previous_lesson && (
              <Link to={`/lessons/${lesson.previous_lesson.id}`} className="btn btn-outline">
                ← Previous Lesson
              </Link>
            )}
          </div>
          <div>
            {lesson.next_lesson && (
              <Link to={`/lessons/${lesson.next_lesson.id}`} className="btn btn-primary">
                Next Lesson →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;

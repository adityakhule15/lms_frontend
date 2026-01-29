import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quizAPI } from '../../services/api';
import { FiClock, FiAlertCircle } from 'react-icons/fi';

const QuizDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetchQuizDetails();
  }, [id]);

  useEffect(() => {
    let timer;
    if (quizStarted && quiz?.time_limit_minutes && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 60000); // Update every minute
    }
    return () => clearInterval(timer);
  }, [quizStarted, timeLeft]);

  const fetchQuizDetails = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getQuiz(id);
      setQuiz(response.data);
      setTimeLeft(response.data.time_limit_minutes);
      // In a real app, you would fetch questions here
      // For now, we'll use mock questions
      setQuestions(generateMockQuestions());
    } catch (err) {
      setError('Failed to load quiz details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateMockQuestions = () => {
    return [
      {
        id: 1,
        question_text: "What is the output of print(2 + 3)?",
        option_a: "5",
        option_b: "23",
        option_c: "Error",
        option_d: "None",
        correct_answer: "A",
        points: 1,
      },
      {
        id: 2,
        question_text: "How do you define a function in Python?",
        option_a: "function my_func():",
        option_b: "def my_func():",
        option_c: "define my_func():",
        option_d: "func my_func():",
        correct_answer: "B",
        points: 1,
      },
      {
        id: 3,
        question_text: "Which of the following is a mutable data type?",
        option_a: "Tuple",
        option_b: "String",
        option_c: "List",
        option_d: "Integer",
        correct_answer: "C",
        points: 1,
      },
    ];
  };

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const goToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
      question_id: parseInt(questionId),
      answer,
    }));

    if (answersArray.length < questions.length) {
      if (!window.confirm('You have unanswered questions. Submit anyway?')) {
        return;
      }
    }

    try {
      setSubmitting(true);
      const response = await quizAPI.submitQuizAttempt(id, answersArray);
      setResults(response.data);
      setQuizCompleted(true);
    } catch (err) {
      alert('Failed to submit quiz: ' + (err.response?.data?.error || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return <div className="loading">Loading quiz...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!quiz) {
    return <div>Quiz not found</div>;
  }

  if (quiz.attempts_remaining === 0) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <FiAlertCircle size={48} style={{ color: '#ef4444', marginBottom: '20px' }} />
          <h2>No Attempts Remaining</h2>
          <p>You have used all {quiz.max_attempts} attempts for this quiz.</p>
          <p>Your best score: {quiz.best_score || 'N/A'}%</p>
          <div style={{ marginTop: '20px' }}>
            <Link to={`/lessons/${quiz.lesson?.id}`} className="btn btn-outline">
              Return to Lesson
            </Link>
            <Link to={`/quiz-attempts/quiz/${id}/history`} className="btn btn-primary" style={{ marginLeft: '10px' }}>
              View Attempt History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="container">
        <div className="card">
          <h2>{quiz.title}</h2>
          <p>{quiz.description}</p>
          
          <div className="card" style={{ backgroundColor: '#f3f4f6', margin: '20px 0' }}>
            <h3>Quiz Instructions</h3>
            <p>{quiz.instructions}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
              <div>
                <strong>Passing Score:</strong>
                <div>{quiz.passing_score}%</div>
              </div>
              <div>
                <strong>Time Limit:</strong>
                <div>{quiz.time_limit_minutes ? formatTime(quiz.time_limit_minutes) : 'No limit'}</div>
              </div>
              <div>
                <strong>Questions:</strong>
                <div>{questions.length}</div>
              </div>
              <div>
                <strong>Attempts Remaining:</strong>
                <div>{quiz.attempts_remaining} of {quiz.max_attempts}</div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button className="btn btn-primary btn-lg" onClick={startQuiz}>
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted && results) {
    return (
      <div className="container">
        <div className="card">
          <h2>Quiz Results</h2>
          
          <div className="card" style={{ 
            backgroundColor: results.passed ? '#d1fae5' : '#fee2e2',
            margin: '20px 0',
            textAlign: 'center',
            padding: '30px'
          }}>
            <h3 style={{ color: results.passed ? '#065f46' : '#991b1b' }}>
              {results.passed ? '🎉 Quiz Passed!' : '❌ Quiz Not Passed'}
            </h3>
            <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '20px 0' }}>
              {results.score}%
            </div>
            <p>
              You answered {results.correct_answers} out of {results.total_questions} questions correctly.
            </p>
            <p>
              Attempt {results.attempt_number} of {quiz.max_attempts} • {results.remaining_attempts} attempts remaining
            </p>
          </div>

          <div style={{ marginTop: '30px' }}>
            <h3>Detailed Results</h3>
            {results.detailed_results?.map((result, index) => (
              <div key={index} className="card" style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <strong>Question {index + 1}:</strong> {result.question_text}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: result.is_correct ? '#d1fae5' : '#fee2e2',
                      color: result.is_correct ? '#065f46' : '#991b1b',
                      fontSize: '14px',
                    }}>
                      {result.is_correct ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <p>
                    <strong>Your answer:</strong> {result.user_answer}
                    {!result.is_correct && (
                      <>
                        <br />
                        <strong>Correct answer:</strong> {result.correct_answer}
                      </>
                    )}
                  </p>
                  {result.explanation && (
                    <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
                      {result.explanation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
            <Link to={`/lessons/${quiz.lesson?.id}`} className="btn btn-outline">
              Return to Lesson
            </Link>
            <div>
              <Link to={`/quiz-attempts/quiz/${id}/history`} className="btn btn-outline" style={{ marginRight: '10px' }}>
                View All Attempts
              </Link>
              {results.remaining_attempts > 0 && !results.passed && (
                <button className="btn btn-primary" onClick={() => window.location.reload()}>
                  Retake Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>{quiz.title}</h2>
          {quiz.time_limit_minutes && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444' }}>
              <FiClock />
              <strong>Time Left: {formatTime(timeLeft)}</strong>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="question-card">
          <h3 style={{ marginBottom: '20px' }}>
            Question {currentQuestion + 1}: {currentQuestionData.question_text}
          </h3>

          <div className="options-list">
            {['A', 'B', 'C', 'D'].map((option) => {
              const optionText = currentQuestionData[`option_${option.toLowerCase()}`];
              if (!optionText) return null;

              return (
                <div
                  key={option}
                  className={`option-item ${
                    answers[currentQuestionData.id] === option ? 'selected' : ''
                  }`}
                  onClick={() => handleAnswerSelect(currentQuestionData.id, option)}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: '2px solid #d1d5db',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '10px',
                        backgroundColor: answers[currentQuestionData.id] === option ? '#4f46e5' : 'transparent',
                        borderColor: answers[currentQuestionData.id] === option ? '#4f46e5' : '#d1d5db',
                        color: answers[currentQuestionData.id] === option ? 'white' : 'inherit',
                      }}
                    >
                      {option}
                    </div>
                    <span>{optionText}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
          <button
            className="btn btn-outline"
            onClick={goToPreviousQuestion}
            disabled={currentQuestion === 0}
          >
            ← Previous
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            {currentQuestion < questions.length - 1 ? (
              <button className="btn btn-primary" onClick={goToNextQuestion}>
                Next Question →
              </button>
            ) : (
              <button
                className="btn btn-success"
                onClick={handleSubmitQuiz}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            )}
          </div>
        </div>

        {/* Question Navigation */}
        <div style={{ marginTop: '30px' }}>
          <h4>Questions</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {questions.map((_, index) => (
              <button
                key={index}
                className="btn btn-sm"
                style={{
                  backgroundColor: currentQuestion === index ? '#4f46e5' : answers[questions[index].id] ? '#10b981' : '#e5e7eb',
                  color: currentQuestion === index || answers[questions[index].id] ? 'white' : '#374151',
                }}
                onClick={() => setCurrentQuestion(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDetail;

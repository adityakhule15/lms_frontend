import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { FiUser, FiLock, FiBook, FiUserCheck } from 'react-icons/fi';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    
    const result = await login(data.username, data.password);
    
    if (result.success) {
      navigate(result.data.role === 'instructor' ? '/instructor-dashboard' : '/student-dashboard');
    } else {
      setServerError(result.error?.detail || 'Invalid credentials');
    }
    
    setLoading(false);
  };

  // Renamed from useDemoCredentials to setDemoCredentials
  const setDemoCredentials = (type) => {
    if (type === 'instructor') {
      setValue('username', 'Aditya');
      setValue('password', 'Aditya15@');
    } else if (type === 'student') {
      setValue('username', 'Student');
      setValue('password', 'Student123');
    }
    setServerError('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>

        {/* Demo Credentials Section */}
        <div style={styles.demoSection}>
          <h3 style={styles.demoTitle}>Quick Login (Demo)</h3>
          <p style={styles.demoSubtitle}>Try out the platform with demo credentials:</p>
          
          <div style={styles.demoButtons}>
            <button
              type="button"
              style={styles.instructorDemoButton}
              onClick={() => setDemoCredentials('instructor')}
              disabled={loading}
            >
              <div style={styles.demoButtonContent}>
                <FiBook size={20} style={styles.demoIcon} />
                <div>
                  <div style={styles.demoRole}>Instructor Account</div>
                  <div style={styles.demoCreds}>Aditya / Aditya15@</div>
                </div>
              </div>
            </button>
            
            <button
              type="button"
              style={styles.studentDemoButton}
              onClick={() => setDemoCredentials('student')}
              disabled={loading}
            >
              <div style={styles.demoButtonContent}>
                <FiUserCheck size={20} style={styles.demoIcon} />
                <div>
                  <div style={styles.demoRole}>Student Account</div>
                  <div style={styles.demoCreds}>Student / Student123</div>
                </div>
              </div>
            </button>
          </div>
          
          <div style={styles.divider}>
            <span style={styles.dividerText}>or sign in manually</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>
              <FiUser style={styles.inputIcon} />
              Username
            </label>
            <input
              type="text"
              style={{
                ...styles.input,
                ...(errors.username ? styles.inputError : {})
              }}
              placeholder="Enter your username"
              {...register('username', { required: 'Username is required' })}
            />
            {errors.username && (
              <span style={styles.errorMessage}>{errors.username.message}</span>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>
              <FiLock style={styles.inputIcon} />
              Password
            </label>
            <input
              type="password"
              style={{
                ...styles.input,
                ...(errors.password ? styles.inputError : {})
              }}
              placeholder="Enter your password"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && (
              <span style={styles.errorMessage}>{errors.password.message}</span>
            )}
          </div>

          {serverError && (
            <div style={styles.serverError}>
              <span style={styles.errorIcon}>!</span>
              {serverError}
            </div>
          )}

          <button 
            type="submit" 
            style={styles.submitButton}
            disabled={loading}
          >
            {loading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                Signing in...
              </div>
            ) : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.link}>
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Styles (same as before)
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0,
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '1rem',
    margin: 0,
  },
  demoSection: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '30px',
    border: '1px solid #e2e8f0',
  },
  demoTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 8px 0',
    textAlign: 'center',
  },
  demoSubtitle: {
    color: '#64748b',
    fontSize: '0.875rem',
    textAlign: 'center',
    margin: '0 0 20px 0',
  },
  demoButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },
  instructorDemoButton: {
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    textAlign: 'left',
  },
  studentDemoButton: {
    background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    textAlign: 'left',
  },
  demoButtonContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  demoIcon: {
    flexShrink: 0,
  },
  demoRole: {
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  demoCreds: {
    fontSize: '0.75rem',
    opacity: 0.9,
    fontFamily: 'monospace',
    marginTop: '2px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '0.875rem',
    margin: '10px 0',
  },
  dividerText: {
    padding: '0 10px',
    background: '#f8fafc',
    flex: 'none',
  },
  form: {
    marginBottom: '20px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  formLabel: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  inputIcon: {
    color: '#6b7280',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '1rem',
    lineHeight: '1.5',
    backgroundColor: 'white',
    transition: 'border-color 0.2s',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  errorMessage: {
    color: '#dc2626',
    fontSize: '0.875rem',
    marginTop: '4px',
    display: 'block',
  },
  serverError: {
    background: '#fef2f2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '0.875rem',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  errorIcon: {
    width: '20px',
    height: '20px',
    background: '#dc2626',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  submitButton: {
    width: '100%',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    color: 'white',
    border: 'none',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #ffffff',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  footer: {
    textAlign: 'center',
    paddingTop: '20px',
    borderTop: '1px solid #e5e7eb',
  },
  footerText: {
    color: '#6b7280',
    fontSize: '0.875rem',
    margin: 0,
  },
  link: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: '600',
  },
};

// Add global animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  button:active:not(:disabled) {
    transform: translateY(0);
  }
`;
document.head.appendChild(styleSheet);

export default Login;
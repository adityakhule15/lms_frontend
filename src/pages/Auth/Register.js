import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    setServerErrors({});
    
    const result = await registerUser(data);
    
    if (result.success) {
      navigate(result.data.role === 'instructor' ? '/instructor-dashboard' : '/student-dashboard');
    } else {
      setServerErrors(result.error || {});
    }
    
    setLoading(false);
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '500px', margin: '50px auto' }}>
        <h2>Register</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-row" style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>First Name</label>
              <input
                type="text"
                className="form-control"
                {...register('first_name')}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Last Name</label>
              <input
                type="text"
                className="form-control"
                {...register('last_name')}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              className="form-control"
              {...register('username', { required: 'Username is required' })}
            />
            {errors.username && (
              <span className="error-message">{errors.username.message}</span>
            )}
            {serverErrors.username && (
              <span className="error-message">{serverErrors.username.join(', ')}</span>
            )}
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              className="form-control"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
            {serverErrors.email && (
              <span className="error-message">{serverErrors.email.join(', ')}</span>
            )}
          </div>

          <div className="form-group">
            <label>Role *</label>
            <select
              className="form-control"
              {...register('role', { required: 'Role is required' })}
            >
              <option value="">Select Role</option>
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
            </select>
            {errors.role && (
              <span className="error-message">{errors.role.message}</span>
            )}
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              className="form-control"
              rows="3"
              {...register('bio')}
            ></textarea>
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              className="form-control"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
            />
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
            {serverErrors.password && (
              <span className="error-message">{serverErrors.password.join(', ')}</span>
            )}
          </div>

          <div className="form-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              className="form-control"
              {...register('password2', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match',
              })}
            />
            {errors.password2 && (
              <span className="error-message">{errors.password2.message}</span>
            )}
            {serverErrors.password2 && (
              <span className="error-message">{serverErrors.password2.join(', ')}</span>
            )}
          </div>

          {serverErrors.non_field_errors && (
            <div className="error-message" style={{ marginBottom: '15px' }}>
              {serverErrors.non_field_errors.join(', ')}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="loading-spinner"></span> : 'Register'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p>
            Already have an account?{' '}
            <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

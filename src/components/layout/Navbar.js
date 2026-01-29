import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    // Dispatch event to notify sidebar
    window.dispatchEvent(new CustomEvent('toggleSidebar', { detail: !sidebarOpen }));
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.navbarContent}>
        {/* Left section with hamburger and brand */}
        <div style={styles.navbarLeft}>
          {isMobile && (
            <button 
              onClick={toggleSidebar}
              style={styles.menuButton}
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          )}
          <Link to="/" style={styles.brand}>
            <span style={styles.brandText}>E-Learning Platform</span>
          </Link>
        </div>

        {/* Right section with user info and actions */}
        <div style={styles.navbarRight}>
          {user ? (
            <div style={styles.userSection}>
              {!isMobile && (
                <div style={styles.userInfo}>
                  {/* <div style={styles.userAvatar}>
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div style={styles.userDetails}>
                    <span style={styles.username}>{user.username}</span>
                    <span style={styles.userRole}>{user.role}</span>
                  </div> */}
                </div>
              )}
              {/* <button 
                onClick={handleLogout}
                style={styles.logoutButton}
                title="Logout"
              >
                <FiLogOut size={20} />
                {!isMobile && <span style={{ marginLeft: '8px' }}>Logout</span>}
              </button> */}
            </div>
          ) : (
            <div style={styles.authButtons}>
              <Link to="/login" style={styles.loginButton}>
                Login
              </Link>
              <Link to="/register" style={styles.registerButton}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          style={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </nav>
  );
};

const styles = {
  navbar: {
    background: 'white',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  navbarContent: {
    // maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  menuButton: {
    background: 'none',
    border: 'none',
    color: '#4f46e5',
    cursor: 'pointer',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    transition: 'background-color 0.2s',
  },
  brand: {
    textDecoration: 'none',
    color: '#1f2937',
  },
  brandText: {
    fontSize: '1.25rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  navbarRight: {
    display: 'flex',
    alignItems: 'center',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  userAvatar: {
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
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  username: {
    fontWeight: '600',
    color: '#1f2937',
    fontSize: '0.875rem',
  },
  userRole: {
    color: '#6b7280',
    fontSize: '0.75rem',
    textTransform: 'capitalize',
  },
  logoutButton: {
    background: 'none',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '0.5rem 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    transition: 'background-color 0.2s',
    fontSize: '0.875rem',
  },
  authButtons: {
    display: 'flex',
    gap: '0.75rem',
  },
  loginButton: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    color: '#374151',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  registerButton: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    background: '#4f46e5',
    color: 'white',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
};

// Add hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .menu-button:hover {
    background: #f3f4f6;
  }
  
  .logout-button:hover {
    background: #f3f4f6;
    color: #dc2626;
  }
  
  .login-button:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
  
  .register-button:hover {
    background: #4338ca;
  }
`;
document.head.appendChild(styleSheet);

export default Navbar;
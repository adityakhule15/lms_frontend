import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome,
  FiBook,
  FiBarChart2,
  FiAward,
  FiUsers,
  FiLogOut,
} from 'react-icons/fi';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true); // Always open on desktop
      } else {
        setSidebarOpen(false); // Closed by default on mobile
      }
    };

    checkMobile();
    
    const handleToggleSidebar = (event) => {
      setSidebarOpen(event.detail);
    };

    const handleResize = () => {
      checkMobile();
    };

    window.addEventListener('toggleSidebar', handleToggleSidebar);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('toggleSidebar', handleToggleSidebar);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (isMobile) setSidebarOpen(false);
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
      // Notify navbar to update button state
      window.dispatchEvent(new CustomEvent('toggleSidebar', { detail: false }));
    }
  };

  const studentMenu = [
    { path: '/student-dashboard', icon: <FiHome />, label: 'Dashboard' },
    { path: '/courses', icon: <FiBook />, label: 'Browse Courses' },
    { path: '/progress', icon: <FiBarChart2 />, label: 'My Progress' },
    { path: '/certificates', icon: <FiAward />, label: 'Certificates' },
  ];

  const instructorMenu = [
    { path: '/instructor-dashboard', icon: <FiHome />, label: 'Dashboard' },
    { path: '/instructor/courses', icon: <FiBook />, label: 'My Courses' },
    { path: '/instructor/progress-reports', icon: <FiUsers />, label: 'Student Progress' },
  ];

  const menuItems = user?.role === 'instructor' ? instructorMenu : studentMenu;

  // Don't render sidebar if mobile and closed
  if (isMobile && !sidebarOpen) {
    return null;
  }

  return (
    <div style={{
      ...styles.sidebar,
      position: isMobile ? 'fixed' : 'sticky',
      top: isMobile ? '64px' : 0,
      left: 0,
      bottom: 0,
      width: isMobile ? '280px' : '250px',
      transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
      transition: isMobile ? 'transform 0.3s ease' : 'none',
      zIndex: 998,
      boxShadow: isMobile ? '2px 0 10px rgba(0, 0, 0, 0.1)' : 'none',
    }}>
      {/* User Info - Only show on desktop */}
      {user && !isMobile && (
        <div style={styles.userProfile}>
          <div style={styles.userAvatar}>
            {user.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div style={styles.userInfo}>
            <div style={styles.username}>{user.username}</div>
            <div style={styles.userRole}>{user.role}</div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav style={styles.navigation}>
        <ul style={styles.menuList}>
          {menuItems.map((item) => (
            <li key={item.path} style={styles.menuItem}>
              <NavLink
                to={item.path}
                style={({ isActive }) => ({
                  ...styles.menuLink,
                  ...(isActive ? styles.activeMenuLink : {})
                })}
                onClick={handleLinkClick}
              >
                <span style={styles.menuIcon}>{item.icon}</span>
                <span style={styles.menuLabel}>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Logout Button - Show on both mobile and desktop */}
        {user && (
          <div style={styles.logoutSection}>
            <button 
              onClick={handleLogout}
              style={styles.logoutButton}
            >
              <FiLogOut style={styles.logoutIcon} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </nav>
    </div>
  );
};

const styles = {
  sidebar: {
    height: 'calc(100vh - 64px)',
    background: 'white',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  userProfile: {
    padding: '1.5rem 1rem',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '1.25rem',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  username: {
    fontWeight: '600',
    color: '#1f2937',
    fontSize: '1rem',
  },
  userRole: {
    color: '#6b7280',
    fontSize: '0.875rem',
    textTransform: 'capitalize',
  },
  navigation: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem 0',
  },
  menuList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  menuItem: {
    marginBottom: '0.25rem',
  },
  menuLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 1rem',
    color: '#6b7280',
    textDecoration: 'none',
    transition: 'all 0.2s',
  },
  activeMenuLink: {
    background: 'linear-gradient(90deg, #e0e7ff, #c7d2fe)',
    color: '#4f46e5',
    fontWeight: '500',
    borderRight: '3px solid #4f46e5',
  },
  menuIcon: {
    fontSize: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
  },
  menuLabel: {
    fontSize: '0.875rem',
  },
  logoutSection: {
    padding: '1rem',
    borderTop: '1px solid #e5e7eb',
    marginTop: 'auto',
  },
  logoutButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 1rem',
    background: 'none',
    border: 'none',
    color: '#dc2626',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    borderRadius: '6px',
    transition: 'background-color 0.2s',
  },
  logoutIcon: {
    fontSize: '1.25rem',
  },
};

// Add hover effects
const sidebarStyles = document.createElement('style');
sidebarStyles.textContent = `
  .menu-link:hover:not(.active) {
    background: #f9fafb;
    color: #374151;
  }
  
  .logout-button:hover {
    background: #fef2f2;
  }
`;
document.head.appendChild(sidebarStyles);

export default Sidebar;
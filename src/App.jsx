import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import { Sun, Moon, CheckCircle, Info, AlertTriangle, XCircle, Sparkles, ListTodo, LogOut } from 'lucide-react';

const App = () => {
  // Theme state: defaults to dark for premium look
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  // Authentication states
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || '';
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  // Navigation tab state: 'tasks' or 'insights'
  const [activeTab, setActiveTab] = useState('tasks');
  
  // Toast notifications list state
  const [toasts, setToasts] = useState([]);

  // Sync theme with HTML attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle theme utility
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Toast utility function
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 3200);
  };

  // Auth Success handler
  const handleAuthSuccess = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Logout handler
  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    addToast('Logged out successfully', 'info');
  };

  // Helper to render correct toast icons
  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} className="text-success" />;
      case 'danger':
        return <XCircle size={18} className="text-danger" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-warning" />;
      default:
        return <Info size={18} className="text-primary" />;
    }
  };

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <header className="app-header">
        <div className="brand-section">
          <img 
            src="/walrus.jpeg" 
            alt="Walrus Logo" 
            style={{ 
              width: '2.5rem', 
              height: '2.5rem', 
              borderRadius: 'var(--radius-md)', 
              objectFit: 'cover',
              boxShadow: 'var(--shadow-glow)'
            }} 
          />
          <div>
            <h1 className="app-title" style={{ fontSize: '1.6rem', fontWeight: 800 }}>Walrus</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              AI-Powered Productivity Hub
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Sub Navigation Tabs (Only visible when logged in) */}
          {token && (
            <div className="nav-tabs">
              <button 
                className={`nav-tab ${activeTab === 'tasks' ? 'active' : ''}`}
                onClick={() => setActiveTab('tasks')}
                title="View your tasks and list suggestions"
              >
                <ListTodo size={15} />
                <span>Tasks</span>
              </button>
              <button 
                className={`nav-tab ${activeTab === 'insights' ? 'active' : ''}`}
                onClick={() => setActiveTab('insights')}
                title="View AI priority recommendations and productivity dashboard"
              >
                <Sparkles size={15} />
                <span>AI Coach</span>
              </button>
            </div>
          )}

          {/* Light/Dark Toggle */}
          <button 
            className="btn-icon" 
            onClick={toggleTheme} 
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            style={{ width: '2.5rem', height: '2.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Logout Button (Only visible when logged in) */}
          {token && (
            <button 
              className="btn btn-secondary" 
              onClick={handleLogout} 
              title="Logout from Walrus"
              style={{ height: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0 1rem' }}
            >
              <LogOut size={15} />
              <span style={{ fontSize: '0.85rem' }}>Logout</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Core View Area */}
      {token ? (
        <Dashboard token={token} activeTab={activeTab} addToast={addToast} />
      ) : (
        <Auth onAuthSuccess={handleAuthSuccess} addToast={addToast} />
      )}

      {/* Toast Banners Overlay */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {getToastIcon(toast.type)}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;

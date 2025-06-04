import React, { useContext, useState, useEffect, Suspense, lazy } from 'react';
import { AppContext, AppProvider } from './AppProvider/AppProvider';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import Dashboard from './pages/Dashboard/Dashboard'; // Import Dashboard

// --- Reusable UI Components (Placeholders - to be created later) ---
const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { error, loading } = useContext(AppContext); // Access error and loading state

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ username, password });
  };

  return (
    <div className="login-screen">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>
    </div>
  );
};

// --- Main Layout Components (Placeholders) ---
const Sidebar = ({ user, onNavigate, onLogout, currentPage }) => (
  <div className="sidebar">
    <div className="user-info">
      <h3>{user?.name || 'User'}</h3>
      <p>{user?.id || 'Faculty ID'}</p>
    </div>
    <nav>
      <ul>
        {['Dashboard', 'AcademicScheduling', 'CurriculumManagement', 'FacultyManagement', 'StudentManagement', 'AttendanceManagement', 'AssessmentsManagement', 'Reports', 'AIToolkit', 'DocumentGenerator', 'AlumniManagement'].map(item => (
          <li key={item} className={currentPage === item ? 'active' : ''}>
            <button onClick={() => onNavigate(item)}>{item.replace(/([A-Z])/g, ' $1').trim()}</button>
          </li>
        ))}
      </ul>
    </nav>
    <button onClick={onLogout} className="logout-button">Logout</button>
  </div>
);

const MainContentArea = ({ currentPage }) => {
  let PageComponent;

  switch (currentPage) {
    case 'Dashboard':
      PageComponent = Dashboard;
      break;
    // Add cases for other pages here as they are created
    // e.g., case 'AcademicScheduling': PageComponent = AcademicSchedulingComponent; break;
    default:
      PageComponent = () => <div>Displaying: {currentPage.replace(/([A-Z])/g, ' $1').trim()} (Placeholder)</div>;
  }

  return (
    <div className="main-content">
      <Suspense fallback={<LoadingSpinner />}>
        {PageComponent ? <PageComponent /> : <div>Page not found</div>}
      </Suspense>
    </div>
  );
};


// --- App Component ---
const AppContent = () => {
  const { isAuthenticated, currentUser, loading, error, login, logout } = useContext(AppContext);
  const [currentPage, setCurrentPage] = useState('Dashboard'); // Default page

  // PDF export libraries - to be loaded dynamically if needed by a component
  // For now, just placeholders for the dynamic import logic
  useEffect(() => {
    // Example: Dynamically load html2canvas and jsPDF when a certain page is active
    // if (currentPage === 'AcademicScheduling' || currentPage === 'CurriculumManagement') {
    //   import('html2canvas').then(html2canvas => {
    //     window.html2canvas = html2canvas.default;
    //   });
    //   import('jspdf').then(jspdf => {
    //     window.jsPDF = jspdf.default;
    //   });
    // }
  }, [currentPage]);


  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !isAuthenticated) {
    // Show login screen with error if auth fails and there's an error
    // Or a general error display if it's not an auth issue but still not logged in
    return <LoginScreen onLogin={login} />;
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} />;
  }

  return (
    <div className="app-layout">
      <Sidebar user={currentUser} onNavigate={setCurrentPage} onLogout={logout} currentPage={currentPage} />
      <MainContentArea currentPage={currentPage} />
    </div>
  );
};

// Main App component wrapped with Provider
const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
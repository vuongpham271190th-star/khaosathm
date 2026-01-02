import React, { useState, useCallback, useEffect } from 'react';
import type { Review, View, LoggedInUser, IPLog, Theme } from './types';
import Header from './components/Header';
import ParentView from './components/ParentView';
import AdminView from './components/AdminView';
import LoginView from './components/LoginView';
import { api } from './services/api';
import useLocalStorage from './hooks/useLocalStorage';
import { LOCALES } from './constants';


const App: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ipLogs, setIpLogs] = useState<IPLog[]>([]);
  const [currentView, setCurrentView] = useLocalStorage<View>('currentView', 'parent');
  const [loading, setLoading] = useState(true);
  const [loggedInUser, setLoggedInUser] = useLocalStorage<LoggedInUser | null>('loggedInUser', null);
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');
  const t = LOCALES.vi;

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedReviews = await api.getReviews();
      setReviews(fetchedReviews);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchIpLogs = useCallback(async () => {
    try {
        const fetchedLogs = await api.getIpLogs();
        setIpLogs(fetchedLogs);
    } catch (error) {
        console.error("Failed to fetch IP logs", error);
    }
  }, []);

  useEffect(() => {
    if (currentView === 'admin' && loggedInUser) {
      fetchReviews();
      if (loggedInUser.role === 'superadmin') {
          fetchIpLogs();
      }
    }
  }, [currentView, loggedInUser, fetchReviews, fetchIpLogs]);
  
  const handleLogin = (user: LoggedInUser) => {
    setLoggedInUser(user);
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setCurrentView('parent'); // Switch to parent view on logout
  };

  const handleResetReviews = async () => {
    try {
      await api.deleteAllReviews();
      setReviews([]); // Clear local state immediately
    } catch (error) {
      console.error("Failed to delete all reviews", error);
      // Optionally show an error to the user
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm(t.deleteReviewConfirmation)) {
      try {
        await api.deleteReview(reviewId);
        setReviews(prevReviews => prevReviews.filter(r => r.id !== reviewId));
      } catch (error) {
        console.error("Failed to delete review", error);
        alert(t.formErrors.apiError);
      }
    }
  };
  
  const handleDeleteIpLog = async (logId: string) => {
    if (window.confirm(t.deleteIpLogConfirmation)) {
      try {
        await api.deleteIpLog(logId);
        setIpLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
      } catch (error) {
        console.error("Failed to delete IP log", error);
        alert(t.formErrors.apiError);
      }
    }
  };


  const renderMainContent = () => {
    if (currentView === 'parent') {
      return <ParentView />;
    }
    if (currentView === 'admin') {
      if (loggedInUser) {
        return <AdminView user={loggedInUser} reviews={reviews} ipLogs={ipLogs} loading={loading} onReset={handleResetReviews} onDeleteReview={handleDeleteReview} onDeleteIpLog={handleDeleteIpLog}/>;
      } else {
        return <LoginView onLogin={handleLogin} />;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header 
        currentView={currentView}
        setCurrentView={setCurrentView}
        loggedInUser={loggedInUser}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
      <main>
        {renderMainContent()}
      </main>
    </div>
  );
};

export default App;

import React from 'react';
import type { View, LoggedInUser, Theme } from '../types';
import { LOCALES } from '../constants';
import { SunIcon, MoonIcon } from './icons';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  loggedInUser: LoggedInUser | null;
  onLogout: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, loggedInUser, onLogout, theme, onToggleTheme }) => {
  const t = LOCALES.vi;
  
  const ToggleButton: React.FC<{
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }> = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white ${
        active
          ? 'bg-indigo-500 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {children}
    </button>
  );

  return (
    <header className="bg-gray-800 dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
            <div className="w-1/3"></div>
            <div className="flex items-center justify-center space-x-4 w-1/3">
              <div className="bg-gray-700 p-1 rounded-lg flex space-x-1">
                <ToggleButton active={currentView === 'parent'} onClick={() => setCurrentView('parent')}>
                  {t.parentView}
                </ToggleButton>
                <ToggleButton active={currentView === 'admin'} onClick={() => setCurrentView('admin')}>
                  {t.adminView}
                </ToggleButton>
              </div>
            </div>
            <div className="w-1/3 flex justify-end items-center space-x-4">
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? (
                  <MoonIcon className="h-6 w-6" />
                ) : (
                  <SunIcon className="h-6 w-6" />
                )}
              </button>

              {loggedInUser && currentView === 'admin' && (
                  <div className="flex items-center space-x-4">
                    <span className="text-white text-sm">
                      {t.welcome}, <span className="font-bold">{loggedInUser.username}</span>
                    </span>
                    <button
                      onClick={onLogout}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500"
                    >
                      {t.logoutButton}
                    </button>
                  </div>
              )}
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

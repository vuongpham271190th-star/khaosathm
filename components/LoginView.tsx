
import React, { useState } from 'react';
import { LOCALES } from '../constants';
import type { LoggedInUser } from '../types';
import { api } from '../services/api';

interface LoginViewProps {
  onLogin: (user: LoggedInUser) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const t = LOCALES.vi;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      const user = await api.login(username, password);
      if (user) {
        onLogin(user);
      } else {
        setError(t.formErrors.loginError);
      }
    } catch (err) {
      console.error("Login failed", err);
      setError(t.formErrors.apiError);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 sm:p-10">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {t.adminView}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {t.loginTitle}
          </p>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">
                  {t.username}
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder={t.username}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  {t.password}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder={t.password}
                />
              </div>
            </div>
             {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
            )}
            <div>
              <button
                type="submit"
                disabled={isLoggingIn}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 disabled:bg-indigo-400"
              >
                {isLoggingIn ? 'Đang đăng nhập...' : t.loginButton}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginView;

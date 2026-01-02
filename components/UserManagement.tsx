
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { LOCALES } from '../constants';
import type { LoggedInUser } from '../types';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<LoggedInUser[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const t = LOCALES.vi;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedUsers = await api.getUsers();
      setUsers(fetchedUsers.filter(u => u.role === 'admin'));
    } catch (e) {
      setError(t.formErrors.apiError);
    } finally {
      setLoading(false);
    }
  }, [t.formErrors.apiError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newUsername.trim() || !newPassword.trim()) {
      setError("Tên đăng nhập và mật khẩu không được để trống.");
      return;
    }
    try {
      await api.addUser(newUsername, newPassword);
      setNewUsername('');
      setNewPassword('');
      setSuccess(t.formErrors.userAddedSuccess);
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      if (err.message === "USERNAME_EXISTS") {
        setError(t.formErrors.usernameExistsError);
      } else {
        setError(t.formErrors.apiError);
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm(t.deleteAdminConfirmation)) {
      setError('');
      setSuccess('');
      try {
        await api.deleteUser(userId);
        setSuccess(t.formErrors.userDeletedSuccess);
        fetchUsers(); // Refresh the list
      } catch (e) {
        setError(t.formErrors.apiError);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t.manageAdminsTitle}</h3>
      
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      {success && <p className="mb-4 text-sm text-green-500">{success}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Add new admin form */}
        <div>
          <h4 className="font-semibold mb-2">{t.addNewAdmin}</h4>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label htmlFor="new-username" className="sr-only">{t.newUsername}</label>
              <input 
                id="new-username" 
                type="text" 
                value={newUsername} 
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder={t.newUsername}
                className="block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="new-password">{t.newPassword}</label>
              <input 
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t.newPassword}
                className="block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <button type="submit" className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors">
              {t.addAdminButton}
            </button>
          </form>
        </div>

        {/* List of admins */}
        <div>
          <h4 className="font-semibold mb-2">{t.adminList}</h4>
          {loading ? <p>Đang tải...</p> : (
            <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {users.length > 0 ? users.map(user => (
                <li key={user.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                  <span className="text-gray-800 dark:text-gray-200">{user.username}</span>
                  <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                    {t.deleteAdminButton}
                  </button>
                </li>
              )) : <p className="text-sm text-gray-500">Chưa có tài khoản admin nào.</p>}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;

import React, { useState } from 'react';
import { api } from '../services/api';
import { LOCALES } from '../constants';
import type { LoggedInUser } from '../types';

interface ChangePasswordModalProps {
  user: LoggedInUser;
  onClose: () => void;
  onSuccess: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ user, onClose, onSuccess }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const t = LOCALES.vi;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError(t.passwordsDoNotMatch);
      return;
    }
    if (newPassword.length < 6) {
        setError("Mật khẩu phải có ít nhất 6 ký tự.");
        return;
    }

    setIsSaving(true);
    try {
      await api.updatePassword(user.id, newPassword);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(t.formErrors.passwordUpdateError);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t.changePasswordModalTitle}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.newPasswordLabel}</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.confirmPasswordLabel}</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 focus:outline-none dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
              Hủy
            </button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-400">
              {isSaving ? 'Đang lưu...' : t.savePasswordButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
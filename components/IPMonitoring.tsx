import React from 'react';
import type { IPLog, LoggedInUser } from '../types';
import { LOCALES } from '../constants';

interface IPMonitoringProps {
  user: LoggedInUser;
  ipLogs: IPLog[];
  onDeleteLog: (logId: string) => void;
}

const IPMonitoring: React.FC<IPMonitoringProps> = ({ user, ipLogs, onDeleteLog }) => {
  const t = LOCALES.vi;

  const formattedDate = (dateString: string) => new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t.ipLogTitle}</h3>
      {ipLogs.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t.noBlockedLogs}</p>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {ipLogs.map((log) => (
            <div key={log.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center relative">
               {user.role === 'superadmin' && (
                <button
                  onClick={() => onDeleteLog(log.id)}
                  className="absolute top-2 right-2 p-1 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-full hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 transition-colors z-10"
                  aria-label="Xóa nhật ký"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              <div className="pr-8">
                <p className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{log.ipAddress}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Đã thử gửi cho Lớp: <span className="font-medium">{log.className}</span>
                </p>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{formattedDate(log.timestamp)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IPMonitoring;
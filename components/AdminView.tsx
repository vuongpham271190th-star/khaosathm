import React, { useState, useEffect } from 'react';
import type { Review, LoggedInUser, IPLog } from '../types';
import { LOCALES } from '../constants';
import ReviewCard from './ReviewCard';
import UserManagement from './UserManagement';
import ChangePasswordModal from './ChangePasswordModal';
import ReviewChart from './ReviewChart';
import * as XLSX from 'xlsx';
import IPMonitoring from './IPMonitoring';

interface AdminViewProps {
  user: LoggedInUser;
  reviews: Review[];
  ipLogs: IPLog[];
  loading: boolean;
  onReset: () => void;
  onDeleteReview: (reviewId: string) => void;
  onDeleteIpLog: (logId: string) => void;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center py-16">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
  </div>
);

const AdminView: React.FC<AdminViewProps> = ({ user, reviews, ipLogs, loading, onReset, onDeleteReview, onDeleteIpLog }) => {
  const [filterClass, setFilterClass] = useState('all');
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const t = LOCALES.vi;

  const sortedReviews = [...reviews].sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
  
  const uniqueClasses = Array.from(new Set(reviews.map(r => r.className))).sort();

  const filteredReviews = sortedReviews.filter(review => filterClass === 'all' || review.className === filterClass);

  const handleResetClick = () => {
    if (window.confirm(t.resetConfirmation)) {
      onReset();
    }
  };
  
  const handleExport = () => {
    const dataToExport = filteredReviews.map(review => {
      const baseData: Record<string, any> = {
        'Lớp': review.className,
        'Thời gian': new Date(review.submissionDate).toLocaleString('vi-VN'),
        'Địa chỉ IP': review.ipAddress,
        'Ý kiến khác': review.comment,
      };
      
      const ratingsData: Record<string, string> = {};
      for (const [item, level] of Object.entries(review.ratings)) {
        ratingsData[item] = level === 'satisfied' ? t.satisfied : t.unsatisfied;
      }

      return { ...baseData, ...ratingsData };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Đánh giá');
    
    XLSX.writeFile(workbook, `Danh_sach_danh_gia_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handlePasswordChangeSuccess = () => {
    alert(t.passwordChangedSuccess);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       {isChangePasswordModalOpen && (
        <ChangePasswordModal 
          user={user} 
          onClose={() => setIsChangePasswordModalOpen(false)} 
          onSuccess={handlePasswordChangeSuccess}
        />
      )}

      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">{t.adminTitle}</h2>
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            <span>{t.totalReviews} {filterClass === 'all' ? `(${t.allClasses})` : `(Lớp ${filterClass})`}:</span>
            <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400 ml-2">{filteredReviews.length}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
            <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
                <option value="all">{t.allClasses}</option>
                {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
                onClick={handleExport}
                disabled={filteredReviews.length === 0}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {t.exportExcelButton}
            </button>
            {user.role !== 'superadmin' && (
              <button
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors"
              >
                  {t.changePasswordButton}
              </button>
            )}
            {user.role === 'superadmin' && (
              <button
                  onClick={handleResetClick}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 transition-colors"
              >
                  {t.resetButton}
              </button>
            )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
            {reviews.length > 0 && (
                <div className="bg-gray-100 dark:bg-gray-900/50 rounded-lg p-4 sm:p-6 mb-8">
                     {filterClass === 'all' ? (
                        <div>
                            <h3 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">{`Biểu đồ tổng quan - ${t.allClasses}`}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {uniqueClasses.map(className => {
                                    const classReviews = reviews.filter(r => r.className === className);
                                    if (classReviews.length === 0) return null;
                                    return (
                                        <div key={className}>
                                            <ReviewChart reviews={classReviews} filterClass={className} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                         <ReviewChart reviews={filteredReviews} filterClass={filterClass} detailed />
                    )}
                </div>
            )}

            {user.role === 'superadmin' && <UserManagement />}
            
            {user.role === 'superadmin' && <IPMonitoring user={user} ipLogs={ipLogs} onDeleteLog={onDeleteIpLog} />}

            {filteredReviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                {filteredReviews.map(review => (
                    <ReviewCard key={review.id} review={review} user={user} onDelete={onDeleteReview} />
                ))}
                </div>
            ) : (
                <div className="text-center py-16">
                <p className="text-lg text-gray-500 dark:text-gray-400">{reviews.length > 0 ? `Không có đánh giá nào cho lớp ${filterClass}.` : t.noReviews}</p>
                </div>
            )}
        </>
      )}
    </div>
  );
};

export default AdminView;

import React from 'react';
import type { Review, RatingLevel, LoggedInUser } from '../types';
import { LOCALES, CLASS_TEACHER_MAP, GENERAL_RATING_ITEMS } from '../constants';

interface ReviewCardProps {
  review: Review;
  user: LoggedInUser;
  onDelete: (reviewId: string) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, user, onDelete }) => {
  const t = LOCALES.vi;

  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(review.submissionDate));

  const ratingToText = (level: RatingLevel) => {
    return level === 'satisfied' ? t.satisfied : t.unsatisfied;
  };

  const ratingToColorClass = (level: RatingLevel) => {
    return level === 'satisfied' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };
  
  // Re-create the ordered list of rating items to match the form
  const getOrderedRatingItems = () => {
    const className = review.className;
    if (className && CLASS_TEACHER_MAP[className]) {
      const classTeachers = CLASS_TEACHER_MAP[className].map(teacher => `Cô giáo ${teacher}`);
      // Filter the ordered list to only include items that actually exist in this review's ratings object
      return [...classTeachers, ...GENERAL_RATING_ITEMS].filter(item => review.ratings[item]);
    }
    // Fallback to the order from the object if class is not found (for older data)
    return Object.keys(review.ratings);
  };

  const orderedItems = getOrderedRatingItems();

  const handleDeleteClick = () => {
      onDelete(review.id);
  }


  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden transform hover:scale-105 transition-transform duration-300 relative">
       {user.role === 'superadmin' && (
         <button
          onClick={handleDeleteClick}
          className="absolute top-3 right-3 p-1.5 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-full hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 transition-colors z-10"
          aria-label="Xóa đánh giá"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
          </svg>
        </button>
      )}
      <div className="p-6">
        <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
          <p className="text-lg font-bold text-gray-800 dark:text-gray-100 pr-8">
            Lớp {review.className}
          </p>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">{formattedDate}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">IP: {review.ipAddress}</p>
          </div>
        </div>
        
        <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">{t.satisfactionRatingTitle}</h4>
        <div className="space-y-3 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
          {orderedItems.map((item) => {
              const level = review.ratings[item] as RatingLevel;
              return (
                <div key={item} className="flex justify-between items-center text-sm">
                  <p className="text-gray-600 dark:text-gray-300">{item}</p>
                  <p className={`font-bold ${ratingToColorClass(level)}`}>{ratingToText(level)}</p>
                </div>
              );
            })}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-700 dark:text-gray-200">{t.otherCommentsTitle}</h4>
          <p className="mt-2 text-gray-800 dark:text-gray-200 italic">"{review.comment}"</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
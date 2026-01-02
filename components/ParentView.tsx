import React, { useState, useEffect, useCallback } from 'react';
import type { Review, RatingLevel } from '../types';
import { CLASS_TEACHER_MAP, GENERAL_RATING_ITEMS, LOCALES, CLASSES } from '../constants';
import { api } from '../services/api';

const ParentView: React.FC = () => {
  const [className, setClassName] = useState('');
  const [ratings, setRatings] = useState<Record<string, RatingLevel>>({});
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingIp, setIsVerifyingIp] = useState(true);
  const [ipError, setIpError] = useState<string | null>(null);
  const [currentRatingItems, setCurrentRatingItems] = useState<string[]>([]);
  const [ipAddress, setIpAddress] = useState<string | null>(null);

  const t = LOCALES.vi;

  const verifyIp = useCallback(async () => {
    setIsVerifyingIp(true);
    setIpError(null);
    try {
      // Switched to a more robust service: ipwho.is
      const res = await fetch('https://ipwho.is/');
      
      if (!res.ok) {
        console.error(`IP Whois API response was not ok. Status: ${res.status}`);
        throw new Error('IP Whois API request failed');
      }

      const data = await res.json();
      
      if (!data.success) {
          console.error(`IP Whois API returned an error: ${data.message}`);
          throw new Error(data.message || 'Failed to verify IP with Whois');
      }

      setIpAddress(data.ip); // Save the IP for submission
      
      // Safely destructure security object, providing a fallback.
      const { vpn = false, proxy = false, hosting = false } = data.security || {};

      // Block if not in Vietnam OR if it's a vpn/proxy/hosting service
      if (data.country_code !== 'VN' || vpn || proxy || hosting) {
        setIpError(t.formErrors.vpnOrProxyError);
      }

    } catch (e) {
      console.error("IP Verification Process Failed:", e);
      // Default to blocking the submission if verification fails for any reason.
      setIpError('Không thể xác minh kết nối của bạn. Vui lòng thử lại sau.');
    } finally {
      setIsVerifyingIp(false);
    }
  }, [t.formErrors.vpnOrProxyError]);

  useEffect(() => {
    verifyIp();
  }, [verifyIp]);


  useEffect(() => {
    if (className && CLASS_TEACHER_MAP[className]) {
      const classTeachers = CLASS_TEACHER_MAP[className].map(teacher => `Cô giáo ${teacher}`);
      setCurrentRatingItems([...classTeachers, ...GENERAL_RATING_ITEMS]);
      setRatings({});
      setErrors(prev => ({ ...prev, rating: '' }));
    } else {
      setCurrentRatingItems([]);
    }
  }, [className]);

  const handleRatingChange = (item: string, level: RatingLevel) => {
    setRatings(prev => ({ ...prev, [item]: level }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!className) {
      newErrors.class = t.formErrors.classMissing;
    }
    if (currentRatingItems.length > 0 && (Object.keys(ratings).length !== currentRatingItems.length || currentRatingItems.some(item => !ratings[item]))) {
      newErrors.rating = t.formErrors.ratingMissing;
    }
    if (!comment.trim()) {
      newErrors.comment = t.formErrors.comment;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (validateForm() && ipAddress) {
      setIsSubmitting(true);
      const newReview: Omit<Review, 'id' | 'submissionDate'> = {
        className,
        ratings,
        comment,
        ipAddress,
      };

      try {
        await api.addReview(newReview);
        setClassName('');
        setRatings({});
        setComment('');
        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 5000);
      } catch (error: any) {
        console.error("Submission failed", error);
        if (error.message === 'IP_LIMIT_REACHED') {
          setErrors({ class: t.formErrors.ipLimitError });
        } else {
          setErrors({ api: t.formErrors.apiError });
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            {t.formTitle}
          </h2>
          <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-2 mb-4">
            {t.formDescription}
          </p>
          <p className="text-sm text-center font-semibold text-gray-700 dark:text-gray-300 mb-8">
            {t.hotline}
          </p>

          {isSubmitted && (
            <div className="bg-green-100 dark:bg-green-900 border-l-4 border-green-500 text-green-700 dark:text-green-200 p-4 mb-6 rounded-md" role="alert">
              <p className="font-bold">{t.successMessage}</p>
            </div>
          )}
          {ipError && (
            <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 mb-6 rounded-md flex flex-col items-start gap-2" role="alert">
              <p className="font-bold">{ipError}</p>
              <button 
                onClick={verifyIp}
                className="text-sm underline font-semibold hover:text-red-900 dark:hover:text-red-100 focus:outline-none"
              >
                Thử lại kết nối
              </button>
            </div>
          )}
          {errors.api && <p className="mb-4 text-sm text-red-500 text-center">{errors.api}</p>}


          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <label htmlFor="class-select" className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t.classSelectLabel} <span className="text-red-500">*</span>
              </label>
              <select
                id="class-select"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                disabled={isSubmitting || isVerifyingIp || !!ipError}
                className="block w-full pl-3 pr-10 py-2.5 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="" disabled>{t.classSelectPlaceholder}</option>
                {CLASSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.class && <p className="mt-2 text-sm text-red-500">{errors.class}</p>}
            </div>

            {className && currentRatingItems.length > 0 && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg relative p-6">
                <div className="absolute top-0 left-0 h-full w-1.5 bg-blue-500 rounded-l-md"></div>
                <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  {t.satisfactionRatingTitle} <span className="text-red-500">*</span>
                </label>

                <div className="space-y-6">
                  {currentRatingItems.map((item) => (
                    <div key={item}>
                      <span className="font-medium mb-2 block text-gray-700 dark:text-gray-300">
                        {item}
                      </span>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => handleRatingChange(item, 'unsatisfied')}
                          disabled={isSubmitting || isVerifyingIp || !!ipError}
                          className={`w-full text-center p-3 rounded-lg text-sm font-semibold border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 ${
                            ratings[item] === 'unsatisfied'
                              ? 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900/50 dark:border-red-500 dark:text-red-300'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-red-400 hover:bg-red-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:border-red-500 dark:hover:bg-red-900/30'
                          }`}
                        >
                          {t.unsatisfied}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRatingChange(item, 'satisfied')}
                          disabled={isSubmitting || isVerifyingIp || !!ipError}
                          className={`w-full text-center p-3 rounded-lg text-sm font-semibold border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 ${
                            ratings[item] === 'satisfied'
                              ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/50 dark:border-green-500 dark:text-green-300'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-green-400 hover:bg-green-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:border-green-500 dark:hover:bg-green-900/30'
                          }`}
                        >
                          {t.satisfied}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.rating && <p className="mt-4 text-sm text-red-500">{errors.rating}</p>}
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <label htmlFor="comment" className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t.otherCommentsTitle} <span className="text-red-500">*</span>
              </label>
              <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white" placeholder={t.commentPlaceholder} disabled={isSubmitting || isVerifyingIp || !!ipError}></textarea>
              {errors.comment && <p className="mt-1 text-sm text-red-500">{errors.comment}</p>}
            </div>

            <div>
              <button type="submit" disabled={isSubmitting || isVerifyingIp || !!ipError} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors duration-300 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                {isVerifyingIp ? (
                   <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {'Đang kiểm tra kết nối...'}
                  </div>
                ) : isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {'Đang gửi...'}
                  </div>
                ) : (
                  t.submitButton
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ParentView;
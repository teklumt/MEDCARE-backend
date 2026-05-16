import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, MessageSquare, Loader2 } from 'lucide-react';
import { ApiRequestError, getMyPharmacyReviews, type PharmacyReviewItem } from '@/lib/api';

interface ViewReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewReviewsModal({ isOpen, onClose }: ViewReviewsModalProps) {
  const [reviews, setReviews] = useState<PharmacyReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getMyPharmacyReviews()
      .then((items) => {
        if (!cancelled) setReviews(items);
      })
      .catch((err) => {
        if (cancelled) return;
        const msg =
          err instanceof ApiRequestError
            ? err.status === 401
              ? 'Please log in again to view reviews.'
              : err.message
            : err instanceof Error
              ? err.message
              : 'Could not load reviews.';
        setError(msg);
        setReviews([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-2xl max-h-[85vh] flex flex-col bg-white rounded-3xl shadow-xl z-[101] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-2xl font-bold font-serif text-brand-950 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-brand-600" />
                Customer Reviews
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
                  <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
                  <p className="text-sm font-medium">Loading reviews…</p>
                </div>
              ) : error ? (
                <div className="text-center py-12 px-4">
                  <p className="text-red-700 font-medium mb-2">{error}</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-300">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No reviews yet</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    Patient ratings will appear here after customers submit reviews.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <motion.div
                      key={review._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3 gap-3">
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 truncate">
                            {review.patientName || 'Patient'}
                          </h4>
                          {review.createdAt && (
                            <span className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                        <div className="flex bg-yellow-50 px-3 py-1 rounded-full shrink-0">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment ? (
                        <p className="text-gray-700 leading-relaxed">&quot;{review.comment}&quot;</p>
                      ) : (
                        <p className="text-gray-400 italic text-sm">No comment</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 flex-shrink-0 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

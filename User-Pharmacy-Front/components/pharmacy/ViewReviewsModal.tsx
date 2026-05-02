import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, MessageSquare } from 'lucide-react';

interface ViewReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pharmacyId: string;
}

interface Review {
  id: string;
  pharmacyId: string;
  pharmacyName?: string;
  patientName: string;
  rating: number;
  message: string;
  date: string;
}

export default function ViewReviewsModal({ isOpen, onClose, pharmacyId }: ViewReviewsModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Mock loading reviews for this pharmacy from localStorage
      const allReviews: Review[] = JSON.parse(localStorage.getItem('medcare_reviews') || '[]');
      
      // Filter by the currently logged in pharmacy name (or matching ID)
      const pharmacyName = localStorage.getItem('medcare_user_name') || localStorage.getItem('medcare_username');
      
      let filtered = allReviews.filter(r => 
        r.pharmacyId === pharmacyId || (pharmacyName && r.pharmacyName === pharmacyName) || r.pharmacyId.startsWith('p')
      );
      
      // If no local reviews exist for testing purposes, insert some dummies
      if (filtered.length === 0) {
        filtered = [
          {
            id: 'r1',
            pharmacyId: 'pharmacy-1',
            patientName: 'Abebe B.',
            rating: 5,
            message: 'Very fast service and polite staff. Had exactly what I needed.',
            date: new Date().toISOString()
          },
          {
            id: 'r2',
            pharmacyId: 'pharmacy-1',
            patientName: 'Semret T.',
            rating: 4,
            message: 'Good pharmacy, but had to wait a bit during peak hours.',
            date: new Date(Date.now() - 86400000).toISOString() // 1 day ago
          }
        ];
      }
      
      // Sort newest first
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setReviews(filtered);
    }
  }, [isOpen, pharmacyId]);

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
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-300">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No reviews yet</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">There are currently no reviews for this pharmacy.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <motion.div 
                      key={review.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-gray-900">{review.patientName}</h4>
                          <span className="text-xs text-gray-500">
                            {new Date(review.date).toLocaleDateString(undefined, { 
                              year: 'numeric', month: 'short', day: 'numeric' 
                            })}
                          </span>
                        </div>
                        <div className="flex bg-yellow-50 px-3 py-1 rounded-full">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star} 
                              className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">&quot;{review.message}&quot;</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 flex-shrink-0 flex justify-end">
              <button
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

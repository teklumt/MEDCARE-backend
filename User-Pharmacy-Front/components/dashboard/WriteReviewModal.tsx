import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star } from 'lucide-react';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pharmacyId: string;
  pharmacyName: string;
}

export default function WriteReviewModal({ isOpen, onClose, pharmacyId, pharmacyName }: WriteReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);
    
    // Fake submit & store in localStorage
    setTimeout(() => {
      const currentUserName = localStorage.getItem('medcare_user_name') || localStorage.getItem('medcare_username') || 'Anonymous Patient';
      
      const newReview = {
        id: Math.random().toString(36).substring(7),
        pharmacyId,
        pharmacyName,
        patientName: currentUserName,
        rating,
        message,
        date: new Date().toISOString()
      };

      const existingReviews = JSON.parse(localStorage.getItem('medcare_reviews') || '[]');
      localStorage.setItem('medcare_reviews', JSON.stringify([...existingReviews, newReview]));
      
      setIsSubmitting(false);
      onClose();
      // Reset form
      setRating(0);
      setMessage('');
    }, 600);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-lg bg-white rounded-3xl shadow-xl z-[101] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold font-serif text-brand-950">Write a Review</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <p className="text-gray-600 mb-6">How was your experience with <strong>{pharmacyName}</strong>?</p>
              
              <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star 
                      className={`w-10 h-10 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`} 
                    />
                  </button>
                ))}
              </div>

              <div className="space-y-2 mb-8">
                <label className="block text-sm font-bold text-gray-700">Your Message</label>
                <textarea
                  className="w-full border-2 border-brand-100 rounded-xl p-4 focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all min-h-[120px] resize-none"
                  placeholder="Share details of your experience..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rating === 0 || isSubmitting}
                  className="flex-1 py-4 font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl transition-colors flex justify-center items-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin block"></span>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

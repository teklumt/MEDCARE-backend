import React, { useState } from 'react';
import { Star, X } from 'lucide-react';

export default function ReviewModal({ isOpen, onClose, pharmacyName, pharmacyId }: any) {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }
    const patientName = localStorage.getItem('medcare_user_name') || localStorage.getItem('medcare_username') || 'Anonymous Patient';
    const newReview = {
      pharmacyId,
      pharmacyName,
      patientName,
      rating,
      message,
      date: new Date().toISOString()
    };
    
    const existing = JSON.parse(localStorage.getItem('pharmacy_reviews') || '[]');
    existing.push(newReview);
    localStorage.setItem('pharmacy_reviews', JSON.stringify(existing));
    
    alert('Thank you for your review!');
    setRating(0);
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-brand-950">Write a Review</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <p className="text-gray-600 text-sm">You are reviewing <strong className="text-brand-900">{pharmacyName}</strong></p>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Rating <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                >
                  <Star className={`w-8 h-8 ${rating >= star ? 'text-amber-400 fill-current' : 'text-gray-200'}`} />
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about your experience..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
            />
          </div>
          
          <button 
            onClick={handleSubmit}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm hover:shadow-md"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}

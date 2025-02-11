import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StarRating from './StarRating';
import PhotoUpload from './PhotoUpload';
import { Loader, AlertCircle } from 'lucide-react';

const ReviewForm = ({ placeId, onSubmit }) => {
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    content: '',
    visit_date: today
  });
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredRating, setHoveredRating] = useState(null);
  const { getAuthHeader } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const reviewResponse = await fetch(`/api/reviews/${placeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(formData)
      });

      const reviewData = await reviewResponse.json();

      if (!reviewResponse.ok) {
        throw new Error(reviewData.error || 'Failed to submit review');
      }

      if (photos.length > 0 && reviewData.id) {
        const photoFormData = new FormData();
        photos.forEach(photo => {
          photoFormData.append('photos', photo);
        });

        const photoResponse = await fetch(`/api/reviews/${reviewData.id}/photos`, {
          method: 'POST',
          headers: {
            ...getAuthHeader()
          },
          body: photoFormData
        });

        if (!photoResponse.ok) {
          console.warn('Failed to upload photos, but review was submitted');
        }
      }

      setFormData({
        rating: 5,
        title: '',
        content: '',
        visit_date: today
      });
      setPhotos([]);
      if (onSubmit) {
        onSubmit();
      }

      window.dispatchEvent(new Event('userContentUpdated'));
    } catch (error) {
      console.error('Review submission error:', error);
      setError(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <StarRating
            rating={formData.rating}
            interactive={true}
            onChange={(rating) => setFormData({ ...formData, rating })}
            hoveredRating={hoveredRating}
            setHoveredRating={setHoveredRating}
            size={24}
          />
          <span className="ml-2 text-sm text-gray-600">
            {formData.rating} out of 5 stars
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Give your review a title"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[120px]"
            placeholder="Share your experience..."
            rows="4"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Visit Date
          </label>
          <input
            type="date"
            value={formData.visit_date}
            onChange={(e) => setFormData({...formData, visit_date: e.target.value})}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            required
            max={today}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos (Optional)
          </label>
          <PhotoUpload 
            onPhotosChange={setPhotos}
            disabled={isSubmitting}
          />
          <p className="mt-2 text-sm text-gray-500">
            Add up to 5 photos to your review. Each photo must be less than 5MB.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader className="animate-spin" size={20} />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
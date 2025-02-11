import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Trash2, Edit, ExternalLink, AlertCircle } from 'lucide-react';
import StarRating from '../reviews/StarRating';

const UserReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    rating: 5,
    visit_date: ''
  });
  const [hoveredRating, setHoveredRating] = useState(null);
  const { isLoggedIn, getAuthHeader } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    fetchUserReviews();
  }, [isLoggedIn, navigate]);

  const fetchUserReviews = async () => {
    try {
      const response = await fetch('/api/users/reviews', {
        headers: getAuthHeader()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      setError('Failed to load reviews. Please try again later.');
      console.error('Error fetching user reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (reviewId) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update review');
      }

      const updatedReview = await response.json();
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { ...review, ...updatedReview }
          : review
      ));
      setEditingReview(null);
    } catch (error) {
      console.error('Error updating review:', error);
      setError('Failed to update review. Please try again.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      setReviews(reviews.filter(review => review.id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
      setError('Failed to delete review. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="text-purple-600" />
            My Reviews
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-purple-100">
              {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
            </span>
          </div>
        </div>
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center gap-2">
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reviews.map(review => (
            <div 
              key={review.id} 
              className="bg-white rounded-xl shadow-sm border border-purple-100 hover:border-purple-200 transition-all p-6"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-grow min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900 truncate">
                      {review.place_name || 'Location'}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={review.rating} size={16} />
                      <span className="text-sm text-gray-600">
                        {review.rating} out of 5
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/place/${review.place_id}`)}
                      className="text-gray-600 hover:text-purple-600 transition-colors p-2 rounded-lg hover:bg-purple-50"
                      title="View Place"
                    >
                      <ExternalLink size={20} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingReview(review.id);
                        setEditForm({
                          title: review.title,
                          content: review.content,
                          rating: review.rating,
                          visit_date: new Date(review.visit_date).toISOString().split('T')[0]
                        });
                      }}
                      className="text-gray-600 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
                      title="Edit Review"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-gray-600 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                      title="Delete Review"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                {editingReview === review.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rating
                      </label>
                      <StarRating 
                        rating={editForm.rating}
                        interactive={true}
                        onChange={(rating) => setEditForm({ ...editForm, rating })}
                        hoveredRating={hoveredRating}
                        setHoveredRating={setHoveredRating}
                        size={24}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Review
                      </label>
                      <textarea
                        value={editForm.content}
                        onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                        className="w-full p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[100px] resize-y"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Visit Date
                      </label>
                      <input
                        type="date"
                        value={editForm.visit_date}
                        onChange={(e) => setEditForm({ ...editForm, visit_date: e.target.value })}
                        className="w-full p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingReview(null)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEditSubmit(review.id)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-semibold text-gray-900">{review.title}</h3>
                    <p className="text-gray-700 mt-2 break-words">{review.content}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Visited on {new Date(review.visit_date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {reviews.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-purple-100 mt-6">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Reviews Yet</h3>
            <p className="mt-2 text-gray-500">
              You haven't written any reviews yet. Start exploring places and share your experiences!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserReviews;
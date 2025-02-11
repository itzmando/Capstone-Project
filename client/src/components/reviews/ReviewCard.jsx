import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Comment from './CommentComponent';
import CommentForm from '../comments/CommentForm';
import StarRating from './StarRating';
import PhotoUpload from './PhotoUpload';
import { MessageSquare, X } from 'lucide-react';

const ReviewCard = ({ review, onUpdate }) => {
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [photos, setPhotos] = useState(review.photos || []);
  const { user, isLoggedIn, getAuthHeader } = useAuth();
  const isAuthor = isLoggedIn && String(user?.id) === String(review.user_id);
  const [isEditing, setIsEditing] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(null);
  const [editedReview, setEditedReview] = useState({
    rating: review.rating,
    title: review.title,
    content: review.content,
    visit_date: review.visit_date,
  });
  const [newPhotos, setNewPhotos] = useState([]);

const handleRemovePhoto = async (photoId) => {
  if (!window.confirm('Are you sure you want to remove this photo?')) return;
  
  try {
    const response = await fetch(`/api/reviews/${review.id}/photos/${photoId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });

    if (response.ok) {
      setPhotos(photos.filter(photo => photo.id !== photoId));
    }
  } catch (error) {
    console.error('Failed to delete photo:', error);
  }
};

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/reviews/${review.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, review.id]);

  const handleCommentSubmitted = (newComment) => {
    setComments(prevComments => [...prevComments, newComment]);
    review.comment_count = (review.comment_count || 0) + 1;
  };

  const handleDeleteReview = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch(`/api/reviews/${review.id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to delete review');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/reviews/${review.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(editedReview)
      });
  
      if (!response.ok) {
        throw new Error('Failed to update review');
      }
      if (newPhotos.length > 0) {
        const formData = new FormData();
        newPhotos.forEach(photo => {
          formData.append('photos', photo);
        });
  
        const photoResponse = await fetch(`/api/reviews/${review.id}/photos`, {
          method: 'POST',
          headers: {
            ...getAuthHeader()
          },
          body: formData
        });
  
        if (!photoResponse.ok) {
          throw new Error('Failed to upload photos');
        }
      }
  
      setIsEditing(false);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update review:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <StarRating 
              rating={editedReview.rating}
              interactive={true}
              onChange={(rating) => setEditedReview({ ...editedReview, rating })}
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
              value={editedReview.title}
              onChange={(e) => setEditedReview({ ...editedReview, title: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review
            </label>
            <textarea
              value={editedReview.content}
              onChange={(e) => setEditedReview({ ...editedReview, content: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 min-h-[120px]"
              rows="4"
              required
            />
          </div>
          <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">
              Visit Date
           </label>
            <input
              type="date"
              value={editedReview.visit_date.split('T')[0]}
              onChange={(e) => setEditedReview({ ...editedReview, visit_date: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              required
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">
             Current Photos
              </label>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                    src={photo.photo_url}
                    alt={`Review photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                    type="button"
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                       <X size={16} />
                       </button>
                       </div>
                       ))}
                       </div>
                       
          <PhotoUpload 
             onPhotosChange={(newPhotos) => setNewPhotos(newPhotos)}
             existingPhotosCount={photos.length}
            />
           </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} size={20} />
                <span className="text-gray-600">
                  {review.rating} out of 5
                </span>
              </div>
              <div className="flex items-center text-sm text-purple-600 gap-2 mt-2">
                <span className="font-medium">{review.username}</span>
                <span>•</span>
                <span>{new Date(review.visit_date).toLocaleDateString()}</span>
              </div>
            </div>
            {isAuthor && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-purple-600 hover:text-purple-800 font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={handleDeleteReview}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900">{review.title}</h3>
            <p className="text-gray-700 mt-2 whitespace-pre-line">{review.content}</p>
          </div>
          {photos && photos.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Photos</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {photos.map((photo, index) => (
                  <div 
                    key={index} 
                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                  >
                    <img
                      src={photo.photo_url}
                      alt={photo.caption || `Review photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium"
            >
              <MessageSquare size={18} />
              {showComments ? 'Hide Comments' : `Show Comments (${review.comment_count || 0})`}
            </button>

            {showComments && (
              <div className="mt-4 space-y-4">
                {comments.map(comment => (
                  <Comment
                    key={comment.id}
                    comment={comment}
                    onUpdate={fetchComments}
                  />
                ))}
                <CommentForm 
                  reviewId={review.id} 
                  onCommentSubmitted={handleCommentSubmitted} 
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
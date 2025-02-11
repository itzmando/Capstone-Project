import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ReviewForm from '../reviews/ReviewForm';
import ReviewCard from '../reviews/ReviewCard';
import StarRating from '../reviews/StarRating';
import PhotoGallery from './PhotoGallery';
import { MapPin, Phone, Globe, Upload } from 'lucide-react';

const PlaceDetails = () => {
  const [place, setPlace] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    fetchPlaceDetails();
  }, [id]);

  const fetchPlaceDetails = async () => {
    try {
      const response = await fetch(`/api/places/${id}`);
      if (!response.ok) throw new Error('Failed to fetch place details');
      const data = await response.json();
      data.average_rating = data.average_rating ? Number(data.average_rating) : null;
      setPlace(data);
    } catch (error) {
      setError('Failed to fetch place details');
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const handleReviewSubmit = () => {
    setShowReviewForm(false);
    fetchPlaceDetails();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Place not found</h2>
          <p className="mt-2 text-gray-600">The place you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="mt-4 inline-block text-purple-600 hover:text-purple-800">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{place.name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center">
                  <StarRating rating={Math.floor(place.average_rating || 0)} size={20} />
                  <span className="ml-2 text-gray-600">
                    {place.average_rating?.toFixed(1)} ({place.review_count} {place.review_count === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-purple-600 font-medium">{place.category_name}</span>
              </div>

              <div className="space-y-4 text-gray-600 mb-8">
                <p className="flex items-center gap-2">
                  <MapPin className="flex-shrink-0 text-gray-400" size={20} />
                  {place.address}
                </p>
                {place.phone_number && (
                  <p className="flex items-center gap-2">
                    <Phone className="flex-shrink-0 text-gray-400" size={20} />
                    {place.phone_number}
                  </p>
                )}
                {place.website_url && (
                  <p className="flex items-center gap-2">
                    <Globe className="flex-shrink-0 text-gray-400" size={20} />
                    <a 
                      href={place.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800"
                    >
                      Visit website
                    </a>
                  </p>
                )}
              </div>

              <div className="prose max-w-none mb-8">
                <p>{place.description}</p>
              </div>

              {place.photos && place.photos.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos</h2>
                  <PhotoGallery photos={place.photos} />
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Reviews</h2>
              {isLoggedIn && !showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Upload size={20} />
                  Write a Review
                </button>
              )}
            </div>

            {showReviewForm && (
              <div className="mb-8">
                <ReviewForm 
                  placeId={id} 
                  onSubmit={handleReviewSubmit}
                />
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="mt-4 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="space-y-6">
              {place.reviews?.map(review => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onUpdate={fetchPlaceDetails}
                />
              ))}
              {(!place.reviews || place.reviews.length === 0) && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No reviews yet. Be the first to write one!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetails;
import React, { useState, useEffect } from 'react';
import { MapPin, Star, Heart, User } from 'lucide-react';

export const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [favoriteLocations, setFavoriteLocations] = useState([]);
  const token = window.localStorage.getItem('token');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch user profile
        const profileResponse = await fetch('/api/users/profile', { headers });
        const profileData = await profileResponse.json();
        setUserData(profileData);

        // Fetch user reviews
        const reviewsResponse = await fetch('/api/users/reviews', { headers });
        const reviewsData = await reviewsResponse.json();
        setUserReviews(reviewsData);

        // Fetch favorite locations
        const favoritesResponse = await fetch('/api/users/favorites', { headers });
        const favoritesData = await favoritesResponse.json();
        setFavoriteLocations(favoritesData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [token]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">User Dashboard</h1>
      
      {userData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded shadow flex flex-col items-center">
            <User className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="font-bold text-gray-600">Username</h3>
            <p className="text-xl font-bold">{userData.username}</p>
          </div>
          <div className="bg-white p-4 rounded shadow flex flex-col items-center">
            <MapPin className="w-8 h-8 text-green-500 mb-2" />
            <h3 className="font-bold text-gray-600">Total Places Visited</h3>
            <p className="text-2xl font-bold">{userData.places_visited || 0}</p>
          </div>
          <div className="bg-white p-4 rounded shadow flex flex-col items-center">
            <Star className="w-8 h-8 text-yellow-500 mb-2" />
            <h3 className="font-bold text-gray-600">Reviews Written</h3>
            <p className="text-2xl font-bold">{userReviews.length}</p>
          </div>
          <div className="bg-white p-4 rounded shadow flex flex-col items-center">
            <Heart className="w-8 h-8 text-red-500 mb-2" />
            <h3 className="font-bold text-gray-600">Favorite Locations</h3>
            <p className="text-2xl font-bold">{favoriteLocations.length}</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Reviews Section */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">My Reviews</h2>
          {userReviews.length === 0 ? (
            <p className="text-gray-500 text-center">No reviews yet</p>
          ) : (
            <div className="space-y-4">
              {userReviews.slice(0, 3).map((review) => (
                <div key={review.review_id} className="border p-4 rounded hover:bg-gray-50 transition-colors">
                  <h3 className="font-bold">{review.place_name}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                    {review.rating} / 5
                  </div>
                  <p>{review.review_content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Favorite Locations Section */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Favorite Locations</h2>
          {favoriteLocations.length === 0 ? (
            <p className="text-gray-500 text-center">No favorite locations</p>
          ) : (
            <div className="space-y-4">
              {favoriteLocations.slice(0, 3).map((location) => (
                <div key={location.place_id} className="border p-4 rounded hover:bg-gray-50 transition-colors flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{location.name}</h3>
                    <p className="text-sm text-gray-600">{location.city_name}</p>
                  </div>
                  <Heart className="w-6 h-6 text-red-500" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingReviews, setPendingReviews] = useState([]);
  const token = window.localStorage.getItem('token');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        
        const statsResponse = await fetch('/api/admin/reviews/dashboard', { headers });
        const statsData = await statsResponse.json();
        setStats(statsData);

        const reviewsResponse = await fetch('/api/admin/reviews/pending', { headers });
        const reviewsData = await reviewsResponse.json();
        setPendingReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      }
    };

    fetchAdminData();
  }, [token]);

  const handleReviewAction = async (reviewId, action) => {
    try {
      await fetch(
        `/api/admin/reviews/${reviewId}/status`,
        {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ status: action })
        }
      );
    
      const response = await fetch('/api/admin/reviews/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setPendingReviews(data);
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">Total Reviews</h3>
            <p className="text-2xl">{stats.total_reviews}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">Pending Reviews</h3>
            <p className="text-2xl">{stats.pending_reviews}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">Approved Reviews</h3>
            <p className="text-2xl">{stats.approved_reviews}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">Average Rating</h3>
            <p className="text-2xl">{stats.average_rating?.toFixed(1)}</p>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Pending Reviews</h2>
        {pendingReviews.length === 0 ? (
          <p>No pending reviews</p>
        ) : (
          <div className="space-y-4">
            {pendingReviews.map((review) => (
              <div key={review.review_id} className="border p-4 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{review.review_title}</h3>
                    <p className="text-sm text-gray-600">
                      By {review.reviewer_username} for {review.place_name}
                    </p>
                    <p className="mt-2">{review.review_content}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleReviewAction(review.review_id, 'approved')}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReviewAction(review.review_id, 'rejected')}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
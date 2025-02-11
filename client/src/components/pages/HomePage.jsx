import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import StarRating from '../reviews/StarRating';


const HomePage = () => {
  const [places, setPlaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [featuredReviews, setFeaturedReviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlaces();
    fetchFeaturedReviews();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (featuredReviews.length > 0) {
        setCurrentReviewIndex((prev) => 
          prev === featuredReviews.length - 1 ? 0 : prev + 1
        );
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredReviews]);

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/places?limit=6');
      if (!response.ok) throw new Error('Failed to fetch places');
      
      const data = await response.json();
      
      const sortedPlaces = data.places
        .sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))
        .slice(0, 6);
      
      setPlaces(sortedPlaces);
    } catch (error) {
      console.error('Failed to fetch places:', error);
    }
    setLoading(false);
  };

  const fetchFeaturedReviews = async () => {
    try {
      const response = await fetch('/api/places/featured-reviews');
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setFeaturedReviews(data || []);
    } catch (error) {
      console.error('Failed to fetch featured reviews:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const nextReview = () => {
    setCurrentReviewIndex((prev) => 
      prev === featuredReviews.length - 1 ? 0 : prev + 1
    );
  };

  const prevReview = () => {
    setCurrentReviewIndex((prev) => 
      prev === 0 ? featuredReviews.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen">
      <div 
        className="relative h-[600px] bg-cover bg-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80")'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Discover Your Next Adventure
            </h1>
            <p className="text-xl text-white mb-8">
              Explore amazing places and read authentic reviews from real travelers
            </p>

            <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search places..."
                    className="w-full p-4 rounded-lg bg-white/90 backdrop-blur-sm focus:ring-2 
                    focus:ring-purple-500 focus:outline-none border border-purple-100 placeholder-gray-500"
                  />
                  <Search className="absolute right-3 top-4 text-gray-400" size={20} />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-4 rounded-lg hover:from-purple-700 hover:to-blue-600 shadow-lg transition-all hover:-translate-y-0.5"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {featuredReviews.length > 0 && (
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Top Reviews</h2>
            
            <div className="relative">
              <button
                onClick={prevReview}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 text-gray-900"
              >
                <ChevronLeft size={24} />
              </button>
              
              <div className="max-w-4xl mx-auto px-12">
                <div className="bg-white rounded-xl shadow-xl p-8 transition-all duration-500">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="text-xl font-medium mb-4 text-gray-900">
                        {featuredReviews[currentReviewIndex]?.title}
                      </p>
                      <p className="text-gray-600 mb-4">
                        "{featuredReviews[currentReviewIndex]?.content}"
                      </p>
                      <div className="flex items-center gap-4">
                        <StarRating 
                          rating={featuredReviews[currentReviewIndex]?.rating || 0} 
                          size={20} 
                        />
                        <span className="text-gray-900">
                        - {featuredReviews[currentReviewIndex]?.user_name || 
                           featuredReviews[currentReviewIndex]?.username || 'Anonymous'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={nextReview}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 text-gray-900"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">Top-Rated Places</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map(place => (
              <Link key={place.id} to={`/place/${place.id}`}>
                <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-purple-50 hover:border-purple-100">
                  <h3 className="text-xl font-semibold text-gray-900">{place.name}</h3>
                  <p className="text-gray-600 mt-1">{place.category_name}</p>
                  <div className="mt-3">
                    <StarRating rating={Math.floor(place.average_rating || 0)} size={18} />
                    <span className="ml-2 text-sm text-gray-600">
                      {place.review_count} {place.review_count === 1 ? 'review' : 'reviews'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            {places.length === 0 && !loading && (
              <div className="col-span-full text-center py-8 text-gray-600">
                No places found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
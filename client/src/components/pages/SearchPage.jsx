import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import StarRating from '../reviews/StarRating';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState({
    exactMatches: [],
    relatedMatches: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    minRating: '',
    sortBy: 'relevance'
  });
  const navigate = useNavigate();

  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const processSearchResults = (places, query) => {
    const normalizedQuery = query.toLowerCase().trim();
    
    const processedPlaces = places.map(place => ({
      ...place,
      average_rating: typeof place.average_rating === 'string' 
        ? parseFloat(place.average_rating) 
        : place.average_rating || 0,
      review_count: parseInt(place.review_count || 0, 10)
    }));

    const exactMatches = [];
    const relatedMatches = [];

    processedPlaces.forEach(place => {
      const placeName = place.name.toLowerCase();
      const placeCategory = (place.category_name || '').toLowerCase();

      if (placeName.includes(normalizedQuery) || 
          normalizedQuery.includes(placeName)) {
        exactMatches.push(place);
      }
      else if (placeCategory.includes(normalizedQuery) ||
               normalizedQuery.includes(placeCategory) ||
               place.tags?.some(tag => tag.toLowerCase().includes(normalizedQuery))) {
        relatedMatches.push(place);
      }
    });

    const sortFn = (a, b) => {
      switch (filters.sortBy) {
        case 'rating':
          return b.average_rating - a.average_rating;
        case 'reviews':
          return b.review_count - a.review_count;
        default:
          return 0;
      }
    };

    return {
      exactMatches: exactMatches.sort(sortFn),
      relatedMatches: relatedMatches.sort(sortFn)
    };
  };

  const performSearch = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        q: query,
        category: filters.category,
        minRating: filters.minRating
      }).toString();

      const response = await fetch(`/api/places?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const data = await response.json();
      const processedResults = processSearchResults(data.places || [], query);
      setSearchResults(processedResults);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to fetch search results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
      performSearch(searchQuery.trim());
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch(searchQuery.trim());
    }
  }, [filters]);

  const renderResults = (results, title) => {
    if (results.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map(place => (
            <div
              key={place.id}
              onClick={() => navigate(`/place/${place.id}`)}
              className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border border-purple-50 hover:border-purple-100"
            >
              <h2 className="text-xl font-semibold text-gray-900">{place.name}</h2>
              <p className="text-gray-600 mt-1">{place.category_name}</p>
              
              <div className="mt-3">
                <StarRating rating={Math.floor(place.average_rating || 0)} size={18} />
                <span className="ml-2 text-sm text-gray-600">
                  {Number(place.average_rating || 0).toFixed(1)} ({place.review_count} {place.review_count === 1 ? 'review' : 'reviews'})
                </span>
              </div>

              {place.latest_review && (
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-700 italic">
                    "{place.latest_review.content?.substring(0, 100) || ''}..."
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    - {place.latest_review.user_name || 'Anonymous'}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search places, categories..."
                className="w-full p-3 pr-10 rounded-lg border border-purple-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <Search className="absolute right-3 top-3 text-gray-400" size={20} />
            </div>
            <button
              type="submit"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Search
            </button>
          </div>

          <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg shadow-sm">
            <Filter size={20} className="text-gray-500" />
            
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="p-2 rounded border border-gray-200 focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Categories</option>
              <option value="restaurants">Restaurants</option>
              <option value="hotels">Hotels</option>
              <option value="attractions">Attractions</option>
            </select>

            <select
              name="minRating"
              value={filters.minRating}
              onChange={handleFilterChange}
              className="p-2 rounded border border-gray-200 focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>

            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="p-2 rounded border border-gray-200 focus:ring-2 focus:ring-purple-500"
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="rating">Sort by Rating</option>
              <option value="reviews">Sort by Review Count</option>
            </select>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div>
          {renderResults(searchResults.exactMatches, 'Exact Matches')}
          {renderResults(searchResults.relatedMatches, 'Related Places')}
          
          {searchResults.exactMatches.length === 0 && 
           searchResults.relatedMatches.length === 0 && (
            <div className="text-center py-8 text-gray-600">
              No results found. Try adjusting your search or filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
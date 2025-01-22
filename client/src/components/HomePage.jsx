import React, { useState, useEffect } from 'react';
import { Search, Star, MapPin, Library } from 'lucide-react';
import { PlaceCard } from './PlaceCard';
import { SearchBar } from './SearchBar';

export const HomePage = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlaces = async (searchQuery = '') => {
    setLoading(true);
    try {
      const endpoint = searchQuery 
        ? `/api/search?q=${encodeURIComponent(searchQuery)}`
        : '/api/places';
      const response = await fetch(endpoint);
      const data = await response.json();
      setPlaces(data.places);
    } catch (err) {
      console.error('Error fetching places:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handleSearch = (query) => {
    fetchPlaces(query);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Discover Amazing Places</h1>
      <SearchBar onSearch={handleSearch} />
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </div>
  );
};
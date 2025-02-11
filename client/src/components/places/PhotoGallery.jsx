import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const PhotoGallery = ({ photos }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const handlePrevious = () => {
    setCurrentPhotoIndex((prev) => 
      prev === 0 ? photos.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentPhotoIndex((prev) => 
      prev === photos.length - 1 ? 0 : prev + 1
    );
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-600">No photos available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <div 
            key={index}
            onClick={() => {
              setCurrentPhotoIndex(index);
              setShowModal(true);
            }}
            className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
          >
            <img
              src={photo.photo_url || '/api/placeholder/400/400'}
              alt={photo.caption || `Photo ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {photo.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-black bg-opacity-50 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-sm truncate">{photo.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full max-w-4xl mx-4">
            <button
              onClick={() => setShowModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>

            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <img
                src={photos[currentPhotoIndex].photo_url || '/api/placeholder/800/600'}
                alt={photos[currentPhotoIndex].caption || `Photo ${currentPhotoIndex + 1}`}
                className="w-full h-full object-contain"
              />
              
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
                aria-label="Previous photo"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
                aria-label="Next photo"
              >
                <ChevronRight size={24} />
              </button>

              {photos[currentPhotoIndex].caption && (
                <div className="absolute bottom-0 inset-x-0 bg-black bg-opacity-50 text-white p-4">
                  <p className="text-center">{photos[currentPhotoIndex].caption}</p>
                  <p className="text-center text-sm text-gray-300 mt-1">
                    Photo by {photos[currentPhotoIndex].username}
                  </p>
                </div>
              )}
            </div>

            <div className="absolute -bottom-12 left-0 right-0 text-white text-center">
              {currentPhotoIndex + 1} / {photos.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
// src/components/reviews/StarRating.jsx
import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, size = 20, interactive = false, onChange, hoveredRating, setHoveredRating }) => {
  if (interactive) {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            onMouseEnter={() => setHoveredRating?.(star)}
            onMouseLeave={() => setHoveredRating?.(null)}
            className="focus:outline-none"
          >
            <Star
              size={size}
              className={`${
                star <= (hoveredRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              } cursor-pointer transition-colors`}
            />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((_, index) => (
        <Star
          key={index}
          size={size}
          className={`${
            index < rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

export default StarRating;
import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (rating: number) => void;
  className?: string;
}

const sizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-6 h-6',
};

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRate,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = interactive
          ? starValue <= (hoverRating || rating)
          : starValue <= rating;
        const isHalf = !interactive && starValue - 0.5 === Math.ceil(rating) - 0.5 && rating % 1 >= 0.5;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : isHalf
                  ? 'fill-yellow-400/50 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

// Compact display with number
export const StarRatingDisplay: React.FC<{
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showEmpty?: boolean;
}> = ({ rating, reviewCount, size = 'md', showEmpty = false }) => {
  if (!showEmpty && rating === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      <StarRating rating={rating} size={size} />
      <span className={`font-medium ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'}`}>
        {rating.toFixed(1)}
      </span>
      {reviewCount !== undefined && (
        <span className="text-gray-400 text-xs">({reviewCount})</span>
      )}
    </div>
  );
};

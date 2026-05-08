import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

interface WishlistButtonProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    images: string[];
    price: number;
    salePrice?: number;
    averageRating?: number;
    reviewCount?: number;
    status: string;
    stock: number;
  };
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'overlay';
}

const sizeClasses = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-11 h-11',
};

const iconSizes = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  product,
  size = 'md',
  variant = 'default',
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isActive = isInWishlist(product._id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  if (variant === 'overlay') {
    return (
      <button
        onClick={handleClick}
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 ${
          isActive ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
        }`}
        title={isActive ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
      >
        <Heart className={`${iconSizes[size]} ${isActive ? 'fill-current' : ''}`} />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-lg transition-colors duration-200 ${
        isActive
          ? 'text-red-500 bg-red-50 hover:bg-red-100'
          : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
      }`}
      title={isActive ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
    >
      <Heart className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} />
    </button>
  );
};

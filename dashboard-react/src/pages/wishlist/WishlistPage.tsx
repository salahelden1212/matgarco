import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { StarRating } from '../../components/StarRating';
import { toast } from 'sonner';

export const WishlistPage: React.FC = () => {
  const { items, removeFromWishlist, clearWishlist, isLoading } = useWishlist();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Heart className="w-12 h-12 text-gray-300" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">المفضلة فارغة</h1>
        <p className="text-gray-500 mb-6">لم تضف أي منتجات إلى مفضلاتك بعد</p>
        <Link
          to="/products"
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
        >
          <ShoppingCart className="w-5 h-5" />
          تصفح المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المفضلة</h1>
          <p className="text-gray-500 mt-1">{items.length} منتج في المفضلة</p>
        </div>
        <button
          onClick={() => {
            if (confirm('هل أنت متأكد من إفراغ المفضلة؟')) {
              clearWishlist();
            }
          }}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <Trash2 className="w-4 h-4" />
          إفراغ المفضلة
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((product) => (
          <div
            key={product._id}
            className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Image */}
            <Link to={`/products/${product.slug}`} className="relative block aspect-square">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <Heart className="w-12 h-12 text-gray-300" />
                </div>
              )}
              
              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeFromWishlist(product._id);
                }}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white shadow-sm transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Link>

            {/* Content */}
            <div className="p-4">
              <Link to={`/products/${product.slug}`}>
                <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-indigo-600 transition">
                  {product.name}
                </h3>
              </Link>

              {/* Rating */}
              {product.averageRating && product.averageRating > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <StarRating rating={product.averageRating} size="sm" />
                  <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-2 mt-3">
                {product.salePrice ? (
                  <>
                    <span className="font-bold text-indigo-600">{product.salePrice} ر.س</span>
                    <span className="text-sm text-gray-400 line-through">{product.price} ر.س</span>
                  </>
                ) : (
                  <span className="font-bold text-gray-900">{product.price} ر.س</span>
                )}
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => {
                  // Add to cart logic here
                  toast.success('تمت الإضافة إلى السلة');
                }}
                disabled={product.stock === 0}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 transition"
              >
                <ShoppingCart className="w-4 h-4" />
                {product.stock === 0 ? 'نفذ من المخزون' : 'أضف إلى السلة'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Shopping */}
      <div className="mt-12 text-center">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <ArrowRight className="w-4 h-4" />
          مواصلة التسوق
        </Link>
      </div>
    </div>
  );
};

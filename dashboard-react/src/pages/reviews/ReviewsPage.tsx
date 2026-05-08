import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Star,
  MessageSquare,
  CheckCircle,
  XCircle,
  Reply,
  Trash2,
  Eye,
  ThumbsUp,
  ExternalLink,
  Search,
  BarChart3,
} from 'lucide-react';
import { reviewAPI } from '../../lib/api';
import { StarRating } from '../../components/StarRating';

const statusMap: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-700', icon: Eye },
  approved: { label: 'معتمد', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export const ReviewsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const queryClient = useQueryClient();

  // Fetch reviews
  const { data, isLoading, error } = useQuery({
    queryKey: ['reviews', statusFilter],
    queryFn: () => reviewAPI.getAll({ status: statusFilter === 'all' ? undefined : statusFilter }),
  });

  // Fetch analytics
  const { data: analyticsData } = useQuery({
    queryKey: ['reviews-analytics'],
    queryFn: () => reviewAPI.getAnalytics(),
  });

  const reviews = data?.data?.data?.reviews || [];
  const stats = data?.data?.data?.stats || { total: 0, pending: 0, approved: 0, rejected: 0, averageRating: 0 };
  const analytics = analyticsData?.data?.data;

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) =>
      reviewAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews-analytics'] });
      toast.success('تم تحديث حالة التقييم');
    },
    onError: () => toast.error('فشل تحديث الحالة'),
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) => reviewAPI.respond(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('تم إضافة الرد');
      setRespondingTo(null);
      setResponseText('');
    },
    onError: () => toast.error('فشل إضافة الرد'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reviewAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('تم حذف التقييم');
    },
    onError: () => toast.error('فشل حذف التقييم'),
  });

  // Filter by search term
  const filteredReviews = reviews.filter((review: any) =>
    review.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.productId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRespond = (reviewId: string) => {
    if (!responseText.trim()) {
      toast.error('يرجى كتابة رد');
      return;
    }
    respondMutation.mutate({ id: reviewId, comment: responseText });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">حدث خطأ في تحميل التقييمات</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
      <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة التقييمات</h1>
          <p className="text-sm text-gray-500 mt-1">استعرض وعتمد تقييمات العملاء</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-gray-500">إجمالي التقييمات</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Eye className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-gray-500">قيد المراجعة</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.approved}</p>
              <p className="text-xs text-gray-500">معتمدة</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.rejected}</p>
              <p className="text-xs text-gray-500">مرفوضة</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Star className="w-5 h-5 text-purple-600 fill-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.averageRating?.toFixed(1) || '0.0'}</p>
              <p className="text-xs text-gray-500">متوسط التقييم</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      {analytics?.ratingDistribution && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            توزيع التقييمات
          </h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = analytics.ratingDistribution[rating] || 0;
              const total = stats.approved || 1;
              const percentage = (count / total) * 100;
              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm w-4">{rating}</span>
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-10 text-left">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg text-sm"
              placeholder="بحث في التقييمات..."
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'الكل' : statusMap[status].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">لا توجد تقييمات</p>
          </div>
        ) : (
          filteredReviews.map((review: any) => {
            const status = statusMap[review.status];
            const StatusIcon = status.icon;
            const product = review.productId;

            return (
              <div key={review._id} className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    {product?.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      {/* Product Name */}
                      <a
                        href={`/dashboard/products/${product?._id}`}
                        className="font-medium text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        {product?.name || 'منتج غير معروف'}
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      {/* Customer Info */}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="font-medium text-gray-900">{review.customerName}</span>
                        {review.isVerifiedPurchase && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            شراء موثّق
                          </span>
                        )}
                        <span className={`px-2 py-0.5 text-xs rounded-full ${status.color}`}>
                          <StatusIcon className="w-3 h-3 inline ml-1" />
                          {status.label}
                        </span>
                      </div>

                      {/* Rating & Date */}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <StarRating rating={review.rating} size="sm" />
                        <span>{new Date(review.createdAt).toLocaleDateString('ar-EG')}</span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {review.helpfulVotes || 0}
                        </span>
                      </div>

                      {/* Review Content */}
                      <div className="mt-3">
                        {review.title && (
                          <p className="font-medium text-gray-900">{review.title}</p>
                        )}
                        <p className="text-gray-600 mt-1">{review.comment}</p>
                      </div>

                      {/* Images */}
                      {review.images?.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {review.images.map((img: string, idx: number) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Review ${idx + 1}`}
                              className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                            />
                          ))}
                        </div>
                      )}

                      {/* Merchant Response */}
                      {review.merchantResponse && (
                        <div className="mt-4 bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            <Reply className="w-4 h-4" />
                            ردك
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{review.merchantResponse.comment}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(review.merchantResponse.respondedAt).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                      )}

                      {/* Response Form */}
                      {respondingTo === review._id && (
                        <div className="mt-4">
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="اكتب ردك..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleRespond(review._id)}
                              disabled={respondMutation.isPending}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm disabled:opacity-50"
                            >
                              إرسال الرد
                            </button>
                            <button
                              onClick={() => {
                                setRespondingTo(null);
                                setResponseText('');
                              }}
                              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm"
                            >
                              إلغاء
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {review.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: review._id, status: 'approved' })}
                          disabled={updateStatusMutation.isPending}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="اعتمد"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: review._id, status: 'rejected' })}
                          disabled={updateStatusMutation.isPending}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="رفض"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {!review.merchantResponse && review.status === 'approved' && (
                      <button
                        onClick={() => setRespondingTo(review._id)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        title="رد"
                      >
                        <Reply className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
                          deleteMutation.mutate(review._id);
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

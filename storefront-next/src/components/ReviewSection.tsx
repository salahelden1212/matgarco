'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageSquare, User } from 'lucide-react';

interface Review {
  _id: string;
  rating: number;
  title?: string;
  comment: string;
  customerName?: string;
  createdAt: string;
  helpfulCount: number;
  isVerifiedPurchase: boolean;
  images?: string[];
  merchantResponse?: { comment: string; createdAt: string };
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: { rating: number; count: number }[];
}

function StarRating({ value, onChange, size = 'md' }: { value: number; onChange?: (v: number) => void; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          className={`${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <Star
            className={`${sizeClass} ${star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ productId, subdomain, onSubmitted }: { productId: string; subdomain: string; onSubmitted: () => void }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [customerToken, setCustomerToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem(`customer_token_${subdomain}`);
      setCustomerToken(token);
    } catch { /* SSR */ }
  }, [subdomain]);

  if (!customerToken) {
    return (
      <div className="text-center py-6 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
        <p className="text-[var(--text-muted)] mb-3">سجل دخولك لإضافة تقييم</p>
        <a
          href={`/store/${subdomain}/login`}
          className="inline-block px-6 py-2 bg-[var(--primary)] text-white rounded-lg font-medium text-sm"
        >
          تسجيل الدخول
        </a>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          productId,
          rating,
          title: title.trim() || undefined,
          comment: comment.trim(),
        }),
      });
      if (res.ok) {
        setRating(0);
        setTitle('');
        setComment('');
        onSubmitted();
      }
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6">
      <h4 className="font-bold text-[var(--text)] mb-4">أضف تقييمك</h4>
      <div className="mb-4">
        <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">تقييمك</label>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان التقييم (اختياري)"
          className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)] text-sm outline-none focus:border-blue-500"
        />
      </div>
      <div className="mb-4">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="اكتب تقييمك هنا..."
          rows={3}
          required
          className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)] text-sm outline-none focus:border-blue-500 resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={submitting || rating === 0 || !comment.trim()}
        className="px-6 py-2.5 bg-[var(--primary)] text-white rounded-lg font-medium text-sm disabled:opacity-50"
      >
        {submitting ? 'جاري الإرسال...' : 'نشر التقييم'}
      </button>
    </form>
  );
}

export default function ReviewSection({ productId, subdomain }: { productId: string; subdomain: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/reviews/product/${productId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setReviews(data.data?.reviews || []);
          setStats(data.data?.stats || null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId, refreshKey]);

  if (loading) return <div className="text-center py-8 text-[var(--text-muted)]">جاري تحميل التقييمات...</div>;

  return (
    <div className="mt-16 pt-10 border-t border-[var(--border)]">
      <h2 className="text-xl font-black mb-8 text-[var(--text)] flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        التقييمات
        {stats && <span className="text-sm font-normal text-[var(--text-muted)]">({stats.totalReviews})</span>}
      </h2>

      {stats && stats.totalReviews > 0 && (
        <div className="flex items-center gap-6 mb-8 p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
          <div className="text-center">
            <div className="text-3xl font-black text-[var(--text)]">{stats.averageRating.toFixed(1)}</div>
            <StarRating value={Math.round(stats.averageRating)} size="sm" />
            <div className="text-xs text-[var(--text-muted)] mt-1">{stats.totalReviews} تقييم</div>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.distribution.find((d) => d.rating === star)?.count || 0;
              const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-6 text-left text-[var(--text-muted)]">{star}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-[var(--text-muted)]">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {reviews.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm">لا توجد تقييمات بعد. كن أول من يقيم هذا المنتج!</p>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-[var(--primary)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text)]">{review.customerName || 'عميل'}</p>
                      <div className="flex items-center gap-2">
                        <StarRating value={review.rating} size="sm" />
                        <span className="text-xs text-[var(--text-muted)]">
                          {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.isVerifiedPurchase && (
                    <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full">مشتريات مؤكدة</span>
                  )}
                </div>
                {review.title && <p className="font-bold text-sm text-[var(--text)] mb-1">{review.title}</p>}
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{review.comment}</p>
                {review.merchantResponse && (
                  <div className="mt-3 p-3 bg-[var(--background)] rounded-lg border-r-2 border-[var(--primary)]">
                    <p className="text-xs font-medium text-[var(--primary)] mb-1">رد المتجر</p>
                    <p className="text-sm text-[var(--text)]">{review.merchantResponse.comment}</p>
                  </div>
                )}
                <button
                  onClick={async () => {
                    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/reviews/${review._id}/helpful`, { method: 'POST' });
                    setRefreshKey((k) => k + 1);
                  }}
                  className="mt-2 flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                >
                  <ThumbsUp className="w-3 h-3" />
                  مفيد ({review.helpfulCount})
                </button>
              </div>
            ))
          )}
        </div>

        <div>
          <ReviewForm productId={productId} subdomain={subdomain} onSubmitted={() => setRefreshKey((k) => k + 1)} />
        </div>
      </div>
    </div>
  );
}

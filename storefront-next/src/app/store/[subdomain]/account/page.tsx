'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, LogOut, MapPin, Mail, Phone, ChevronLeft, ShoppingBag, Clock, CreditCard } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface CustomerData {
  customer: any;
  orders: any[];
  store: { storeName: string; subdomain: string; currency: string } | null;
}

export default function AccountPage({ params }: { params: { subdomain: string } }) {
  const { subdomain } = params;
  const router = useRouter();
  const [data, setData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem(`customer_token_${subdomain}`);
    if (!token) {
      router.push(`/store/${subdomain}/login`);
      return;
    }

    fetch(`${API_URL}/storefront/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          localStorage.removeItem(`customer_token_${subdomain}`);
          router.push(`/store/${subdomain}/login`);
          return;
        }
        setData(json.data);
      })
      .catch(() => setError('حدث خطأ في تحميل البيانات'))
      .finally(() => setLoading(false));
  }, [subdomain, router]);

  const handleLogout = () => {
    localStorage.removeItem(`customer_token_${subdomain}`);
    localStorage.removeItem(`customer_refresh_${subdomain}`);
    router.push(`/store/${subdomain}`);
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="inline-block w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <Link href={`/store/${subdomain}/login`} className="px-6 py-2 rounded-xl font-bold text-white" style={{ backgroundColor: 'var(--primary)' }}>
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  const { customer, orders, store } = data!;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black">حسابي</h1>
          <p className="text-sm text-[var(--text-muted)]">{store?.storeName}</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors">
          <LogOut className="w-4 h-4" /> تسجيل خروج
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--border)]">
            <div className="w-16 h-16 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8" style={{ color: 'var(--primary)' }} />
            </div>
            <h2 className="text-lg font-bold text-center">{customer.firstName} {customer.lastName}</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <Mail className="w-4 h-4" /> {customer.email}
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                  <Phone className="w-4 h-4" /> {customer.phone}
                </div>
              )}
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <ShoppingBag className="w-4 h-4" />
                <span>{customer.stats?.totalOrders || 0} طلب</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <CreditCard className="w-4 h-4" />
                <span>{customer.stats?.totalSpent?.toLocaleString('en-US') || 0} {store?.currency || 'ج.م'}</span>
              </div>
            </div>

            {customer.addresses?.length > 0 && (
              <div className="mt-6 pt-4 border-t border-[var(--border)]">
                <h3 className="text-sm font-bold mb-2 flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> العناوين
                </h3>
                {customer.addresses.map((addr: any, i: number) => (
                  <div key={i} className="text-xs text-[var(--text-muted)] mb-2 p-2 bg-[var(--background)] rounded-lg">
                    {addr.label && <span className="font-semibold text-[var(--text)]">{addr.label}: </span>}
                    {addr.street}, {addr.city}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-[var(--border)]">
              <Link
                href={`/store/${subdomain}`}
                className="flex items-center justify-between text-sm font-medium hover:opacity-70 transition-opacity"
                style={{ color: 'var(--primary)' }}
              >
                العودة للمتجر <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" /> طلباتي
          </h2>

          {orders.length === 0 ? (
            <div className="bg-[var(--surface)] rounded-2xl p-8 text-center border border-[var(--border)]">
              <Package className="w-12 h-12 mx-auto mb-3 text-[var(--text-muted)]" />
              <p className="font-medium">لا توجد طلبات بعد</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">عندما تطلب منتجاً، ستظهر طلباتك هنا</p>
              <Link
                href={`/store/${subdomain}/products`}
                className="inline-block mt-4 px-6 py-2 rounded-xl font-bold text-white"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                تسوق الآن
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order: any) => (
                <Link
                  key={order._id}
                  href={`/store/${subdomain}/orders/${order._id}`}
                  className="block bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">{order.orderNumber}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      order.paymentStatus === 'paid' ? 'bg-green-50 text-green-600' :
                      order.paymentStatus === 'failed' ? 'bg-red-50 text-red-600' :
                      'bg-yellow-50 text-yellow-600'
                    }`}>
                      {order.paymentStatus === 'paid' ? 'مدفوع' :
                       order.paymentStatus === 'failed' ? 'فشل' : 'قيد الانتظار'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                    <span className="font-semibold text-[var(--text)]">
                      {order.total?.toLocaleString('en-US')} {store?.currency || 'ج.م'}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-[var(--text-muted)]">
                      {order.items?.length || 0} منتج
                    </span>
                    <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                      {order.orderStatus === 'delivered' ? 'تم التوصيل' :
                       order.orderStatus === 'shipped' ? 'تم الشحن' :
                       order.orderStatus === 'processing' ? 'قيد المعالجة' : 'قيد الانتظار'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { notFound } from 'next/navigation';
import Link from 'next/link';
import StorePageShell from '@/components/StorePageShell';
import { fetchStorefrontTheme } from '@/lib/api';
import { CheckCircle, Package, MapPin, Phone, Mail, ArrowLeft } from 'lucide-react';

interface Props {
  params: { subdomain: string; id: string };
}

async function fetchOrder(orderId: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders/${orderId}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.order ?? null;
  } catch {
    return null;
  }
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { subdomain, id } = params;

  const [themeRes, order] = await Promise.all([
    fetchStorefrontTheme(subdomain),
    fetchOrder(id),
  ]);

  if (!themeRes) return notFound();

  const { theme } = themeRes;
  const c = theme.colors;
  const currency = theme.store?.currency || 'ج.م';

  return (
    <StorePageShell subdomain={subdomain}>
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{ backgroundColor: '#22c55e20' }}
          >
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-black mb-2" style={{ color: c.text }}>
            تم تأكيد طلبك! 🎉
          </h1>
          <p className="text-sm" style={{ color: c.textMuted }}>
            شكراً لتسوقك معنا. سنتواصل معك قريباً.
          </p>
          {order && (
            <div
              className="inline-block mt-4 px-4 py-2 rounded-full text-sm font-bold"
              style={{ backgroundColor: c.primary + '20', color: c.primary }}
            >
              رقم الطلب: {order.orderNumber}
            </div>
          )}
        </div>

        {order ? (
          <div className="space-y-4">
            {/* Order Items */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: `1px solid ${c.border}`, backgroundColor: c.surface }}
            >
              <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: c.border }}>
                <Package className="w-4 h-4" style={{ color: c.primary }} />
                <h2 className="font-bold text-sm" style={{ color: c.text }}>المنتجات المطلوبة</h2>
              </div>
              <div className="divide-y" style={{ borderColor: c.border }}>
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: c.text }}>{item.productName}</p>
                      <p className="text-xs" style={{ color: c.textMuted }}>الكمية: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold" style={{ color: c.primary }}>
                      {item.subtotal?.toLocaleString()} {currency}
                    </span>
                  </div>
                ))}
              </div>
              {/* Total */}
              <div
                className="flex justify-between items-center px-5 py-4 border-t"
                style={{ borderColor: c.border, backgroundColor: c.background }}
              >
                <span className="font-black" style={{ color: c.text }}>الإجمالي</span>
                <span className="text-lg font-black" style={{ color: c.primary }}>
                  {order.total?.toLocaleString()} {currency}
                </span>
              </div>
            </div>

            {/* Shipping Info */}
            {order.shippingAddress && (
              <div
                className="rounded-2xl p-5 space-y-2"
                style={{ border: `1px solid ${c.border}`, backgroundColor: c.surface }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4" style={{ color: c.primary }} />
                  <h2 className="font-bold text-sm" style={{ color: c.text }}>عنوان الشحن</h2>
                </div>
                <p className="text-sm" style={{ color: c.text }}>
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p className="text-sm" style={{ color: c.textMuted }}>
                  {order.shippingAddress.street}، {order.shippingAddress.city}
                </p>
                <div className="flex gap-4 mt-2">
                  {order.customerInfo?.phone && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: c.textMuted }}>
                      <Phone className="w-3 h-3" /> {order.customerInfo.phone}
                    </span>
                  )}
                  {order.customerInfo?.email && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: c.textMuted }}>
                      <Mail className="w-3 h-3" /> {order.customerInfo.email}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}
          >
            <p className="text-sm" style={{ color: c.textMuted }}>تم استلام طلبك بنجاح! سيتم التواصل معك قريباً.</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 text-center space-y-3">
          <Link
            href={`/store/${subdomain}/products`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: c.primary }}
          >
            <ArrowLeft className="w-4 h-4" />
            متابعة التسوق
          </Link>
        </div>
      </div>
    </StorePageShell>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, ShoppingBag, MapPin, User, Phone, Mail, ArrowRight } from 'lucide-react';

interface ThemeColors {
  primary: string;
  secondary?: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  accent?: string;
}

interface Props {
  subdomain: string;
  theme: { colors: ThemeColors; store?: { currency?: string; direction?: string } };
}

export default function CheckoutClient({ subdomain, theme }: Props) {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const router = useRouter();
  const c = theme.colors;
  const currency = theme.store?.currency || 'ج.م';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    state: '',
    notes: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    setError('');

    try {
      // Build order payload matching the backend API
      const payload = {
        subdomain,
        customerInfo: {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          email: form.email,
        },
        shippingAddress: {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          street: form.street,
          city: form.city,
          state: form.state || form.city,
          country: 'EG',
          postalCode: '',
        },
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.name,
          productImage: item.image || '',
          variantId: undefined,
          variantName: item.variant || undefined,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
        })),
        subtotal: totalPrice,
        tax: 0,
        shippingCost: 0,
        discount: 0,
        total: totalPrice,
        paymentMethod: 'cash',
        customerNotes: form.notes,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'حدث خطأ أثناء إرسال الطلب');
      }

      const orderId = data.data?.order?._id || data.data?._id;
      clearCart();
      router.push(`/store/${subdomain}/orders/${orderId}`);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مجدداً');
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="p-6 rounded-full" style={{ backgroundColor: c.primary + '18' }}>
          <ShoppingBag className="w-12 h-12" style={{ color: c.primary }} />
        </div>
        <h2 className="text-2xl font-black" style={{ color: c.text }}>سلتك فارغة</h2>
        <p className="text-sm" style={{ color: c.textMuted }}>أضف منتجات لتكمل عملية الشراء</p>
        <Link
          href={`/store/${subdomain}/products`}
          className="px-6 py-3 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: c.primary }}
        >
          تصفح المنتجات
        </Link>
      </div>
    );
  }

  const inputStyle = {
    backgroundColor: c.surface,
    border: `1px solid ${c.border}`,
    color: c.text,
    outline: 'none',
  };

  const labelStyle = { color: c.textMuted };

  function InputField({
    label,
    name,
    type = 'text',
    required = false,
    placeholder = '',
  }: {
    label: string;
    name: keyof typeof form;
    type?: string;
    required?: boolean;
    placeholder?: string;
  }) {
    return (
      <div>
        <label className="block text-xs font-medium mb-1.5" style={labelStyle}>
          {label} {required && <span style={{ color: c.primary }}>*</span>}
        </label>
        <input
          type={type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          required={required}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-xl text-sm transition-colors focus:ring-2"
          style={{ ...inputStyle, outlineColor: c.primary } as React.CSSProperties}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: c.textMuted }}>
        <Link href={`/store/${subdomain}`} className="hover:underline">الرئيسية</Link>
        <span>/</span>
        <Link href={`/store/${subdomain}/cart`} className="hover:underline">السلة</Link>
        <span>/</span>
        <span style={{ color: c.text }}>الدفع</span>
      </nav>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left — Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Personal Info */}
            <section
              className="rounded-2xl p-6 space-y-4"
              style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4" style={{ color: c.primary }} />
                <h2 className="font-bold text-sm" style={{ color: c.text }}>البيانات الشخصية</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField label="الاسم الأول" name="firstName" required placeholder="أحمد" />
                <InputField label="الاسم الأخير" name="lastName" required placeholder="محمد" />
              </div>
              <InputField label="رقم الهاتف" name="phone" type="tel" required placeholder="01xxxxxxxxx" />
              <InputField label="البريد الإلكتروني" name="email" type="email" placeholder="example@email.com" />
            </section>

            {/* Shipping Address */}
            <section
              className="rounded-2xl p-6 space-y-4"
              style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4" style={{ color: c.primary }} />
                <h2 className="font-bold text-sm" style={{ color: c.text }}>عنوان الشحن</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField label="المحافظة / المدينة" name="city" required placeholder="القاهرة" />
                <InputField label="المنطقة / الحي" name="state" placeholder="مدينة نصر" />
              </div>
              <InputField label="العنوان بالتفصيل" name="street" required placeholder="الشارع، رقم المبنى، الدور..." />

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={labelStyle}>
                  ملاحظات للطلب
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="أي تعليمات خاصة للتوصيل..."
                  className="w-full px-4 py-3 rounded-xl text-sm resize-none"
                  style={inputStyle}
                />
              </div>
            </section>

            {/* Payment Method */}
            <section
              className="rounded-2xl p-6"
              style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}
            >
              <h2 className="font-bold text-sm mb-4" style={{ color: c.text }}>طريقة الدفع</h2>
              <div
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{ backgroundColor: c.primary + '12', border: `2px solid ${c.primary}` }}
              >
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: c.primary }}
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.primary }} />
                </div>
                <span className="font-semibold text-sm" style={{ color: c.text }}>💵 الدفع عند الاستلام</span>
              </div>
            </section>
          </div>

          {/* Right — Order Summary */}
          <div className="lg:col-span-2">
            <div
              className="rounded-2xl overflow-hidden sticky top-24"
              style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}
            >
              <div className="px-5 py-4 border-b" style={{ borderColor: c.border }}>
                <h3 className="font-black text-sm" style={{ color: c.text }}>
                  ملخص الطلب ({totalItems} منتج)
                </h3>
              </div>

              {/* Items */}
              <div className="divide-y max-h-72 overflow-y-auto" style={{ borderColor: c.border }}>
                {items.map((item) => (
                  <div key={item.productId + (item.variant || '')} className="flex items-center gap-3 px-5 py-3">
                    <div
                      className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
                      style={{ backgroundColor: c.background }}
                    >
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                      )}
                      {/* Qty badge */}
                      <span
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                        style={{ backgroundColor: c.primary }}
                      >
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: c.text }}>{item.name}</p>
                      {item.variant && <p className="text-xs" style={{ color: c.textMuted }}>{item.variant}</p>}
                    </div>
                    <span className="text-xs font-bold flex-shrink-0" style={{ color: c.primary }}>
                      {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="px-5 py-4 space-y-2 border-t" style={{ borderColor: c.border }}>
                <div className="flex justify-between text-xs" style={{ color: c.textMuted }}>
                  <span>المنتجات</span>
                  <span>{totalPrice.toLocaleString()} {currency}</span>
                </div>
                <div className="flex justify-between text-xs" style={{ color: c.textMuted }}>
                  <span>الشحن</span>
                  <span className="text-green-500 font-medium">مجانا 🎁</span>
                </div>
                <div
                  className="flex justify-between font-black text-base pt-2 border-t"
                  style={{ borderColor: c.border, color: c.text }}
                >
                  <span>الإجمالي</span>
                  <span style={{ color: c.primary }}>{totalPrice.toLocaleString()} {currency}</span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mx-5 mb-4 p-3 rounded-xl text-xs text-red-700 bg-red-50 border border-red-200">
                  ⚠️ {error}
                </div>
              )}

              {/* Submit */}
              <div className="px-5 pb-5">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: c.primary }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري إرسال الطلب...
                    </>
                  ) : (
                    <>
                      تأكيد الطلب
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <Link
                  href={`/store/${subdomain}/cart`}
                  className="block text-center mt-3 text-xs hover:underline"
                  style={{ color: c.textMuted }}
                >
                  ← العودة للسلة
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

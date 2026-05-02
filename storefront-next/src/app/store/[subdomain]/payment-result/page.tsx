'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, ShoppingBag, ArrowRight, Clock } from 'lucide-react';

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || searchParams.get('order_id') || searchParams.get('merchant_order_id');
  const successParam = searchParams.get('success') || searchParams.get('is_success') || searchParams.get('txnResponseCode');
  const transactionId = searchParams.get('id') || searchParams.get('transaction_id');

  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'unknown'>('loading');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const subdomain = typeof window !== 'undefined' ? window.location.hostname.split('.')[0] : 'store';

  useEffect(() => {
    const checkStatus = async () => {
      // Check from URL params first (Paymob redirect)
      const isSuccessFromUrl = successParam === 'true' || successParam === '1' || successParam === 'APPROVED';
      
      if (orderId) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/payments/status/${orderId}`);
          const data = await res.json();
          if (data.success) {
            setOrderDetails(data.data);
            setStatus(data.data.paymentStatus === 'paid' ? 'success' : data.data.paymentStatus === 'failed' ? 'failed' : isSuccessFromUrl ? 'success' : 'unknown');
          } else {
            setStatus(isSuccessFromUrl ? 'success' : 'failed');
          }
        } catch {
          setStatus(isSuccessFromUrl ? 'success' : 'unknown');
        }
      } else {
        setStatus(isSuccessFromUrl ? 'success' : 'unknown');
      }
    };
    checkStatus();
  }, [orderId, successParam]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
          <p className="font-medium" style={{ color: 'var(--color-text-muted)' }}>جاري التحقق من حالة الدفع...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-background)' }}>
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 animate-bounce-in">
            <CheckCircle2 className="w-14 h-14 text-green-500" />
          </div>
          <h1 className="text-3xl font-black mb-3" style={{ color: 'var(--color-text)' }}>تم الدفع بنجاح! 🎉</h1>
          <p className="text-lg mb-6" style={{ color: 'var(--color-text-muted)' }}>
            شكراً لطلبك. سيتم معالجة طلبك وإرسال تأكيد قريباً.
          </p>
          
          {orderDetails && (
            <div className="p-5 rounded-2xl border mb-6 text-right space-y-2" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-text-muted)' }}>رقم الطلب</span>
                <span className="font-bold font-mono" style={{ color: 'var(--color-text)' }}>#{orderDetails.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-text-muted)' }}>المبلغ المدفوع</span>
                <span className="font-bold text-green-600">{orderDetails.total?.toLocaleString()} ج.م</span>
              </div>
              {transactionId && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-text-muted)' }}>رقم المعاملة</span>
                  <span className="font-mono text-sm" style={{ color: 'var(--color-text-muted)' }}>{transactionId}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {orderId && (
              <Link href={`/store/${subdomain}/track-order`} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold transition-all hover:opacity-90" style={{ background: 'var(--color-primary)', color: '#fff' }}>
                <Clock className="w-5 h-5" /> تتبع الطلب
              </Link>
            )}
            <Link href={`/store/${subdomain}`} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold border transition-all hover:bg-gray-50" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
              <ShoppingBag className="w-5 h-5" /> متابعة التسوق
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-background)' }}>
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-14 h-14 text-red-500" />
          </div>
          <h1 className="text-3xl font-black mb-3" style={{ color: 'var(--color-text)' }}>فشل الدفع</h1>
          <p className="text-lg mb-6" style={{ color: 'var(--color-text-muted)' }}>
            لم يتم إتمام عملية الدفع. يمكنك المحاولة مرة أخرى أو اختيار طريقة دفع مختلفة.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => history.back()} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold transition-all" style={{ background: 'var(--color-primary)', color: '#fff' }}>
              <ArrowRight className="w-5 h-5" /> العودة والمحاولة مجدداً
            </button>
            <Link href={`/store/${subdomain}`} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold border" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
              <ShoppingBag className="w-5 h-5" /> العودة للمتجر
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Unknown
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
          <Clock className="w-14 h-14 text-yellow-500" />
        </div>
        <h1 className="text-2xl font-black mb-3" style={{ color: 'var(--color-text)' }}>جاري معالجة الطلب</h1>
        <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>
          طلبك قيد المعالجة. ستصلك رسالة تأكيد قريباً.
        </p>
        <Link href={`/store/${subdomain}`} className="inline-flex items-center gap-2 py-3 px-8 rounded-xl font-bold" style={{ background: 'var(--color-primary)', color: '#fff' }}>
          <ShoppingBag className="w-5 h-5" /> العودة للمتجر
        </Link>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  );
}

import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Clock, ArrowRight, Copy, Check } from 'lucide-react';
import { orderAPI } from '../../lib/api';

export const CheckoutSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (orderId) {
      orderAPI.getOne(orderId).then((res) => {
        setOrder(res.data?.data);
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    }
  }, [orderId]);

  const copyOrderNumber = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      {/* Success Icon */}
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">تم تأكيد طلبك!</h1>
      <p className="text-gray-600 mb-8">شكراً لك على التسوق معنا. سنتواصل معك قريباً.</p>

      {/* Order Number */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <p className="text-sm text-gray-500 mb-2">رقم الطلب</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl font-bold text-indigo-600">
            {order?.orderNumber || '---'}
          </span>
          <button
            onClick={copyOrderNumber}
            className="p-2 text-gray-400 hover:text-indigo-600 transition"
            title="نسخ الرقم"
          >
            {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between">
          {[
            { icon: CheckCircle, label: 'تم الطلب', active: true },
            { icon: Package, label: 'قيد التجهيز', active: false },
            { icon: Truck, label: 'تم الشحن', active: false },
            { icon: CheckCircle, label: 'تم التسليم', active: false },
          ].map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  step.active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs ${step.active ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>
                  {step.label}
                </span>
                {idx < 3 && (
                  <div className="absolute w-16 h-0.5 bg-gray-200" style={{ 
                    marginTop: '20px', 
                    marginRight: idx % 2 === 0 ? '-80px' : '80px' 
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Track Order */}
      <div className="bg-indigo-50 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Clock className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-indigo-900">تتبع طلبك</h3>
        </div>
        <p className="text-sm text-indigo-700 mb-4">
          يمكنك تتبع حالة طلبك في أي وقت باستخدام رقم الطلب ورقم الجوال
        </p>
        <Link
          to={`/track-order?order=${order?.orderNumber}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
        >
          تتبع الطلب
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <Link
          to="/products"
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
        >
          مواصلة التسوق
        </Link>
        <Link
          to="/orders"
          className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800"
        >
          طلباتي
        </Link>
      </div>
    </div>
  );
};

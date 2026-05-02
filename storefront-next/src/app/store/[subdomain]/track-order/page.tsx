'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Calendar,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { storefrontApi } from '@/lib/api';

interface OrderStatus {
  status: string;
  label: string;
  description: string;
  timestamp?: string;
  completed: boolean;
  current: boolean;
}

interface TrackingInfo {
  orderNumber: string;
  status: string;
  statusLabel: string;
  createdAt: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  total: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
  };
  shippingMethod: string;
  trackingNumber?: string;
  shippingProvider?: string;
  estimatedDelivery?: string;
  timeline: OrderStatus[];
}

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get('order') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<TrackingInfo | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOrder(null);

    if (!orderNumber.trim()) {
      setError('يرجى إدخال رقم الطلب');
      return;
    }

    setLoading(true);
    try {
      const response = await storefrontApi.trackOrder(orderNumber, phone);
      if (response.data?.success) {
        setOrder(response.data.data);
      } else {
        setError(response.data?.message || 'لم يتم العثور على الطلب');
      }
    } catch {
      setError('فشل في البحث عن الطلب. تأكد من رقم الطلب والمحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    const icons = {
      pending: Clock,
      processing: Package,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: AlertCircle,
    };
    const Icon = icons[status.status as keyof typeof icons] || Package;
    return <Icon className="w-5 h-5" />;
  };

  const getStatusColor = (status: OrderStatus) => {
    if (status.current) return 'bg-blue-600 text-white border-blue-600';
    if (status.completed) return 'bg-green-500 text-white border-green-500';
    return 'bg-gray-200 text-gray-400 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">تتبع طلبك</h1>
          <p className="text-gray-600">أدخل رقم الطلب ورقم الجوال لتتبع حالة شحنتك</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الطلب <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Package className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                    placeholder="مثال: ORD-123456"
                    className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الجوال <span className="text-gray-400 text-xs">(اختياري)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05xxxxxxxx"
                    className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  بحث عن الطلب
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Order Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">رقم الطلب</p>
                  <h2 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h2>
                </div>
                <div className={`px-4 py-2 rounded-full font-medium ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {order.statusLabel}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>تاريخ الطلب</span>
                  </div>
                  <p className="font-medium">{new Date(order.createdAt).toLocaleDateString('ar-SA')}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Package className="w-4 h-4" />
                    <span>عدد المنتجات</span>
                  </div>
                  <p className="font-medium">{order.items.length} منتج</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <ArrowRight className="w-4 h-4" />
                    <span>الإجمالي</span>
                  </div>
                  <p className="font-medium">{order.total.toFixed(2)} ر.س</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-6">حالة الطلب</h3>
              <div className="relative">
                {order.timeline.map((step, index) => (
                  <div key={step.status} className="relative flex gap-4 pb-8 last:pb-0">
                    {/* Line */}
                    {index < order.timeline.length - 1 && (
                      <div className={`absolute right-5 top-10 w-0.5 h-full ${
                        step.completed ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                    
                    {/* Icon */}
                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 ${getStatusColor(step)}`}>
                      {getStatusIcon(step)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <h4 className={`font-bold ${step.current ? 'text-blue-600' : step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                      {step.timestamp && (
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(step.timestamp).toLocaleString('ar-SA')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4">معلومات الشحن</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">{order.shippingAddress.fullName}</p>
                    <p className="text-sm text-gray-500">{order.shippingAddress.phone}</p>
                    <p className="text-sm text-gray-500">{order.shippingAddress.address}, {order.shippingAddress.city}</p>
                  </div>
                </div>

                {order.trackingNumber && (
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-700 mb-1">رقم التتبع</p>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-blue-900">{order.trackingNumber}</p>
                      <span className="text-sm text-blue-600">{order.shippingProvider}</span>
                    </div>
                  </div>
                )}

                {order.estimatedDelivery && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-green-700">موعد التسليم المتوقع</p>
                      <p className="font-bold text-green-900">{new Date(order.estimatedDelivery).toLocaleDateString('ar-SA')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4">المنتجات</h3>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Package className="w-8 h-8 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">الكمية: {item.quantity}</p>
                      <p className="font-bold text-blue-600">{(item.price * item.quantity).toFixed(2)} ر.س</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

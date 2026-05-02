import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ShoppingBag,
  Truck,
  CreditCard,
  MapPin,
  ChevronDown,
  ChevronUp,
  Tag,
  Plus,
  Check,
  Clock,
  Package,
  ArrowRight,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuthStore } from '../../store/authStore';
import { discountAPI, orderAPI } from '../../lib/api';

interface ShippingAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  isDefault: boolean;
}

interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}

const shippingMethods: ShippingMethod[] = [
  { id: 'standard', name: 'الشحن العادي', price: 15, estimatedDays: '3-5 أيام' },
  { id: 'express', name: 'الشحن السريع', price: 35, estimatedDays: '1-2 أيام' },
  { id: 'free', name: 'شحن مجاني', price: 0, estimatedDays: '5-7 أيام' },
];

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { isAuthenticated, user } = useAuthStore();

  // Form states
  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [selectedShipping, setSelectedShipping] = useState<string>('standard');
  const [showNewAddress, setShowNewAddress] = useState(false);
  
  // New address form
  const [newAddress, setNewAddress] = useState({
    label: '',
    fullName: user?.name || '',
    phone: '',
    address: '',
    city: '',
    country: 'السعودية',
  });

  // Saved addresses (mock for now - would come from API)
  const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>([
    {
      id: '1',
      label: 'المنزل',
      fullName: 'أحمد محمد',
      phone: '0501234567',
      address: 'حي النزهة، شارع الملك فهد',
      city: 'الرياض',
      country: 'السعودية',
      isDefault: true,
    },
    {
      id: '2',
      label: 'العمل',
      fullName: 'أحمد محمد',
      phone: '0501234567',
      address: 'برج المملكة، الدور 25',
      city: 'الرياض',
      country: 'السعودية',
      isDefault: false,
    },
  ]);

  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; type: string; value: number; amount: number } | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // Order summary calculations
  const subtotal = total;
  const shippingCost = shippingMethods.find(m => m.id === selectedShipping)?.price || 15;
  const discountAmount = appliedDiscount?.amount || 0;
  const finalTotal = subtotal + shippingCost - discountAmount;

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      toast.error('السلة فارغة');
      navigate('/cart');
    }
  }, [items, navigate]);

  // Handle promo code application
  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error('يرجى إدخال كود الخصم');
      return;
    }

    setIsApplyingPromo(true);
    try {
      const response = await discountAPI.validate(promoCode, subtotal);
      const discount = response.data?.data;
      
      if (discount.valid) {
        setAppliedDiscount({
          code: promoCode,
          type: discount.type,
          value: discount.value,
          amount: discount.discountAmount,
        });
        toast.success(`تم تطبيق خصم ${discount.discountAmount.toFixed(2)} ر.س`);
      } else {
        toast.error(discount.message || 'كود الخصم غير صالح');
      }
    } catch {
      toast.error('فشل التحقق من كود الخصم');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  // Add new address
  const saveNewAddress = () => {
    if (!newAddress.fullName || !newAddress.phone || !newAddress.address || !newAddress.city) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const address: ShippingAddress = {
      id: Date.now().toString(),
      label: newAddress.label || 'عنوان جديد',
      ...newAddress,
      isDefault: savedAddresses.length === 0,
    };

    setSavedAddresses([...savedAddresses, address]);
    setSelectedAddressId(address.id);
    setShowNewAddress(false);
    toast.success('تم إضافة العنوان');
  };

  // Place order
  const placeOrder = async () => {
    const selectedAddress = savedAddresses.find(a => a.id === selectedAddressId);
    if (!selectedAddress) {
      toast.error('يرجى اختيار عنوان الشحن');
      return;
    }

    try {
      const orderData = {
        items: items.map(item => ({
          productId: item._id,
          quantity: item.quantity,
          price: item.salePrice || item.price,
        })),
        shippingAddress: {
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone,
          address: selectedAddress.address,
          city: selectedAddress.city,
          country: selectedAddress.country,
        },
        shippingMethod: selectedShipping,
        discountCode: appliedDiscount?.code,
        subtotal,
        shippingCost,
        discount: discountAmount,
        total: finalTotal,
      };

      const response = await orderAPI.create(orderData);
      const orderId = response.data?.data?._id;

      clearCart();
      navigate(`/checkout/success?order=${orderId}`);
    } catch {
      toast.error('فشل إنشاء الطلب');
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">إتمام الطلب</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center gap-4 mb-8">
            {[
              { id: 'shipping', label: 'الشحن', icon: Truck },
              { id: 'payment', label: 'الدفع', icon: CreditCard },
              { id: 'review', label: 'المراجعة', icon: Check },
            ].map((s, idx) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted = ['shipping', 'payment', 'review'].indexOf(step) > idx;
              
              return (
                <React.Fragment key={s.id}>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                    isActive ? 'bg-indigo-600 text-white' : 
                    isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{s.label}</span>
                  </div>
                  {idx < 2 && (
                    <div className={`flex-1 h-0.5 ${
                      isCompleted ? 'bg-green-300' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Shipping Step */}
          {step === 'shipping' && (
            <div className="space-y-6">
              {/* Saved Addresses */}
              {isAuthenticated && savedAddresses.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    عنوان الشحن
                  </h2>
                  <div className="grid gap-3">
                    {savedAddresses.map((address) => (
                      <label
                        key={address.id}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                          selectedAddressId === address.id
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={address.id}
                          checked={selectedAddressId === address.id}
                          onChange={() => setSelectedAddressId(address.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{address.label}</span>
                            {address.isDefault && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                افتراضي
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{address.fullName}</p>
                          <p className="text-sm text-gray-600">{address.phone}</p>
                          <p className="text-sm text-gray-600">{address.address}, {address.city}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Address */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <button
                  onClick={() => setShowNewAddress(!showNewAddress)}
                  className="flex items-center gap-2 text-indigo-600 font-medium"
                >
                  {showNewAddress ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {showNewAddress ? 'إخفاء النموذج' : 'إضافة عنوان جديد'}
                </button>

                {showNewAddress && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <input
                      type="text"
                      placeholder="اسم العنوان (مثل: المنزل، العمل)"
                      value={newAddress.label}
                      onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                      className="px-4 py-3 border border-gray-200 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="الاسم الكامل *"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      className="px-4 py-3 border border-gray-200 rounded-lg"
                    />
                    <input
                      type="tel"
                      placeholder="رقم الجوال *"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="px-4 py-3 border border-gray-200 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="المدينة *"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="px-4 py-3 border border-gray-200 rounded-lg"
                    />
                    <textarea
                      placeholder="العنوان بالتفصيل *"
                      value={newAddress.address}
                      onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                      className="md:col-span-2 px-4 py-3 border border-gray-200 rounded-lg"
                      rows={2}
                    />
                    <button
                      onClick={saveNewAddress}
                      className="md:col-span-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      حفظ العنوان
                    </button>
                  </div>
                )}
              </div>

              {/* Shipping Method */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  طريقة الشحن
                </h2>
                <div className="grid gap-3">
                  {shippingMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${
                        selectedShipping === method.id
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value={method.id}
                          checked={selectedShipping === method.id}
                          onChange={() => setSelectedShipping(method.id)}
                        />
                        <div>
                          <p className="font-medium text-gray-900">{method.name}</p>
                          <p className="text-sm text-gray-500">{method.estimatedDays}</p>
                        </div>
                      </div>
                      <span className="font-bold text-indigo-600">
                        {method.price === 0 ? 'مجاني' : `${method.price} ر.س`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep('payment')}
                disabled={!selectedAddressId}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                متابعة إلى الدفع
              </button>
            </div>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  طريقة الدفع
                </h2>
                
                {/* COD Option */}
                <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-indigo-600 bg-indigo-50 cursor-pointer">
                  <input type="radio" name="payment" value="cod" defaultChecked className="w-4 h-4" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">الدفع عند الاستلام</p>
                    <p className="text-sm text-gray-500">ادفع نقداً عند استلام طلبك</p>
                  </div>
                  <Package className="w-8 h-8 text-indigo-600" />
                </label>

                {/* Note for other payment methods */}
                <div className="mt-4 p-4 bg-blue-50 rounded-xl flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    سيتم إضافة خيارات الدفع الإلكتروني (بطاقة ائتمان، Apple Pay، مدى) في التحديثات القادمة.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('shipping')}
                  className="flex-1 py-4 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
                >
                  رجوع
                </button>
                <button
                  onClick={() => setStep('review')}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
                >
                  متابعة للمراجعة
                </button>
              </div>
            </div>
          )}

          {/* Review Step */}
          {step === 'review' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-4">ملخص الطلب</h2>
                
                {/* Address Summary */}
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">عنوان الشحن</span>
                    <button onClick={() => setStep('shipping')} className="text-indigo-600 text-sm">تعديل</button>
                  </div>
                  {(() => {
                    const addr = savedAddresses.find(a => a.id === selectedAddressId);
                    return addr ? (
                      <div className="text-sm text-gray-600">
                        <p>{addr.fullName} - {addr.phone}</p>
                        <p>{addr.address}, {addr.city}</p>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Items */}
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item._id} className="flex gap-4">
                      <img
                        src={item.images?.[0] || '/placeholder.png'}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">الكمية: {item.quantity}</p>
                        <p className="font-bold text-indigo-600">
                          {((item.salePrice || item.price) * item.quantity).toFixed(2)} ر.س
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('payment')}
                  className="flex-1 py-4 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
                >
                  رجوع
                </button>
                <button
                  onClick={placeOrder}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  تأكيد الطلب
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar - Sticky */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {/* Cart Items Summary */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                محتويات السلة ({items.length})
              </h2>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <img
                      src={item.images?.[0] || '/placeholder.png'}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.quantity} × {(item.salePrice || item.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Promo Code */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                كود الخصم
              </h3>
              {appliedDiscount ? (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-green-700">{appliedDiscount.code}</p>
                    <p className="text-xs text-green-600">خصم {appliedDiscount.amount.toFixed(2)} ر.س</p>
                  </div>
                  <button
                    onClick={() => setAppliedDiscount(null)}
                    className="text-red-500 hover:text-red-600"
                  >
                    إزالة
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="أدخل الكود"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <button
                    onClick={applyPromoCode}
                    disabled={isApplyingPromo}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50"
                  >
                    {isApplyingPromo ? '...' : 'تطبيق'}
                  </button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">المجموع الفرعي</span>
                  <span>{subtotal.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الشحن</span>
                  <span>{shippingCost === 0 ? 'مجاني' : `${shippingCost.toFixed(2)} ر.س`}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-green-600">
                    <span>الخصم</span>
                    <span>-{discountAmount.toFixed(2)} ر.س</span>
                  </div>
                )}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>الإجمالي</span>
                    <span className="text-indigo-600">{finalTotal.toFixed(2)} ر.س</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">شامل الضريبة</p>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 text-gray-400">
              <div className="flex items-center gap-1 text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>دفع آمن</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Clock className="w-4 h-4" />
                <span>توصيل سريع</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

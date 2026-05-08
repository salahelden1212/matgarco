import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Store,
  User,
  MapPin,
  Globe,
  Camera,
  Save,
  Loader2,
  CheckCircle,
  Crown,
  AlertCircle,
  Phone,
  Mail,
  Building,
  Lock,
  Eye,
  EyeOff,
  CreditCard,
  Truck,
  Wifi,
  WifiOff,
  Plus,
  Trash2,
  ShieldCheck,
  PackageCheck,
} from 'lucide-react';
import { merchantAPI, authAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import axios from '../../lib/axios';

const businessTypes = [
  { value: 'retail', label: 'بيع بالتجزئة' },
  { value: 'wholesale', label: 'بيع بالجملة' },
  { value: 'services', label: 'خدمات' },
  { value: 'other', label: 'أخرى' },
];

const currencies = [
  { value: 'EGP', label: 'جنيه مصري (EGP)' },
  { value: 'USD', label: 'دولار أمريكي (USD)' },
  { value: 'SAR', label: 'ريال سعودي (SAR)' },
  { value: 'AED', label: 'درهم إماراتي (AED)' },
];

const planLabels: Record<string, { label: string; color: string }> = {
  free_trial: { label: 'تجريبي مجاني', color: 'bg-yellow-100 text-yellow-800' },
  starter: { label: 'Starter', color: 'bg-blue-100 text-blue-800' },
  professional: { label: 'Professional', color: 'bg-purple-100 text-purple-800' },
  business: { label: 'Business', color: 'bg-green-100 text-green-800' },
};

type TabId = 'store' | 'contact' | 'address' | 'payment' | 'shipping' | 'email' | 'subscription' | 'account';

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'store', label: 'المتجر', icon: Store },
  { id: 'contact', label: 'التواصل', icon: Phone },
  { id: 'address', label: 'العنوان', icon: MapPin },
  { id: 'payment', label: 'الدفع', icon: CreditCard },
  { id: 'shipping', label: 'الشحن', icon: Truck },
  { id: 'email', label: 'البريد', icon: Mail },
  { id: 'subscription', label: 'الاشتراك', icon: Crown },
  { id: 'account', label: 'حسابي', icon: User },
];

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabId>('store');
  const [savedTab, setSavedTab] = useState<TabId | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Form state
  const [storeForm, setStoreForm] = useState({
    storeName: '',
    description: '',
    businessName: '',
    businessType: '',
    currency: 'EGP',
  });
  const [contactForm, setContactForm] = useState({
    email: '',
    phone: '',
  });
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    country: 'Egypt',
    postalCode: '',
  });
  const [accountForm, setAccountForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Payment settings state
  const [paymentForm, setPaymentForm] = useState({
    codEnabled: true,
    codFee: 0,
    onlineCardEnabled: false,
    paymobSecretKey: '',
    paymobPublicKey: '',
  });
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [testingKeys, setTestingKeys] = useState(false);
  const [keysTestResult, setKeysTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Shipping settings state
  const [shippingForm, setShippingForm] = useState({
    flatRateEnabled: true,
    flatRateAmount: 50,
    freeShippingEnabled: false,
    freeShippingThreshold: 500,
    cityRatesEnabled: false,
    cityRates: [] as { city: string; rate: number }[],
    estimatedDelivery: '3-5 أيام عمل',
  });
  const [newCityName, setNewCityName] = useState('');
  const [newCityRate, setNewCityRate] = useState<number>(50);

  // Fetch merchant
  const { data: merchantData, isLoading } = useQuery({
    queryKey: ['merchant', user?.merchantId],
    queryFn: () => merchantAPI.getById(user!.merchantId!),
    enabled: !!user?.merchantId,
  });

  const merchant = merchantData?.data?.data?.merchant;

  // Populate forms when data loads
  useEffect(() => {
    if (merchant) {
      setStoreForm({
        storeName: merchant.storeName || '',
        description: merchant.description || '',
        businessName: merchant.businessName || '',
        businessType: merchant.businessType || '',
        currency: merchant.currency || 'EGP',
      });
      setContactForm({
        email: merchant.email || '',
        phone: merchant.phone || '',
      });
      setAddressForm({
        street: merchant.address?.street || '',
        city: merchant.address?.city || '',
        state: merchant.address?.state || '',
        country: merchant.address?.country || 'Egypt',
        postalCode: merchant.address?.postalCode || '',
      });
      // Payment settings
      if (merchant.paymentSettings) {
        setPaymentForm(prev => ({
          ...prev,
          codEnabled: merchant.paymentSettings?.codEnabled ?? true,
          codFee: merchant.paymentSettings?.codFee ?? 0,
          onlineCardEnabled: merchant.paymentSettings?.onlineCardEnabled ?? false,
          paymobPublicKey: (merchant.paymobConfig as any)?.publicKey || '',
        }));
      }
      // Shipping config
      if (merchant.shippingConfig) {
        setShippingForm({
          flatRateEnabled: merchant.shippingConfig?.flatRateEnabled ?? true,
          flatRateAmount: merchant.shippingConfig?.flatRateAmount ?? 50,
          freeShippingEnabled: merchant.shippingConfig?.freeShippingEnabled ?? false,
          freeShippingThreshold: merchant.shippingConfig?.freeShippingThreshold ?? 500,
          cityRatesEnabled: merchant.shippingConfig?.cityRatesEnabled ?? false,
          cityRates: merchant.shippingConfig?.cityRates || [],
          estimatedDelivery: merchant.shippingConfig?.estimatedDelivery || '3-5 أيام عمل',
        });
      }
    }
    if (user) {
      setAccountForm((prev) => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      }));
    }
  }, [merchant, user]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: Record<string, any>) =>
      merchantAPI.update(user!.merchantId!, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['merchant'] });
      if ('storeName' in variables) {
        setSavedTab('store');
        toast.success('تم حفظ بيانات المتجر ✅');
      } else if ('phone' in variables || 'email' in variables) {
        setSavedTab('contact');
        toast.success('تم حفظ بيانات التواصل ✅');
      } else if ('address' in variables) {
        setSavedTab('address');
        toast.success('تم حفظ العنوان ✅');
      }
      setTimeout(() => setSavedTab(null), 3000);
    },
    onError: () => toast.error('فشل حفظ التغييرات'),
  });

  // Update profile mutation
  const profileMutation = useMutation({
    mutationFn: (data: { firstName: string; lastName: string; phone?: string }) =>
      authAPI.updateProfile(data),
    onSuccess: (res) => {
      const updatedUser = res.data?.data?.user;
      if (updatedUser) updateUser(updatedUser);
      toast.success('تم تحديث بيانات الحساب ✅');
    },
    onError: () => toast.error('فشل تحديث بيانات الحساب'),
  });

  // Change password mutation
  const passwordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authAPI.changePassword(data),
    onSuccess: () => {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('تم تغيير كلمة المرور بنجاح ✅');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'فشل تغيير كلمة المرور';
      toast.error(msg);
    },
  });

  // Logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('حجم الصورة أكبر من 2 ميجابايت');
      return;
    }
    setLogoUploading(true);
    const uploadToast = toast.loading('جاري رفع اللوجو...');
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'logos');
      const response = await axios.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { url } = response.data.data;
      await merchantAPI.update(user!.merchantId!, { logo: url });
      queryClient.invalidateQueries({ queryKey: ['merchant'] });
      toast.success('تم تحديث اللوجو ✅', { id: uploadToast });
    } catch {
      toast.error('فشل رفع الصورة', { id: uploadToast });
    } finally {
      setLogoUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveStore = () => {
    updateMutation.mutate(storeForm);
  };

  const handleSaveContact = () => {
    updateMutation.mutate(contactForm);
  };

  const handleSaveAddress = () => {
    updateMutation.mutate({ address: addressForm });
  };

  const handleSaveAccount = () => {
    if (!accountForm.firstName.trim() || !accountForm.lastName.trim()) {
      toast.error('الاسم الأول والأخير مطلوبان');
      return;
    }
    profileMutation.mutate({
      firstName: accountForm.firstName,
      lastName: accountForm.lastName,
      phone: accountForm.phone || undefined,
    });
  };

  const handleChangePassword = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('يرجى تعبية جميع حقول كلمة المرور');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('كلمة المرور الجديدة 8 أحرف على الأقل');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('كلمة المرور الجديدة وتأكيدها غير متطابقتين');
      return;
    }
    passwordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const handleSavePayment = async () => {
    try {
      await axios.patch('/payments/settings', {
        paymentSettings: {
          codEnabled: paymentForm.codEnabled,
          codFee: paymentForm.codFee,
          onlineCardEnabled: paymentForm.onlineCardEnabled,
        },
      });
      queryClient.invalidateQueries({ queryKey: ['merchant'] });
      toast.success('تم حفظ إعدادات الدفع ✅');
    } catch {
      toast.error('فشل حفظ إعدادات الدفع');
    }
  };

  const handleTestPaymobKeys = async () => {
    if (!paymentForm.paymobSecretKey || !paymentForm.paymobPublicKey) {
      toast.error('يرجى إدخال Secret Key و Public Key');
      return;
    }
    setTestingKeys(true);
    setKeysTestResult(null);
    try {
      const res = await axios.post('/payments/test-keys', {
        secretKey: paymentForm.paymobSecretKey,
        publicKey: paymentForm.paymobPublicKey,
      });
      setKeysTestResult(res.data);
      if (res.data.success) {
        queryClient.invalidateQueries({ queryKey: ['merchant'] });
        setPaymentForm(prev => ({ ...prev, onlineCardEnabled: true }));
      }
    } catch {
      setKeysTestResult({ success: false, message: 'فشل الاتصال بالخادم' });
    } finally {
      setTestingKeys(false);
    }
  };

  const handleSaveShipping = async () => {
    try {
      await axios.patch('/payments/shipping', { shippingConfig: shippingForm });
      queryClient.invalidateQueries({ queryKey: ['merchant'] });
      toast.success('تم حفظ إعدادات الشحن ✅');
    } catch {
      toast.error('فشل حفظ إعدادات الشحن');
    }
  };

  const addCityRate = () => {
    if (!newCityName.trim()) return;
    setShippingForm(prev => ({
      ...prev,
      cityRates: [...prev.cityRates, { city: newCityName.trim(), rate: newCityRate }],
    }));
    setNewCityName('');
    setNewCityRate(50);
  };

  const removeCityRate = (idx: number) => {
    setShippingForm(prev => ({ ...prev, cityRates: prev.cityRates.filter((_, i) => i !== idx) }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const planInfo = planLabels[merchant?.subscriptionPlan] || planLabels.free_trial;
  const trialDaysLeft = merchant?.trialEndsAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(merchant.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      )
    : null;

  const SaveButton = ({ onClick, tab }: { onClick: () => void; tab: TabId }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={updateMutation.isPending}
      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
    >
      {updateMutation.isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : savedTab === tab ? (
        <CheckCircle className="w-4 h-4" />
      ) : (
        <Save className="w-4 h-4" />
      )}
      {savedTab === tab ? 'تم الحفظ!' : 'حفظ التغييرات'}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
        <p className="text-gray-500 mt-1">إدارة إعدادات متجرك</p>
      </div>

      {/* Logo + Store Name Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-xl bg-gray-100 border-2 border-gray-200 overflow-hidden flex items-center justify-center">
              {merchant?.logo ? (
                <img
                  src={merchant.logo}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Store className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <label className="absolute -bottom-2 -left-2 cursor-pointer">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shadow-md hover:bg-blue-700">
                {logoUploading ? (
                  <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5 text-white" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={logoUploading}
                className="hidden"
              />
            </label>
          </div>

          {/* Store Info */}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{merchant?.storeName}</h2>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Globe className="w-4 h-4" />
                <span>{merchant?.subdomain}.matgarco.com</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${planInfo.color}`}>
                {planInfo.label}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              اضغط على أيقونة الكاميرا لتغيير اللوجو
            </p>
          </div>
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Tab Bar */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* Store Tab */}
          {activeTab === 'store' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    اسم المتجر <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={storeForm.storeName}
                    onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="اسم متجرك"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    الاسم التجاري
                  </label>
                  <input
                    type="text"
                    value={storeForm.businessName}
                    onChange={(e) => setStoreForm({ ...storeForm, businessName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="الاسم الرسمي للشركة"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    نوع النشاط
                  </label>
                  <select
                    value={storeForm.businessType}
                    onChange={(e) => setStoreForm({ ...storeForm, businessType: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">اختر نوع النشاط</option>
                    {businessTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    العملة
                  </label>
                  <select
                    value={storeForm.currency}
                    onChange={(e) => setStoreForm({ ...storeForm, currency: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    {currencies.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  وصف المتجر
                </label>
                <textarea
                  value={storeForm.description}
                  onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="اكتب وصفاً مختصراً عن متجرك..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  يظهر في صفحة المتجر للعملاء
                </p>
              </div>
              {/* Subdomain (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  رابط المتجر
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                    <Globe className="w-4 h-4 text-gray-400 ml-2" />
                    <span className="text-blue-600 font-medium">{merchant?.subdomain}</span>
                    <span>.matgarco.com</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  لتغيير الرابط تواصل مع الدعم
                </p>
              </div>
              <div className="flex justify-end">
                <SaveButton onClick={handleSaveStore} tab="store" />
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    رقم التليفون
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="01xxxxxxxxx"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <SaveButton onClick={handleSaveContact} tab="contact" />
              </div>
            </div>
          )}

          {/* Address Tab */}
          {activeTab === 'address' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  الشارع والرقم
                </label>
                <input
                  type="text"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="الشارع والرقم"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    المدينة
                  </label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="القاهرة"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    المحافظة / المنطقة
                  </label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="القاهرة"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    البلد
                  </label>
                  <input
                    type="text"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="مصر"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    الكود البريدي
                  </label>
                  <input
                    type="text"
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="11511"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <SaveButton onClick={handleSaveAddress} tab="address" />
              </div>
            </div>
          )}

          {/* ─── Payment Tab ─────────────────────────────────── */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              {/* Payment Methods */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-500" /> طرق الدفع
                </h3>
                <div className="space-y-3">
                  {/* COD */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <PackageCheck className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">الدفع عند الاستلام (COD)</p>
                        <p className="text-xs text-gray-500">متاح دائماً لجميع الخطط</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={paymentForm.codEnabled} onChange={e => setPaymentForm(p => ({ ...p, codEnabled: e.target.checked }))} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-green-500 after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                  {/* COD Fee */}
                  {paymentForm.codEnabled && (
                    <div className="mr-14 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">رسوم COD الإضافية (بالجنيه)</label>
                      <input type="number" min={0} value={paymentForm.codFee} onChange={e => setPaymentForm(p => ({ ...p, codFee: +e.target.value }))}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                      <p className="text-xs text-gray-400 mt-1">0 = مجاني</p>
                    </div>
                  )}
                  {/* Online Card */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">الدفع بالبطاقة (Paymob)</p>
                        <p className="text-xs text-gray-500">يتطلب إدخال مفاتيح Paymob أدناه</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={paymentForm.onlineCardEnabled} onChange={e => setPaymentForm(p => ({ ...p, onlineCardEnabled: e.target.checked }))} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-500 after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                  {/* Fawry - coming soon */}
                  <div className="flex items-center justify-between p-4 border border-dashed border-gray-200 rounded-xl opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <span className="text-orange-600 font-black text-xs">FW</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700">Fawry</p>
                        <p className="text-xs text-gray-400">قريباً — قيد التطوير</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 px-3 py-1 bg-gray-100 rounded-full">قريباً</span>
                  </div>
                </div>
              </div>

              {/* Paymob Configuration */}
              {paymentForm.onlineCardEnabled && (
                <div className="border border-blue-200 rounded-xl p-5 bg-blue-50/40">
                  <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-500" /> إعداد Paymob API
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    {merchant?.subscriptionPlan === 'business'
                      ? 'خطة Business — يمكنك استخدام مفاتيحك الخاصة.'
                      : 'المنصة ستستخدم مفاتيح Paymob الخاصة بها. لاستخدام مفاتيحك الخاصة، قم بالترقية إلى Business.'}
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Secret Key</label>
                      <div className="relative">
                        <input
                          type={showSecretKey ? 'text' : 'password'}
                          value={paymentForm.paymobSecretKey}
                          onChange={e => setPaymentForm(p => ({ ...p, paymobSecretKey: e.target.value }))}
                          placeholder="sk_..."
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
                        />
                        <button type="button" onClick={() => setShowSecretKey(s => !s)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Public Key</label>
                      <input type="text" value={paymentForm.paymobPublicKey} onChange={e => setPaymentForm(p => ({ ...p, paymobPublicKey: e.target.value }))}
                        placeholder="pk_..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <button onClick={handleTestPaymobKeys} disabled={testingKeys} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm">
                      {testingKeys ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
                      اختبار الاتصال وحفظ المفاتيح
                    </button>
                    {keysTestResult && (
                      <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${keysTestResult.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {keysTestResult.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <WifiOff className="w-4 h-4 shrink-0" />}
                        {keysTestResult.message}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button onClick={handleSavePayment} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  <Save className="w-4 h-4" /> حفظ إعدادات الدفع
                </button>
              </div>
            </div>
          )}

          {/* ─── Shipping Tab ─────────────────────────────────── */}
          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-500" /> إعدادات الشحن والتوصيل
              </h3>

              {/* Flat Rate */}
              <div className="border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">شحن بسعر ثابت</p>
                    <p className="text-xs text-gray-500">سعر موحد على جميع الطلبات</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={shippingForm.flatRateEnabled} onChange={e => setShippingForm(p => ({ ...p, flatRateEnabled: e.target.checked }))} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-500 after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
                {shippingForm.flatRateEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">سعر الشحن (جنيه)</label>
                    <input type="number" min={0} value={shippingForm.flatRateAmount} onChange={e => setShippingForm(p => ({ ...p, flatRateAmount: +e.target.value }))}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
                  </div>
                )}
              </div>

              {/* Free Shipping Threshold */}
              <div className="border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">شحن مجاني فوق مبلغ معين</p>
                    <p className="text-xs text-gray-500">يشجع العملاء على زيادة قيمة الطلب</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={shippingForm.freeShippingEnabled} onChange={e => setShippingForm(p => ({ ...p, freeShippingEnabled: e.target.checked }))} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-green-500 after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
                {shippingForm.freeShippingEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">الحد الأدنى للشحن المجاني (جنيه)</label>
                    <input type="number" min={0} value={shippingForm.freeShippingThreshold} onChange={e => setShippingForm(p => ({ ...p, freeShippingThreshold: +e.target.value }))}
                      className="w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500" />
                  </div>
                )}
              </div>

              {/* City Rates */}
              <div className="border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">أسعار حسب المدينة</p>
                    <p className="text-xs text-gray-500">سعر مختلف لكل مدينة</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={shippingForm.cityRatesEnabled} onChange={e => setShippingForm(p => ({ ...p, cityRatesEnabled: e.target.checked }))} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-500 after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
                {shippingForm.cityRatesEnabled && (
                  <div className="space-y-3">
                    {/* Add city */}
                    <div className="flex gap-2">
                      <input type="text" placeholder="اسم المدينة" value={newCityName} onChange={e => setNewCityName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
                      <input type="number" min={0} placeholder="السعر" value={newCityRate} onChange={e => setNewCityRate(+e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
                      <button onClick={addCityRate} className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                        <Plus className="w-4 h-4" /> إضافة
                      </button>
                    </div>
                    {/* Cities list */}
                    {shippingForm.cityRates.length > 0 && (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-right font-medium text-gray-600">المدينة</th>
                              <th className="px-4 py-2 text-right font-medium text-gray-600">السعر (جنيه)</th>
                              <th className="px-4 py-2"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {shippingForm.cityRates.map((r, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="px-4 py-2.5 font-medium">{r.city}</td>
                                <td className="px-4 py-2.5 text-indigo-600 font-mono">{r.rate} ج.م</td>
                                <td className="px-4 py-2.5 text-center">
                                  <button onClick={() => removeCityRate(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Delivery Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">وقت التسليم المتوقع</label>
                <input type="text" value={shippingForm.estimatedDelivery} onChange={e => setShippingForm(p => ({ ...p, estimatedDelivery: e.target.value }))}
                  placeholder="مثال: 3-5 أيام عمل" className="w-full max-w-xs px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                <p className="text-xs text-gray-400 mt-1">يظهر للعميل في صفحة الدفع</p>
              </div>

              <div className="flex justify-end">
                <button onClick={handleSaveShipping} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                  <Save className="w-4 h-4" /> حفظ إعدادات الشحن
                </button>
              </div>
            </div>
          )}

          {/* 📧 Email Tab 📧 */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-indigo-600" />
                    إعدادات البريد الإلكتروني (SMTP)
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">قم بربط خادم الـ SMTP الخاص بك لإرسال رسائل المتجر للعملاء</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={emailForm.enabled} onChange={e => setEmailForm(p => ({ ...p, enabled: e.target.checked }))} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>

              {emailForm.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-200 p-5 rounded-xl bg-gray-50/50">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">مزود الخدمة</label>
                      <select value={emailForm.provider} onChange={e => setEmailForm(p => ({ ...p, provider: e.target.value as any }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
                        <option value="default">الخادم الافتراضي (متجركو)</option>
                        <option value="smtp">خادم SMTP خاص (متقدم)</option>
                      </select>
                    </div>

                    {emailForm.provider === 'smtp' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Host (المستضيف)</label>
                          <input type="text" value={emailForm.smtpHost} onChange={e => setEmailForm(p => ({ ...p, smtpHost: e.target.value }))} placeholder="smtp.gmail.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" dir="ltr" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Port (المنفذ)</label>
                          <input type="number" value={emailForm.smtpPort} onChange={e => setEmailForm(p => ({ ...p, smtpPort: parseInt(e.target.value) || 587 }))} placeholder="587" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" dir="ltr" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم (User)</label>
                          <input type="text" value={emailForm.smtpUser} onChange={e => setEmailForm(p => ({ ...p, smtpUser: e.target.value }))} placeholder="email@example.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" dir="ltr" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور (Password)</label>
                          <input type="password" value={emailForm.smtpPass} onChange={e => setEmailForm(p => ({ ...p, smtpPass: e.target.value }))} placeholder="••••••••" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" dir="ltr" />
                        </div>
                      </>
                    )}

                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الاسم المرسل (From Name)</label>
                        <input type="text" value={emailForm.fromName} onChange={e => setEmailForm(p => ({ ...p, fromName: e.target.value }))} placeholder="اسم متجرك" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">البريد المرسل (From Email)</label>
                        <input type="email" value={emailForm.fromEmail} onChange={e => setEmailForm(p => ({ ...p, fromEmail: e.target.value }))} placeholder="noreply@yourstore.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" dir="ltr" />
                      </div>
                    </div>
                  </div>

                  {emailForm.provider === 'smtp' && (
                    <div className="flex items-end gap-3 bg-white p-4 border border-gray-200 rounded-xl">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">بريد لاختبار الاتصال</label>
                        <input type="email" value={emailForm.testEmail} onChange={e => setEmailForm(p => ({ ...p, testEmail: e.target.value }))} placeholder="test@example.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" dir="ltr" />
                      </div>
                      <button onClick={handleTestSmtp} disabled={testSmtpMutation.isPending} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50 whitespace-nowrap">
                        {testSmtpMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'اختبار الاتصال'}
                      </button>
                    </div>
                  )}

                  <div className="border border-gray-200 rounded-xl p-5 space-y-4">
                    <h4 className="font-medium text-gray-900">نصوص القوالب (Templates)</h4>
                    <p className="text-xs text-gray-500">يمكنك استخدام المتغيرات مثل: {"{{customerName}}, {{orderNumber}}, {{total}}, {{storeName}}"}</p>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">رسالة تأكيد الطلب</label>
                      <textarea rows={4} value={emailForm.templates.orderConfirmation} onChange={e => setEmailForm(p => ({ ...p, templates: { ...p.templates, orderConfirmation: e.target.value } }))} placeholder="اتركه فارغاً لاستخدام القالب الافتراضي..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-mono text-right" dir="auto" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">رسالة تحديث الحالة</label>
                      <textarea rows={4} value={emailForm.templates.orderStatusChanged} onChange={e => setEmailForm(p => ({ ...p, templates: { ...p.templates, orderStatusChanged: e.target.value } }))} placeholder="اتركه فارغاً لاستخدام القالب الافتراضي..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-mono text-right" dir="auto" />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium shadow-sm hover:shadow"
                >
                  {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  حفظ التعديلات
                </button>
              </div>
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <div className="space-y-5">
              {/* Current Plan */}
              <div className="p-5 border-2 border-blue-200 bg-blue-50 rounded-xl">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-600 rounded-lg">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">الخطة الحالية</p>
                      <p className="text-xl font-bold text-gray-900">{planInfo.label}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    merchant?.subscriptionStatus === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {merchant?.subscriptionStatus === 'active' ? 'نشط' : 'منتهي'}
                  </span>
                </div>

                {trialDaysLeft !== null && merchant?.subscriptionPlan === 'free_trial' && (
                  <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                    trialDaysLeft <= 3 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p className="text-sm font-medium">
                      {trialDaysLeft > 0
                        ? `باقي ${trialDaysLeft} يوم على انتهاء الفترة التجريبية`
                        : 'انتهت الفترة التجريبية'}
                    </p>
                  </div>
                )}
              </div>

              {/* Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <Building className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {merchant?.limits?.maxProducts === -1
                      ? '∞'
                      : merchant?.limits?.maxProducts || 20}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">حد المنتجات</p>
                  <p className="text-sm font-medium text-blue-600 mt-0.5">
                    {merchant?.stats?.totalProducts || 0} مستخدم
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <User className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {merchant?.limits?.maxStaffUsers || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">حد المستخدمين</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <Crown className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {merchant?.limits?.aiCreditsPerMonth || 5}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">AI رصيد شهري</p>
                  <p className="text-sm font-medium text-orange-500 mt-0.5">
                    {merchant?.limits?.aiCreditsUsed || 0} مستخدم
                  </p>
                </div>
              </div>

              {/* Plans */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">الخطط المتاحة</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'starter', name: 'Starter', price: '250 جنيه/شهر', commission: '2%', products: 100 },
                    { id: 'professional', name: 'Professional', price: '450 جنيه/شهر', commission: '0%', products: -1, popular: true },
                    { id: 'business', name: 'Business', price: '699 جنيه/شهر', commission: '0%', products: -1 },
                  ].map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative border-2 rounded-xl p-5 ${
                        plan.popular ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      {plan.popular && (
                        <span className="absolute -top-3 right-1/2 translate-x-1/2 px-3 py-0.5 bg-blue-600 text-white text-xs rounded-full font-medium">
                          الأكثر شيوعاً
                        </span>
                      )}
                      <p className="font-bold text-gray-900 text-lg">{plan.name}</p>
                      <p className="text-blue-600 font-semibold mt-1">{plan.price}</p>
                      <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
                        <li>المنتجات: {plan.products === -1 ? 'غير محدودة' : plan.products}</li>
                        <li>عمولة: {plan.commission}</li>
                      </ul>
                      <button
                        disabled={merchant?.subscriptionPlan === plan.id}
                        onClick={() => navigate('/dashboard/subscription')}
                        className={`w-full mt-4 py-2 rounded-lg text-sm font-medium transition ${
                          merchant?.subscriptionPlan === plan.id
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {merchant?.subscriptionPlan === plan.id ? 'خطتك الحالية' : 'الترقية'}
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">
                  للترقية تواصل معنا على: support@matgarco.com
                </p>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-8">
              {/* Personal Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  البيانات الشخصية
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      الاسم الأول <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={accountForm.firstName}
                      onChange={(e) => setAccountForm({ ...accountForm, firstName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="الاسم الأول"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      الاسم الأخير <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={accountForm.lastName}
                      onChange={(e) => setAccountForm({ ...accountForm, lastName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="الاسم الأخير"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      البريد الإلكتروني
                    </label>
                    <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{user?.email}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">لا يمكن تغيير البريد الإلكتروني</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      رقم الهاتف
                    </label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={accountForm.phone}
                        onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                        className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="01xxxxxxxxx"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-5">
                  <button
                    type="button"
                    onClick={handleSaveAccount}
                    disabled={profileMutation.isPending}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                  >
                    {profileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    حفظ البيانات
                  </button>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Change Password */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-orange-500" />
                  تغيير كلمة المرور
                </h3>
                <div className="max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      كلمة المرور الحالية
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPw ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      كلمة المرور الجديدة
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
                        placeholder="8 أحرف على الأقل"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordForm.newPassword.length > 0 && passwordForm.newPassword.length < 8 && (
                      <p className="text-xs text-red-500 mt-1">كلمة المرور قصيرة جداً</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      تأكيد كلمة المرور
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300'
                      }`}
                      placeholder="أعد كتابة كلمة المرور"
                    />
                    {passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword && (
                      <p className="text-xs text-red-500 mt-1">كلمتا المرور غير متطابقتان</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={passwordMutation.isPending}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
                  >
                    {passwordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    تغيير كلمة المرور
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

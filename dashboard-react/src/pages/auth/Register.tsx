import { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authAPI, merchantAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Mail, Phone, Lock, Eye, EyeOff, Store, Globe, FileText, Loader2, AlertCircle, ArrowLeft, ArrowRight, Check } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [step, setStep] = useState(1); // 1: User Info, 2: Store Info
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    storeName: '',
    subdomain: '',
    description: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [subdomainChecking, setSubdomainChecking] = useState(false);
  const subdomainTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [merchantError, setMerchantError] = useState<string | null>(null);

  // Check subdomain availability with debounce
  const checkSubdomainMutation = useMutation({
    mutationFn: merchantAPI.checkSubdomain,
    onMutate: () => setSubdomainChecking(true),
    onSuccess: (response) => {
      setSubdomainAvailable(response.data.data.available);
      setSubdomainChecking(false);
    },
    onError: () => {
      setSubdomainChecking(false);
    },
  });

  // Debounced subdomain check
  const debouncedCheckSubdomain = useCallback((value: string) => {
    if (subdomainTimerRef.current) {
      clearTimeout(subdomainTimerRef.current);
    }
    subdomainTimerRef.current = setTimeout(() => {
      checkSubdomainMutation.mutate(value);
    }, 450);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (subdomainTimerRef.current) {
        clearTimeout(subdomainTimerRef.current);
      }
    };
  }, []);

  // Register user mutation
  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: async (response) => {
      const { user, accessToken } = response.data.data;
      setAuth(user, accessToken);
      
      // Create merchant
      try {
        await merchantAPI.create({
          name: formData.storeName,
          subdomain: formData.subdomain,
          description: formData.description,
        });
        
        setMerchantError(null);
        navigate('/onboarding');
      } catch (error: any) {
        console.error('Merchant creation error:', error.response?.data);
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            'فشل في إنشاء المتجر. حاول مرة أخرى.';
        
        setMerchantError(errorMessage);
        setErrors({ 
          merchant: errorMessage + ' تم إنشاء حسابك بنجاح. يمكنك إعادة المحاولة.' 
        });
      }
    },
    onError: (error: any) => {
      console.error('Registration error:', error.response?.data);
      
      // Handle validation errors
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const validationErrors: any = {};
        error.response.data.details.forEach((detail: any) => {
          const field = detail.field?.replace('body.', '') || detail.path?.join('.') || 'unknown';
          const message = detail.message || detail.msg || 'خطأ في التحقق';
          validationErrors[field] = message;
        });
        setErrors(validationErrors);
      } else {
        let errorMessage = 'فشل التسجيل. حاول مرة أخرى.';
        
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        if (errorMessage.toLowerCase().includes('email already')) {
          errorMessage = 'البريد الإلكتروني مسجل بالفعل';
        } else if (errorMessage.toLowerCase().includes('password')) {
          errorMessage = 'كلمة المرور يجب أن تحتوي على 8 أحرف، حرف كبير، حرف صغير، ورقم';
        } else if (errorMessage.toLowerCase().includes('network')) {
          errorMessage = 'خطأ في الاتصال. تأكد من تشغيل الخادم';
        }
        
        setErrors({ register: errorMessage });
      }
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear errors
    setErrors({ ...errors, [name]: '' });
    
    // Check subdomain availability
    if (name === 'subdomain') {
      const cleanSubdomain = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
      setFormData((prev) => ({ ...prev, subdomain: cleanSubdomain }));
      
      if (cleanSubdomain.length >= 3) {
        setSubdomainAvailable(null);
        debouncedCheckSubdomain(cleanSubdomain);
      } else {
        setSubdomainAvailable(null);
      }
    }
  };

  const validateStep1 = () => {
    const newErrors: any = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'الاسم الأول مطلوب';
    if (!formData.lastName.trim()) newErrors.lastName = 'اسم العائلة مطلوب';
    if (!formData.email.trim()) newErrors.email = 'البريد الإلكتروني مطلوب';
    
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 8) {
      newErrors.password = 'يجب أن تكون كلمة المرور 8 أحرف على الأقل';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'يجب أن تحتوي على حرف كبير واحد (A-Z)';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'يجب أن تحتوي على حرف صغير واحد (a-z)';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'يجب أن تحتوي على رقم واحد على الأقل (0-9)';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: any = {};
    
    if (!formData.storeName.trim()) newErrors.storeName = 'اسم المتجر مطلوب';
    if (!formData.subdomain.trim()) {
      newErrors.subdomain = 'النطاق الفرعي مطلوب';
    } else if (formData.subdomain.length < 3) {
      newErrors.subdomain = 'يجب أن يكون النطاق الفرعي 3 أحرف على الأقل';
    } else if (subdomainAvailable === false) {
      newErrors.subdomain = 'النطاق الفرعي غير متاح';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2()) {
      registerMutation.mutate({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans select-none relative overflow-hidden">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl shadow-xl p-8 relative">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex flex-col items-center justify-center">
            <img src="/logo.png" alt="Matgarco" className="h-14 w-auto object-contain mb-3" />
            <div className="text-2xl font-black text-slate-900 tracking-wider">
              MATGARCO
            </div>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mt-4">إنشاء حساب تاجر جديد</h1>
          <p className="text-slate-500 mt-1 text-xs">ابدأ متجرك الإلكتروني الاحترافي بدقائق</p>
        </div>

        {/* Custom Progress Indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all border ${
            step >= 1 ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}>
            {step > 1 ? <Check className="w-4 h-4" /> : '1'}
          </div>
          <div className={`w-12 h-[2px] transition-all ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-100'}`} />
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all border ${
            step >= 2 ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}>
            2
          </div>
        </div>

        {/* Global Errors */}
        {(errors.register || errors.merchant) && (
          <div className="mb-6 p-4 bg-red-50/80 border border-red-100 rounded-2xl text-red-700 text-xs flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>{errors.register || errors.merchant}</div>
            </div>
            {merchantError && (
              <button
                type="button"
                onClick={() => {
                  setMerchantError(null);
                  setErrors({});
                  setStep(2);
                }}
                className="self-end px-3 py-1 bg-red-600 text-white rounded-lg text-[10px] font-semibold hover:bg-red-700 transition"
              >
                إعادة المحاولة
              </button>
            )}
          </div>
        )}

        {/* Step 1: User Info */}
        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 mr-1">الاسم الأول</label>
                <div className="relative">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full bg-slate-50 border ${errors.firstName ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100'} rounded-2xl px-4 py-3 text-slate-900 outline-none focus:bg-white focus:ring-4 transition text-sm`}
                    placeholder="أحمد"
                  />
                </div>
                {errors.firstName && <p className="text-red-600 text-[10px] mt-1 mr-1">{errors.firstName}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 mr-1">اسم العائلة</label>
                <div className="relative">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full bg-slate-50 border ${errors.lastName ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100'} rounded-2xl px-4 py-3 text-slate-900 outline-none focus:bg-white focus:ring-4 transition text-sm`}
                    placeholder="محمد"
                  />
                </div>
                {errors.lastName && <p className="text-red-600 text-[10px] mt-1 mr-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 mr-1">البريد الإلكتروني</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100'} rounded-2xl px-4 py-3 pr-10 text-slate-900 outline-none focus:bg-white focus:ring-4 transition text-sm`}
                  placeholder="name@example.com"
                />
                <div className="absolute inset-y-0 right-3.5 flex items-center text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
              {errors.email && <p className="text-red-600 text-[10px] mt-1 mr-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 mr-1">رقم الهاتف (اختياري)</label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 pr-10 text-slate-900 outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition text-sm"
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                />
                <div className="absolute inset-y-0 right-3.5 flex items-center text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 mr-1">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100'} rounded-2xl px-4 py-3 pr-10 pl-10 text-slate-900 outline-none focus:bg-white focus:ring-4 transition text-sm`}
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-3.5 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-600 text-[10px] mt-1 mr-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 mr-1">تأكيد كلمة المرور</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100'} rounded-2xl px-4 py-3 pr-10 pl-10 text-slate-900 outline-none focus:bg-white focus:ring-4 transition text-sm`}
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-3.5 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-600 text-[10px] mt-1 mr-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition shadow-md shadow-indigo-100 text-sm"
            >
              الخطوة التالية
            </button>
          </form>
        )}

        {/* Step 2: Store Info */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 mr-1">اسم المتجر</label>
              <div className="relative">
                <input
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border ${errors.storeName ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100'} rounded-2xl px-4 py-3 pr-10 text-slate-900 outline-none focus:bg-white focus:ring-4 transition text-sm`}
                  placeholder="متجر أحمد للملابس"
                />
                <div className="absolute inset-y-0 right-3.5 flex items-center text-slate-400">
                  <Store className="w-4 h-4" />
                </div>
              </div>
              {errors.storeName && <p className="text-red-600 text-[10px] mt-1 mr-1">{errors.storeName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 mr-1">النطاق الفرعي (Subdomain)</label>
              <div className="relative flex items-stretch">
                <input
                  type="text"
                  name="subdomain"
                  value={formData.subdomain}
                  onChange={handleChange}
                  className={`flex-1 bg-slate-50 border ${errors.subdomain ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100'} rounded-r-2xl px-4 py-3 pr-10 text-slate-900 outline-none focus:bg-white focus:ring-4 transition text-sm font-semibold text-left border-l-0`}
                  placeholder="ahmed-shop"
                  dir="ltr"
                />
                <span className="flex items-center px-4 bg-slate-100 border border-r-0 border-slate-200 rounded-l-2xl text-xs text-slate-500 font-semibold select-none">
                  .matgarco.com
                </span>
                <div className="absolute inset-y-0 right-3.5 flex items-center text-slate-400">
                  <Globe className="w-4 h-4" />
                </div>
              </div>
              {subdomainAvailable === true && (
                <p className="text-green-600 text-[10px] mt-1 mr-1 flex items-center gap-1">✓ هذا النطاق متاح للاستخدام</p>
              )}
              {subdomainAvailable === false && (
                <p className="text-red-600 text-[10px] mt-1 mr-1 flex items-center gap-1">✗ هذا النطاق غير متاح</p>
              )}
              {subdomainChecking && (
                <p className="text-slate-500 text-[10px] mt-1 mr-1 flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> جاري التحقق من النطاق...</p>
              )}
              {errors.subdomain && <p className="text-red-600 text-[10px] mt-1 mr-1">{errors.subdomain}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 mr-1">وصف المتجر (اختياري)</label>
              <div className="relative">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 pr-10 text-slate-900 outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition text-sm resize-none"
                  placeholder="اكتب نبذة مختصرة عن متجرك..."
                />
                <div className="absolute top-3.5 right-3.5 text-slate-400">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition active:scale-[0.98] flex items-center justify-center gap-1.5 text-sm"
              >
                <ArrowRight className="w-4 h-4" />
                السابق
              </button>
              <button
                type="submit"
                disabled={registerMutation.isPending || subdomainAvailable === false}
                className="flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 shadow-md shadow-indigo-100 text-sm"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    أنشئ متجري
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer Link */}
        <div className="mt-8 text-center text-xs text-slate-400">
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold transition ml-1">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}

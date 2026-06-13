import { useState, useRef, useEffect } from 'react';
import type { OnboardingData } from '../OnboardingWizard';
import { useAuthStore } from '@/store/authStore';
import { merchantAPI } from '@/lib/api';
import { Globe, Loader2, Store, ArrowLeft } from 'lucide-react';

interface Props {
  data: OnboardingData['store'];
  onChange: (data: OnboardingData['store']) => void;
  onNext: () => void;
}

export default function StepStoreInfo({ data, onChange, onNext }: Props) {
  const user = useAuthStore((s) => s.user);
  const showSubdomain = !user?.merchantId;

  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [subdomainChecking, setSubdomainChecking] = useState(false);
  const subdomainTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const set = (key: keyof typeof data, val: string) => onChange({ ...data, [key]: val });

  const checkSubdomain = async (sub: string) => {
    setSubdomainChecking(true);
    try {
      const response = await merchantAPI.checkSubdomain(sub);
      setSubdomainAvailable(response.data.data.available);
    } catch (err) {
      setSubdomainAvailable(false);
    } finally {
      setSubdomainChecking(false);
    }
  };

  const handleSubdomainChange = (val: string) => {
    const cleanSubdomain = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    set('subdomain', cleanSubdomain);
    setSubdomainAvailable(null);

    if (subdomainTimerRef.current) {
      clearTimeout(subdomainTimerRef.current);
    }

    if (cleanSubdomain.length >= 3) {
      subdomainTimerRef.current = setTimeout(() => {
        checkSubdomain(cleanSubdomain);
      }, 500);
    }
  };

  // Clean up timer
  useEffect(() => {
    return () => {
      if (subdomainTimerRef.current) {
        clearTimeout(subdomainTimerRef.current);
      }
    };
  }, []);

  const isSubdomainValid = !showSubdomain || (data.subdomain.length >= 3 && subdomainAvailable === true);
  const isValid = data.name.trim().length >= 2 && isSubdomainValid;

  return (
    <div className="p-8 font-sans">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">معلومات متجرك الإلكتروني</h1>
        <p className="text-slate-500 mt-2 text-sm">أدخل التفاصيل الأساسية لتهيئة متجرك الجديد</p>
      </div>

      <div className="space-y-5">
        {/* Store Name */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2 mr-1">اسم المتجر <span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              value={data.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="مثال: متجر النور الرقمي"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 pr-10 text-slate-900 outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition text-sm font-medium"
            />
            <div className="absolute inset-y-0 right-3.5 flex items-center text-slate-400">
              <Store className="w-4.5 h-4.5" />
            </div>
          </div>
        </div>

        {/* Subdomain (only shown for Google/OAuth signups who don't have a merchant yet) */}
        {showSubdomain && (
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 mr-1">النطاق الفرعي للمتجر (Subdomain) <span className="text-red-500">*</span></label>
            <div className="relative flex items-stretch">
              <input
                value={data.subdomain}
                onChange={(e) => handleSubdomainChange(e.target.value)}
                placeholder="alnoor-shop"
                className={`flex-1 bg-slate-50 border ${
                  subdomainAvailable === false
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                    : subdomainAvailable === true
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-100'
                    : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100'
                } rounded-r-2xl px-4 py-3.5 pr-10 text-slate-900 outline-none focus:bg-white focus:ring-4 transition text-sm font-semibold text-left`}
                dir="ltr"
              />
              <span className="flex items-center px-4 bg-slate-100 border border-slate-200 border-r-0 rounded-l-2xl text-xs text-slate-500 font-bold select-none">
                .matgarco.com
              </span>
              <div className="absolute inset-y-0 right-3.5 flex items-center text-slate-400">
                <Globe className="w-4.5 h-4.5" />
              </div>
            </div>
            {subdomainAvailable === true && (
              <div className="mt-2.5 p-3 bg-green-50 border border-green-100 rounded-2xl text-green-700 text-xs font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                هذا النطاق متاح للاستخدام
              </div>
            )}
            {subdomainAvailable === false && (
              <div className="mt-2.5 p-3 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-xs font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                هذا النطاق غير متاح، يرجى اختيار نطاق آخر
              </div>
            )}
            {subdomainChecking && (
              <div className="mt-2.5 p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-500 text-xs font-semibold flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                جاري التحقق من النطاق...
              </div>
            )}
            <p className="text-slate-400 text-[10px] mt-2 leading-relaxed">
              ⓘ هذا العنوان سيكون الرابط الإلكتروني لمتجرك، يجب أن يحتوي على حروف إنجليزية وأرقام فقط.
            </p>
          </div>
        )}

        {/* Store Description */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2 mr-1">وصف المتجر</label>
          <textarea
            value={data.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="وصف مختصر للمنتجات أو الخدمات التي يقدمها متجرك..."
            rows={3}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition text-sm resize-none font-medium"
          />
        </div>

        {/* Contact Phone & Email */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 mr-1">رقم هاتف المتجر</label>
            <input
              value={data.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+966 5X XXX XXXX"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition text-sm font-medium"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 mr-1">بريد المتجر الإلكتروني</label>
            <input
              value={data.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="store@domain.com"
              type="email"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition text-sm font-medium"
              dir="ltr"
            />
          </div>
        </div>

        {/* Currency & Address */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 mr-1">العملة الافتراضية</label>
            <select
              value={data.currency}
              onChange={(e) => set('currency', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition text-sm font-bold text-slate-700"
            >
              <option value="SAR">ريال سعودي (SAR)</option>
              <option value="AED">درهم إماراتي (AED)</option>
              <option value="EGP">جنيه مصري (EGP)</option>
              <option value="KWD">دينار كويتي (KWD)</option>
              <option value="USD">دولار أمريكي (USD)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 mr-1">عنوان المقر الرئيس</label>
            <input
              value={data.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="الرياض، المملكة العربية السعودية"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition text-sm font-medium"
            />
          </div>
        </div>

        {/* Business Type & Industry */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">نشاط المتجر</label>
            <select
              value={data.businessType}
              onChange={(e) => onChange({ ...data, businessType: e.target.value, industry: e.target.value === 'retail' ? 'تجارة تجزئة' : e.target.value === 'wholesale' ? 'تجارة جملة' : e.target.value === 'services' ? 'خدمات' : e.target.value === 'food' ? 'مطاعم وأكل' : 'أخرى' })}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold transition-all text-gray-700"
            >
              <option value="">اختر النشاط</option>
              <option value="retail">تجارة تجزئة</option>
              <option value="wholesale">تجارة جملة</option>
              <option value="services">خدمات</option>
              <option value="food">مطاعم وأكل</option>
              <option value="fashion">أزياء وموضة</option>
              <option value="electronics">إلكترونيات</option>
              <option value="beauty">عناية وتجميل</option>
              <option value="home">ديكور منزلي</option>
              <option value="books">كتب ومكتبات</option>
              <option value="other">أخرى</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">المجال التفصيلي</label>
            <input
              value={data.industry}
              onChange={(e) => onChange({ ...data, industry: e.target.value })}
              placeholder="مثال: إلكترونيات منزلية"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm transition-all font-medium"
            />
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!isValid}
        className="w-full mt-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 shadow-md shadow-indigo-100"
      >
        التالي: اختيار قالب التصميم
        <ArrowLeft className="w-4 h-4 mr-1" />
      </button>
    </div>
  );
}

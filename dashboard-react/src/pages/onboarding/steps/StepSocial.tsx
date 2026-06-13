import type { OnboardingData } from '../OnboardingWizard';
import { Share2, Instagram, Twitter, Facebook, Music2, ArrowRight, Loader2 } from 'lucide-react';

interface Props {
  social: OnboardingData['social'];
  onChange: (social: OnboardingData['social']) => void;
  onFinish: () => void;
  onBack: () => void;
  loading: boolean;
}

const PLATFORMS = [
  { key: 'instagram' as const, label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/yourstore' },
  { key: 'twitter'   as const, label: 'X / Twitter', icon: Twitter, placeholder: 'https://x.com/yourstore' },
  { key: 'facebook'  as const, label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/yourstore' },
  { key: 'tiktok'    as const, label: 'TikTok', icon: Music2, placeholder: 'https://tiktok.com/@yourstore' },
];

export default function StepSocial({ social, onChange, onFinish, onBack, loading }: Props) {
  const set = (key: keyof typeof social, val: string) => onChange({ ...social, [key]: val });

  return (
    <div className="p-8 font-sans">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Share2 className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">روابط التواصل الاجتماعي</h1>
        <p className="text-slate-500 mt-2 text-sm">اختياري — يمكن تعديلها لاحقاً من الإعدادات في أي وقت</p>
      </div>

      <div className="space-y-4">
        {PLATFORMS.map(({ key, label, icon: Icon, placeholder }) => (
          <div key={key} className="relative">
            <label className="block text-xs font-bold text-slate-600 mb-2 mr-1">{label}</label>
            <div className="relative">
              <input
                value={social[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 pr-12 text-slate-900 outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition text-sm font-medium"
                dir="ltr"
                disabled={loading}
              />
              <div className="absolute inset-y-0 right-4 flex items-center text-slate-400 pointer-events-none">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-8">
        <button 
          onClick={onBack} 
          disabled={loading} 
          className="flex-1 py-3.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-100 active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ArrowRight className="w-4 h-4 ml-1" />
          رجوع
        </button>
        <button
          onClick={onFinish}
          disabled={loading}
          className="flex-[2] py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 shadow-md shadow-indigo-100"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري إنشاء المتجر...
            </>
          ) : (
            'تأكيد وإنشاء المتجر'
          )}
        </button>
      </div>
    </div>
  );
}

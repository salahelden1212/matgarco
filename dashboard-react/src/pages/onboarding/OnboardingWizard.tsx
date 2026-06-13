import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { themeAPI, merchantAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Store, LayoutTemplate, Palette, Share2, Sparkles, Check } from 'lucide-react';

// Step components
import StepStoreInfo from './steps/StepStoreInfo';
import StepTemplate from './steps/StepTemplate';
import StepColors from './steps/StepColors';
import StepSocial from './steps/StepSocial';
import StepDone from './steps/StepDone';

const STEPS = [
  { id: 1, label: 'معلومات المتجر', icon: Store },
  { id: 2, label: 'اختر القالب',    icon: LayoutTemplate },
  { id: 3, label: 'الألوان والخط',   icon: Palette },
  { id: 4, label: 'روابط التواصل',   icon: Share2 },
  { id: 5, label: 'جاهز!',          icon: Sparkles },
];

export interface OnboardingData {
  store: {
    name: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    currency: string;
    subdomain: string;
    businessType: string;
    industry: string;
  };
  templateId: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  social: {
    instagram: string;
    twitter: string;
    facebook: string;
    tiktok: string;
  };
}

const INITIAL: OnboardingData = {
  store: { name: '', description: '', phone: '', email: '', address: '', currency: 'SAR', subdomain: '', businessType: '', industry: '' },
  templateId: 'spark',
  colors: { primary: '#6366F1', secondary: '#8B5CF6', background: '#FFFFFF', text: '#111827' },
  social: { instagram: '', twitter: '', facebook: '', tiktok: '' },
};

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(INITIAL);

  // Pre-populate default store name and email based on user's profile
  useEffect(() => {
    if (user && !data.store.name) {
      const defaultName = `متجر ${user.firstName || ''} ${user.lastName || ''}`.trim();
      setData((prev) => ({
        ...prev,
        store: {
          ...prev.store,
          name: prev.store.name || defaultName || 'متجري',
          email: prev.store.email || user.email || '',
        },
      }));
    }
  }, [user]);

  const toSubdomainBase = (value: string) => {
    const base = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    let safeBase = base;
    if (!safeBase || !/^[a-z]/.test(safeBase)) {
      safeBase = `store-${safeBase}`.replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    }

    if (!safeBase) {
      safeBase = `store-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    return safeBase.slice(0, 24);
  };

  const findAvailableSubdomain = async (base: string) => {
    let candidate = base;
    for (let i = 0; i < 5; i += 1) {
      const response = await merchantAPI.checkSubdomain(candidate);
      if (response.data.data.available) return candidate;

      const suffix = Math.floor(100 + Math.random() * 950).toString();
      const trimmedBase = base.slice(0, Math.max(1, 30 - (suffix.length + 1)));
      candidate = `${trimmedBase}-${suffix}`;
    }

    const fallback = Math.floor(1000 + Math.random() * 9000).toString();
    return `${base.slice(0, Math.max(1, 30 - (fallback.length + 1)))}-${fallback}`;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      let currentMerchantId = user.merchantId;

      if (!currentMerchantId) {
        const storeName = data.store.name?.trim() || 'Store';
        let subdomain = data.store.subdomain?.trim().toLowerCase();
        
        if (!subdomain) {
          const base = toSubdomainBase(storeName);
          subdomain = await findAvailableSubdomain(base);
        }
        
        const createResponse = await merchantAPI.create({
          name: storeName,
          subdomain,
          description: data.store.description,
        });

        currentMerchantId = createResponse.data.data.merchant.id;
        updateUser({ merchantId: currentMerchantId, subdomain });
      }

      // 1. Apply template
      await themeAPI.applyTemplate(data.templateId);
      // 2. Save all customizations as draft
      await themeAPI.saveDraft({
        store: data.store,
        colors: data.colors,
        social: data.social,
      });
      // 3. Immediately publish so storefront is live
      await themeAPI.publish();
      // 4. Mark onboarding as completed
      if (currentMerchantId) {
        await merchantAPI.completeOnboarding(currentMerchantId);
      }
    },
    onSuccess: () => {
      setStep(5);
    },
    onError: () => {
      toast.error('حدث خطأ أثناء الحفظ. تحقق من اتصالك.');
    },
  });

  const update = (partial: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl select-none">
        {/* Progress bar */}
        {step < 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {STEPS.slice(0, 4).map((s) => {
                const IconComponent = s.icon;
                const isActive = step >= s.id;
                const isCompleted = step > s.id;
                return (
                  <div key={s.id} className="flex flex-col items-center gap-2 flex-1 relative">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-305 border ${
                        isActive
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <IconComponent className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`text-[11px] font-bold text-center transition-colors duration-300 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="relative h-1.5 bg-slate-250 bg-slate-200 rounded-full overflow-hidden mx-6">
              <div
                className="absolute top-0 right-0 h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Step card */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
          {step === 1 && (
            <StepStoreInfo
              data={data.store}
              onChange={(store) => update({ store })}
              onNext={next}
            />
          )}
          {step === 2 && (
            <StepTemplate
              value={data.templateId}
              onChange={(templateId) => update({ templateId })}
              onNext={next}
              onBack={back}
            />
          )}
          {step === 3 && (
            <StepColors
              colors={data.colors}
              templateId={data.templateId}
              storeData={data.store}
              onChange={(colors) => update({ colors })}
              onNext={next}
              onBack={back}
            />
          )}
          {step === 4 && (
            <StepSocial
              social={data.social}
              onChange={(social) => update({ social })}
              onFinish={() => saveMutation.mutate()}
              onBack={back}
              loading={saveMutation.isPending}
            />
          )}
          {step === 5 && (
            <StepDone
              storeName={data.store.name}
              onGo={() => navigate('/dashboard')}
            />
          )}
        </div>
      </div>
    </div>
  );
}

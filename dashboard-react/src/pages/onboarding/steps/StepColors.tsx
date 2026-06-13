import { useState } from 'react';
import type { OnboardingData } from '../OnboardingWizard';
import { Palette, Check, ArrowRight, ArrowLeft, Loader2, Bot } from 'lucide-react';
import { aiAPI } from '@/lib/api';

const PRESETS: Record<string, { primary: string; secondary: string; background: string; text: string; label: string }[]> = {
  spark:  [
    { primary: '#6366F1', secondary: '#8B5CF6', background: '#FFFFFF', text: '#111827', label: 'إنديجو' },
    { primary: '#0EA5E9', secondary: '#38BDF8', background: '#FFFFFF', text: '#0F172A', label: 'سماوي' },
    { primary: '#10B981', secondary: '#34D399', background: '#FFFFFF', text: '#111827', label: 'أخضر' },
  ],
  volt:   [
    { primary: '#F59E0B', secondary: '#FBBF24', background: '#0A0A0A', text: '#F5F5F5', label: 'ذهبي داكن' },
    { primary: '#EF4444', secondary: '#F87171', background: '#0A0A0A', text: '#F5F5F5', label: 'أحمر داكن' },
  ],
  epure:  [
    { primary: '#92400E', secondary: '#B45309', background: '#FAFAF8', text: '#1C1917', label: 'بني دافئ' },
    { primary: '#374151', secondary: '#6B7280', background: '#FFFFFF', text: '#111827', label: 'رمادي رسمي' },
  ],
  bloom:  [
    { primary: '#EC4899', secondary: '#F472B6', background: '#FFF0F6', text: '#1F2937', label: 'وردي ناعم' },
    { primary: '#A855F7', secondary: '#C084FC', background: '#FAF5FF', text: '#1F2937', label: 'بنفسجي' },
  ],
  noir:   [
    { primary: '#B8973B', secondary: '#D4AF58', background: '#080808', text: '#F5F5F0', label: 'ذهبي فاخر' },
    { primary: '#E5E7EB', secondary: '#9CA3AF', background: '#0A0A0A', text: '#FFFFFF', label: 'فضي' },
  ],
  mosaic: [
    { primary: '#7C3AED', secondary: '#A78BFA', background: '#FFFFFF', text: '#111827', label: 'بنفسجي' },
    { primary: '#0EA5E9', secondary: '#38BDF8', background: '#F0F9FF', text: '#0F172A', label: 'أزرق' },
  ],
};

interface Props {
  colors: OnboardingData['colors'];
  templateId: string;
  storeData: OnboardingData['store'];
  onChange: (colors: OnboardingData['colors']) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepColors({ colors, templateId, storeData, onChange, onNext, onBack }: Props) {
  const presets = PRESETS[templateId] || PRESETS.spark;
  const set = (key: keyof typeof colors, val: string) => onChange({ ...colors, [key]: val });
  const [brandingLoading, setBrandingLoading] = useState(false);
  const [brandingResult, setBrandingResult] = useState<{ visualStyle?: string; brandVoice?: string } | null>(null);

  const canSuggest = storeData.name.trim() && storeData.businessType.trim();

  const suggestBranding = async () => {
    if (!canSuggest) return;
    setBrandingLoading(true);
    setBrandingResult(null);
    try {
      const response = await aiAPI.suggestBranding({
        businessName: storeData.name,
        businessType: storeData.businessType,
        industry: storeData.industry || storeData.businessType,
        description: storeData.description,
        language: 'ar',
      });
      const branding = response.data?.data;
      if (branding && branding.colors) {
        onChange({
          primary: branding.colors.primary || colors.primary,
          secondary: branding.colors.secondary || colors.secondary,
          background: branding.colors.background || colors.background,
          text: branding.colors.text || colors.text,
        });
        setBrandingResult({
          visualStyle: branding.visual_style,
          brandVoice: branding.brand_voice,
        });
      }
    } catch {
      // silently fail
    } finally {
      setBrandingLoading(false);
    }
  };

  return (
    <div className="p-8 font-sans">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Palette className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">اختر ألوان متجرك</h1>
        <p className="text-slate-500 mt-2 text-sm">اختر من الأنماط الجاهزة أو دع Quantus AI يقترح هوية متكاملة</p>
      </div>

      {/* AI Branding Suggestion */}
      {canSuggest && (
        <div className="mb-6">
          <button
            type="button"
            onClick={suggestBranding}
            disabled={brandingLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all bg-gradient-to-l from-indigo-600 via-purple-600 to-pink-600 text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
          >
            {brandingLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Bot className="w-5 h-5" />
            )}
            {brandingLoading ? 'Quantus AI يبتكر هويتك البصرية...' : '✨ Quantus AI — اقتراح هوية بصرية كاملة'}
          </button>
          {brandingResult && (
            <div className="mt-3 p-3 bg-indigo-50 rounded-2xl border border-indigo-100 text-xs text-indigo-700 space-y-1">
              {brandingResult.visualStyle && <p>🎨 <strong>الأسلوب البصري:</strong> {brandingResult.visualStyle}</p>}
              {brandingResult.brandVoice && <p>🗣️ <strong>نبرة العلامة:</strong> {brandingResult.brandVoice}</p>}
              <p className="text-indigo-400 text-[10px]">تم تطبيق الألوان المقترحة 👆 غيرها متى شئت</p>
            </div>
          )}
        </div>
      )}

      {/* Preset choices */}
      <div className="mb-6">
        <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">أنماط جاهزة</p>
        <div className="grid grid-cols-2 gap-3">
          {presets.map((preset) => {
            const isActive = preset.primary === colors.primary;
            return (
              <button
                key={preset.label}
                onClick={() => onChange({ primary: preset.primary, secondary: preset.secondary, background: preset.background, text: preset.text })}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 text-right transition-all ${
                  isActive
                    ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex gap-1.5 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: preset.primary }} />
                  <div className="w-6 h-6 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: preset.background }} />
                </div>
                <span className="text-xs font-bold text-slate-700">{preset.label}</span>
                {isActive && (
                  <div className="mr-auto w-5 h-5 text-indigo-600 flex items-center justify-center rounded-full">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom color pickers */}
      <div>
        <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">تخصيص يدوي للألوان</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'primary'    as const, label: 'اللون الأساسي' },
            { key: 'secondary'  as const, label: 'اللون الثانوي' },
            { key: 'background' as const, label: 'لون الخلفية' },
            { key: 'text'       as const, label: 'لون النص' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-300 transition-colors">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shadow-sm flex-shrink-0">
                <input
                  type="color"
                  value={colors[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="absolute inset-0 w-full h-full p-0 border-0 outline-none cursor-pointer scale-150"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">{label}</p>
                <p className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">{colors[key].toUpperCase()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-100 active:scale-[0.98] transition flex items-center justify-center gap-2"
        >
          <ArrowRight className="w-4 h-4 ml-1" />
          رجوع
        </button>
        <button
          onClick={onNext}
          className="flex-[2] py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition flex items-center justify-center gap-2 shadow-md shadow-indigo-100"
        >
          متابعة للتواصل الاجتماعي
          <ArrowLeft className="w-4 h-4 mr-1" />
        </button>
      </div>
    </div>
  );
}

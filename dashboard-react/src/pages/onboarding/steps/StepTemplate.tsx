import React from 'react';
import { LayoutTemplate, Zap, Flame, Shirt, Heart, Gem, Grid, Check, ArrowRight, ArrowLeft } from 'lucide-react';

interface TemplateInfo {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  bestFor: string;
  accentColor: string;
  isDark?: boolean;
}

const TEMPLATES: TemplateInfo[] = [
  { id: 'spark',  name: 'Spark',  nameAr: 'سبارك',  description: 'نظيف وعصري، مثالي للمتاجر العامة', icon: Zap, bestFor: 'متاجر عامة', accentColor: '#6366F1' },
  { id: 'volt',   name: 'Volt',   nameAr: 'فولت',   description: 'داكن وعصري للموضة والرياضة', icon: Flame, bestFor: 'رياضة · موضة', accentColor: '#F59E0B', isDark: true },
  { id: 'epure',  name: 'Épure',  nameAr: 'إيبور',  description: 'راقٍ ومنسق، مثالي للأزياء والملابس', icon: Shirt, bestFor: 'أزياء · بوتيك', accentColor: '#92400E' },
  { id: 'bloom',  name: 'Bloom',  nameAr: 'بلوم',   description: 'ناعم وجميل للجمال والعناية والورد', icon: Heart, bestFor: 'جمال · عناية', accentColor: '#EC4899' },
  { id: 'noir',   name: 'Noir',   nameAr: 'نوار',   description: 'فاخر وأنيق للعلامات التجارية الراقية', icon: Gem, bestFor: 'فاخر · راقٍ', accentColor: '#B8973B', isDark: true },
  { id: 'mosaic', name: 'Mosaic', nameAr: 'موزاييك', description: 'ملوّن ومتنوع لأسواق المنتجات', icon: Grid, bestFor: 'مول · متعدد', accentColor: '#7C3AED' },
];

interface Props {
  value: string;
  onChange: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepTemplate({ value, onChange, onNext, onBack }: Props) {
  return (
    <div className="p-8 font-sans">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <LayoutTemplate className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">اختر قالب متجرك</h1>
        <p className="text-slate-500 mt-2 text-sm">يمكنك تغيير القالب لاحقاً من إعدادات المتجر في أي وقت</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {TEMPLATES.map((tpl) => {
          const Icon = tpl.icon;
          const isSelected = value === tpl.id;
          return (
            <button
              key={tpl.id}
              onClick={() => onChange(tpl.id)}
              className={`relative text-right p-5 rounded-2xl border-2 transition-all hover:scale-[1.02] flex flex-col items-start justify-between min-h-[160px] ${
                isSelected
                  ? 'bg-white border-indigo-600 ring-4 ring-indigo-50'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
              style={{
                backgroundColor: isSelected ? '#FFFFFF' : tpl.isDark ? '#0f172a' : '#f8fafc',
                borderColor: isSelected ? tpl.accentColor : undefined,
              }}
            >
              {isSelected && (
                <div 
                  className="absolute top-3 left-3 w-6 h-6 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: tpl.accentColor }}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
              
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all"
                style={{
                  backgroundColor: isSelected ? `${tpl.accentColor}15` : tpl.isDark ? '#1e293b' : '#e2e8f0',
                  color: tpl.accentColor,
                }}
              >
                <Icon className="w-5 h-5" />
              </div>
              
              <div>
                <div className="font-bold text-sm" style={{ color: tpl.isDark && !isSelected ? '#FFFFFF' : '#1e293b' }}>
                  {tpl.nameAr}
                </div>
                <div className="text-[10px] mt-0.5 font-bold tracking-wider" style={{ color: tpl.accentColor }}>
                  {tpl.bestFor}
                </div>
                <p className="text-[10px] mt-2 leading-relaxed" style={{ color: tpl.isDark && !isSelected ? '#94a3b8' : '#64748b' }}>
                  {tpl.description}
                </p>
              </div>
            </button>
          );
        })}
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
          متابعة لتحديد الألوان
          <ArrowLeft className="w-4 h-4 mr-1" />
        </button>
      </div>
    </div>
  );
}

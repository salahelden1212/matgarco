import { useState, useRef, useCallback, useEffect } from 'react';
import {
  ChevronUp, ChevronDown, Eye, EyeOff, ChevronRight,
  Megaphone, Image as ImageIcon, Star, LayoutGrid, Target,
  Sparkles, ShieldCheck, Mail, GripVertical,
} from 'lucide-react';

/* ────────────────────────────────────────────────────────────────────────────
   Section metadata: icon + label + editable config fields
   ──────────────────────────────────────────────────────────────────────────── */

type FieldDef =
  | { type: 'text';     key: string; label: string; placeholder?: string }
  | { type: 'textarea'; key: string; label: string; placeholder?: string }
  | { type: 'color';    key: string; label: string }
  | { type: 'number';   key: string; label: string; min?: number; max?: number }
  | { type: 'select';   key: string; label: string; options: { value: string; label: string }[] }
  | { type: 'toggle';   key: string; label: string };

interface SectionMeta {
  label: string;
  description: string;
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  iconColor: string;
  fields: FieldDef[];
}

const SECTION_META: Record<string, SectionMeta> = {
  announcement_bar: {
    label: 'شريط الإعلانات',
    description: 'شريط ملوّن أعلى الصفحة لعروض أو رسائل سريعة',
    Icon: Megaphone,
    iconColor: '#F59E0B',
    fields: [
      { type: 'text',  key: 'text',      label: 'نص الإعلان',    placeholder: '🎉 شحن مجاني على الطلبات فوق 200 جنيه' },
      { type: 'color', key: 'bgColor',   label: 'لون الخلفية' },
      { type: 'color', key: 'textColor', label: 'لون النص' },
    ],
  },
  hero: {
    label: 'القسم الرئيسي (Hero)',
    description: 'البانر الكبير أعلى الصفحة',
    Icon: ImageIcon,
    iconColor: '#6366F1',
    fields: [
      { type: 'select', key: 'style', label: 'نمط العرض', options: [
        { value: 'fullscreen', label: 'ملء الشاشة' },
        { value: 'split',      label: 'مقسّم (نص + صورة)' },
        { value: 'centered',   label: 'وسطي' },
      ]},
      { type: 'text',     key: 'title',    label: 'العنوان الرئيسي',     placeholder: 'مرحباً بك في متجرنا' },
      { type: 'textarea', key: 'subtitle', label: 'العنوان الفرعي',      placeholder: 'اكتشف أحدث المنتجات بأفضل الأسعار' },
      { type: 'text',     key: 'ctaText',  label: 'نص الزر',             placeholder: 'تسوق الآن' },
      { type: 'text',     key: 'ctaLink',  label: 'رابط الزر',           placeholder: '/products' },
      { type: 'text',     key: 'image',    label: 'رابط الصورة (URL)',   placeholder: 'https://...' },
    ],
  },
  featured_products: {
    label: 'منتجات مميزة',
    description: 'شبكة مختارة من أفضل المنتجات',
    Icon: Star,
    iconColor: '#EAB308',
    fields: [
      { type: 'text',   key: 'title', label: 'عنوان القسم',      placeholder: 'منتجات مميزة' },
      { type: 'select', key: 'style', label: 'نمط العرض', options: [
        { value: 'grid',     label: 'شبكة' },
        { value: 'carousel', label: 'سلايدر' },
      ]},
      { type: 'number', key: 'limit', label: 'عدد المنتجات المعروضة', min: 2, max: 24 },
    ],
  },
  categories_grid: {
    label: 'شبكة الفئات',
    description: 'عرض فئات المنتجات كبطاقات جذّابة',
    Icon: LayoutGrid,
    iconColor: '#8B5CF6',
    fields: [
      { type: 'text',   key: 'title', label: 'عنوان القسم', placeholder: 'تسوق حسب الفئة' },
      { type: 'select', key: 'style', label: 'عدد الأعمدة', options: [
        { value: '2col',       label: 'عمودين' },
        { value: '3col',       label: '3 أعمدة' },
        { value: 'horizontal', label: 'أفقي' },
      ]},
    ],
  },
  promo_banner: {
    label: 'بانر ترويجي',
    description: 'بانر لعرض خاص أو حملة تسويقية',
    Icon: Target,
    iconColor: '#EF4444',
    fields: [
      { type: 'text',     key: 'title',    label: 'العنوان',              placeholder: '🔥 عرض خاص' },
      { type: 'textarea', key: 'subtitle', label: 'الوصف',               placeholder: 'خصم 30% على جميع المنتجات' },
      { type: 'text',     key: 'ctaText',  label: 'نص الزر',             placeholder: 'اطلب الآن' },
      { type: 'text',     key: 'ctaLink',  label: 'رابط الزر',           placeholder: '/products' },
      { type: 'text',     key: 'image',    label: 'رابط الصورة (URL)',   placeholder: 'https://...' },
      { type: 'color',    key: 'bgColor',  label: 'لون الخلفية' },
    ],
  },
  new_arrivals: {
    label: 'وصل حديثاً',
    description: 'أحدث المنتجات المضافة',
    Icon: Sparkles,
    iconColor: '#10B981',
    fields: [
      { type: 'text',   key: 'title', label: 'عنوان القسم', placeholder: 'وصل حديثاً' },
      { type: 'number', key: 'limit', label: 'عدد المنتجات', min: 2, max: 24 },
    ],
  },
  trust_badges: {
    label: 'شارات الثقة',
    description: 'أيقونات تعزز ثقة العملاء (شحن، ضمان، أمان...)',
    Icon: ShieldCheck,
    iconColor: '#0EA5E9',
    fields: [],
  },
  newsletter: {
    label: 'النشرة البريدية',
    description: 'نموذج اشتراك بالبريد الإلكتروني',
    Icon: Mail,
    iconColor: '#EC4899',
    fields: [
      { type: 'text', key: 'title',       label: 'العنوان',            placeholder: 'اشترك في نشرتنا البريدية' },
      { type: 'text', key: 'subtitle',    label: 'الوصف',             placeholder: 'احصل على أحدث العروض والتخفيضات' },
      { type: 'text', key: 'placeholder', label: 'Placeholder الحقل', placeholder: 'بريدك الإلكتروني' },
      { type: 'text', key: 'buttonText',  label: 'نص الزر',           placeholder: 'اشترك' },
    ],
  },
};

/* ── Trust badges special options ────────────────── */
const BADGE_OPTIONS = [
  { key: 'shipping',  label: 'شحن سريع' },
  { key: 'guarantee', label: 'ضمان الإرجاع' },
  { key: 'secure',    label: 'دفع آمن' },
  { key: 'support',   label: 'دعم 24/7' },
];

/* ────────────────────────────────────────────────────────────────────────────
   Component
   ──────────────────────────────────────────────────────────────────────────── */

interface Props {
  draft: any;
  onChange: (update: Record<string, any>) => void;
}

export default function SectionsPanel({ draft, onChange }: Props) {
  const sections: any[] = draft?.sections || [];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Keep a ref to always access the latest sections (avoids stale closures)
  const sectionsRef = useRef(sections);
  sectionsRef.current = sections;

  const sorted = [...sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  /* ── Reorder ─────────────────────────── */
  const reorder = (index: number, direction: 'up' | 'down') => {
    const items = [...sorted];
    const swap = direction === 'up' ? index - 1 : index + 1;
    if (swap < 0 || swap >= items.length) return;
    [items[index], items[swap]] = [items[swap], items[index]];
    const updated = items.map((s, i) => ({ ...s, order: i + 1 }));
    onChange({ sections: updated });
  };

  /* ── Toggle enabled ──────────────────── */
  const toggleEnabled = (sectionId: string) => {
    const updated = sectionsRef.current.map((s) =>
      s.id === sectionId ? { ...s, enabled: !s.enabled } : s
    );
    onChange({ sections: updated });
  };

  /* ── Update config field (always immediate — text debounce is handled by DebouncedInput) */
  const updateConfig = useCallback((sectionId: string, key: string, value: any) => {
    const updated = sectionsRef.current.map((s) =>
      s.id === sectionId ? { ...s, config: { ...s.config, [key]: value } } : s
    );
    onChange({ sections: updated });
  }, [onChange]);

  /* ── Toggle a badge ──────────────────── */
  const toggleBadge = (sectionId: string, badgeKey: string) => {
    const section = sections.find((s) => s.id === sectionId);
    const current: string[] = section?.config?.badges || ['shipping', 'guarantee', 'secure', 'support'];
    const updated = current.includes(badgeKey)
      ? current.filter((b) => b !== badgeKey)
      : [...current, badgeKey];
    updateConfig(sectionId, 'badges', updated);
  };

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-sm text-gray-800">أقسام الصفحة الرئيسية</h3>
      <p className="text-xs text-gray-400">رتّب الأقسام، أظهر أو أخفِ، وعدّل محتوى كل قسم</p>

      <div className="space-y-1.5">
        {sorted.map((section, index) => {
          const meta = SECTION_META[section.id];
          if (!meta) return null;

          const isExpanded = expandedId === section.id;
          const { Icon } = meta;

          return (
            <div
              key={section.id}
              className={`rounded-xl border transition-all ${
                section.enabled
                  ? 'bg-white border-gray-200 shadow-sm'
                  : 'bg-gray-50/70 border-gray-100'
              }`}
            >
              {/* ── Row header ────────────────── */}
              <div className="flex items-center gap-1.5 p-2.5">
                {/* Grip icon */}
                <GripVertical className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />

                {/* Section icon + name */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : section.id)}
                  className="flex items-center gap-2 flex-1 min-w-0 text-right"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${meta.iconColor}15` }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: meta.iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${section.enabled ? 'text-gray-800' : 'text-gray-400'}`}>
                      {meta.label}
                    </p>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 text-gray-300 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </button>

                {/* Order arrows */}
                <div className="flex flex-col gap-px flex-shrink-0">
                  <button
                    onClick={() => reorder(index, 'up')}
                    disabled={index === 0}
                    className="p-0.5 hover:text-indigo-600 disabled:opacity-20 text-gray-400"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => reorder(index, 'down')}
                    disabled={index === sorted.length - 1}
                    className="p-0.5 hover:text-indigo-600 disabled:opacity-20 text-gray-400"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                {/* Toggle enable/disable */}
                <button
                  onClick={() => toggleEnabled(section.id)}
                  className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                    section.enabled ? 'text-indigo-600 bg-indigo-50' : 'text-gray-300 bg-gray-100'
                  }`}
                  title={section.enabled ? 'إخفاء' : 'إظهار'}
                >
                  {section.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* ── Expanded config ──────────── */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-gray-100 space-y-3">
                  <p className="text-[10px] text-gray-400">{meta.description}</p>

                  {/* Standard fields */}
                  {meta.fields.map((field) => (
                    <FieldRenderer
                      key={field.key}
                      field={field}
                      value={section.config?.[field.key]}
                      onChangeValue={(val) => updateConfig(section.id, field.key, val)}
                    />
                  ))}

                  {/* Trust badges special UI */}
                  {section.id === 'trust_badges' && (
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-600">الشارات المفعّلة</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {BADGE_OPTIONS.map((badge) => {
                          const isOn = (section.config?.badges || ['shipping', 'guarantee', 'secure', 'support']).includes(badge.key);
                          return (
                            <button
                              key={badge.key}
                              onClick={() => toggleBadge(section.id, badge.key)}
                              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-[11px] font-medium transition-all ${
                                isOn
                                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                                  : 'border-gray-200 text-gray-400 hover:border-gray-300'
                              }`}
                            >
                              <div className={`w-3 h-3 rounded-sm border-2 flex items-center justify-center
                                ${isOn ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'}`}
                              >
                                {isOn && (
                                  <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              {badge.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Generic field renderer
   ──────────────────────────────────────────────────────────────────────────── */

/* ── Debounced text input: local state for smooth typing, propagates after delay ── */
function DebouncedInput({ value: propValue, onDebouncedChange, delay = 700, as: Element = 'input', ...rest }: {
  value: string;
  onDebouncedChange: (val: string) => void;
  delay?: number;
  as?: 'input' | 'textarea';
  [k: string]: any;
}) {
  const [local, setLocal] = useState(propValue);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const latestCb = useRef(onDebouncedChange);
  latestCb.current = onDebouncedChange;

  // Sync from ext props only when the user isn't actively typing
  const isFocused = useRef(false);
  useEffect(() => {
    if (!isFocused.current) setLocal(propValue);
  }, [propValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocal(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => latestCb.current(val), delay);
  };

  // On blur, flush immediately so changes aren't lost
  const handleBlur = () => {
    isFocused.current = false;
    clearTimeout(timerRef.current);
    if (local !== propValue) latestCb.current(local);
  };

  return (
    <Element
      {...rest}
      value={local}
      onChange={handleChange}
      onFocus={() => { isFocused.current = true; }}
      onBlur={handleBlur}
    />
  );
}

function FieldRenderer({ field, value, onChangeValue }: {
  field: FieldDef;
  value: any;
  onChangeValue: (val: any) => void;
}) {
  const labelClass = 'block text-[11px] font-semibold text-gray-600 mb-1';
  const inputClass = 'w-full px-2.5 py-2 rounded-lg border border-gray-200 outline-none focus:border-indigo-400 text-xs text-gray-700 placeholder:text-gray-300';

  switch (field.type) {
    case 'text':
      return (
        <div>
          <label className={labelClass}>{field.label}</label>
          <DebouncedInput
            type="text"
            value={value ?? ''}
            onDebouncedChange={(v) => onChangeValue(v)}
            placeholder={field.placeholder}
            className={inputClass}
          />
        </div>
      );

    case 'textarea':
      return (
        <div>
          <label className={labelClass}>{field.label}</label>
          <DebouncedInput
            as="textarea"
            value={value ?? ''}
            onDebouncedChange={(v) => onChangeValue(v)}
            placeholder={field.placeholder}
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </div>
      );

    case 'color':
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value || '#6366F1'}
            onChange={(e) => onChangeValue(e.target.value)}
            className="w-8 h-8 rounded-lg cursor-pointer border-0 outline-none bg-transparent flex-shrink-0"
          />
          <div className="flex-1">
            <label className="text-[11px] font-semibold text-gray-600">{field.label}</label>
          </div>
          <code className="text-[10px] bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 font-mono text-gray-400">
            {value || '---'}
          </code>
        </div>
      );

    case 'number':
      return (
        <div>
          <label className={labelClass}>{field.label}</label>
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => onChangeValue(Number(e.target.value))}
            min={field.min}
            max={field.max}
            className={`${inputClass} w-24`}
          />
        </div>
      );

    case 'select':
      return (
        <div>
          <label className={labelClass}>{field.label}</label>
          <select
            value={value ?? ''}
            onChange={(e) => onChangeValue(e.target.value)}
            className={inputClass}
          >
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );

    case 'toggle':
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChangeValue(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-8 h-[18px] bg-gray-200 peer-checked:bg-indigo-500 rounded-full relative transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:w-3.5 after:h-3.5 after:transition-transform peer-checked:after:translate-x-3.5" />
          <span className="text-[11px] font-semibold text-gray-600">{field.label}</span>
        </label>
      );

    default:
      return null;
  }
}

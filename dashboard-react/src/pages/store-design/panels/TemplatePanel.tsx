import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { themeAPI } from '@/lib/api';
import { Zap, Flame, Scissors, Flower2, Diamond, LayoutGrid, type LucideIcon } from 'lucide-react';

const TEMPLATES: { id: string; nameAr: string; Icon: LucideIcon; color: string; isDark: boolean }[] = [
  { id: 'spark',  nameAr: 'سبارك',   Icon: Zap,        color: '#6366F1', isDark: false },
  { id: 'volt',   nameAr: 'فولت',    Icon: Flame,      color: '#F59E0B', isDark: true  },
  { id: 'epure',  nameAr: 'إيبور',   Icon: Scissors,   color: '#92400E', isDark: false },
  { id: 'bloom',  nameAr: 'بلوم',    Icon: Flower2,    color: '#EC4899', isDark: false },
  { id: 'noir',   nameAr: 'نوار',    Icon: Diamond,    color: '#B8973B', isDark: true  },
  { id: 'mosaic', nameAr: 'موزاييك', Icon: LayoutGrid, color: '#7C3AED', isDark: false },
];

interface Props {
  draft: any;
  onChange: (update: Record<string, any>) => void;
  subdomain: string;
  onRefresh?: () => void;
}

export default function TemplatePanel({ draft, onRefresh }: Props) {
  const qc = useQueryClient();
  const currentTemplate = draft?.templateId || 'spark';

  const applyMutation = useMutation({
    mutationFn: (tid: string) => themeAPI.applyTemplate(tid),
    onMutate: (tid) => {
      // Optimistic update: immediately show the new template as active
      qc.setQueryData(['theme'], (old: any) => {
        if (!old) return old;
        const currentDraft = old.draft || old.published || {};
        return { ...old, draft: { ...currentDraft, templateId: tid } };
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['theme'] });
      toast.success('تم تطبيق القالب');
      setTimeout(() => onRefresh?.(), 500);
    },
    onError: () => {
      // Revert on error
      qc.invalidateQueries({ queryKey: ['theme'] });
      toast.error('فشل تطبيق القالب');
    },
  });

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-sm text-gray-800">اختر القالب</h3>
      <p className="text-xs text-gray-400">تطبيق قالب جديد سيعيد ألوان وإعدادات الصفحة الرئيسية للوضع الافتراضي.</p>
      <div className="grid grid-cols-2 gap-2">
        {TEMPLATES.map((tpl) => {
          const isActive = currentTemplate === tpl.id;
          const isLoading = applyMutation.isPending && applyMutation.variables === tpl.id;
          return (
            <button
              key={tpl.id}
              onClick={() => applyMutation.mutate(tpl.id)}
              disabled={applyMutation.isPending}
              className={`relative text-right p-3 rounded-xl border-2 transition-all active:scale-95 disabled:opacity-60 ${isActive ? '' : 'border-gray-100 hover:border-gray-300'}`}
              style={{
                backgroundColor: tpl.isDark ? '#111' : '#FAFAFA',
                borderColor: isActive ? tpl.color : undefined,
              }}
            >
              {isActive && (
                <div className="absolute top-1 left-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: tpl.color }}>
                  ✓
                </div>
              )}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              )}
              <tpl.Icon className="w-6 h-6 mb-1" style={{ color: tpl.color }} />
              <div className="text-xs font-bold" style={{ color: tpl.isDark ? '#FFF' : '#111' }}>{tpl.nameAr}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

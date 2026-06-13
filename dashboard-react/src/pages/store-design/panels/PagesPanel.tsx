import { useState, useRef, useCallback, useEffect } from 'react';
import { ToggleLeft, ToggleRight, FileText, Settings, Eye } from 'lucide-react';

interface Props {
  draft: any;
  onChange: (update: Record<string, any>) => void;
}

const PAGE_DEFINITIONS = [
  { key: 'about',    label: 'من نحن (About Us)' },
  { key: 'contact',  label: 'اتصل بنا (Contact Us)' },
  { key: 'faq',      label: 'الأسئلة الشائعة (FAQ)' },
  { key: 'shipping', label: 'سياسة الشحن (Shipping Policy)' },
  { key: 'returns',  label: 'سياسة الاسترجاع (Returns Policy)' },
  { key: 'privacy',  label: 'سياسة الخصوصية (Privacy Policy)' },
];

export default function PagesPanel({ draft, onChange }: Props) {
  const pages = draft?.pages || {};
  const [selectedKey, setSelectedKey] = useState('about');
  
  const currentPageData = pages[selectedKey] || {
    enabled: true,
    title: PAGE_DEFINITIONS.find(p => p.key === selectedKey)?.label.split(' (')[0] || '',
    content: ''
  };

  const [title, setTitle] = useState(currentPageData.title || '');
  const [content, setContent] = useState(currentPageData.content || '');

  // Reset local state when switching active page or when draft changes externally
  useEffect(() => {
    setTitle(currentPageData.title || '');
    setContent(currentPageData.content || '');
  }, [selectedKey, currentPageData.title, currentPageData.content]);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const triggerChange = useCallback((updatedPage: any) => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      onChange({
        pages: {
          ...pages,
          [selectedKey]: {
            ...pages[selectedKey],
            ...updatedPage
          }
        }
      });
    }, 400);
  }, [onChange, pages, selectedKey]);

  const handleEnabledToggle = () => {
    const nextEnabled = !currentPageData.enabled;
    onChange({
      pages: {
        ...pages,
        [selectedKey]: {
          ...pages[selectedKey],
          enabled: nextEnabled
        }
      }
    });
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    triggerChange({ title: newTitle, content });
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    triggerChange({ title, content: newContent });
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-extrabold text-sm text-slate-800">إدارة الصفحات</h3>
        <p className="text-[11px] text-slate-400 mt-1">قم بتعديل محتوى وتفعيل الصفحات الثابتة لمتجرك</p>
      </div>

      {/* Page Selector Tabs */}
      <div className="grid grid-cols-2 gap-1.5 border border-slate-100 bg-slate-50/50 p-1 rounded-xl">
        {PAGE_DEFINITIONS.map((p) => (
          <button
            key={p.key}
            onClick={() => setSelectedKey(p.key)}
            className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all text-center ${
              selectedKey === p.key
                ? 'bg-white text-slate-900 shadow-sm border border-slate-100/55'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {p.label.split(' (')[0]}
          </button>
        ))}
      </div>

      {/* Editor Space */}
      <div className="border border-slate-100 p-4 rounded-2xl bg-white shadow-sm space-y-4">
        {/* Toggle Switch */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-extrabold text-slate-700">تفعيل الصفحة</span>
          </div>
          <button
            onClick={handleEnabledToggle}
            className="focus:outline-none text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            {currentPageData.enabled !== false ? (
              <ToggleRight className="w-9 h-9 stroke-[1.5]" />
            ) : (
              <ToggleLeft className="w-9 h-9 text-slate-350 stroke-[1.5]" />
            )}
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-extrabold text-slate-600 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              عنوان الصفحة في القائمة
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="اكتب عنوان الصفحة..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-slate-800 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-extrabold text-slate-600 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              محتوى الصفحة (HTML)
            </label>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="يمكنك كتابة نصوص عادية أو أكواد HTML منسقة لعرض الجداول أو الصور..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-slate-800 transition-colors font-mono resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

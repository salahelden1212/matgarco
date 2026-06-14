import { useState, useEffect } from 'react';
import { Palette, Plus, Loader2, AlertCircle, Store, Clock, Save, Package, Settings2, History, Users as UsersIcon, Globe, Shirt, Monitor, UtensilsCrossed, Smartphone, Wrench, Copy, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import api from '../lib/api';
import { toast } from 'sonner';
import { Modal, Button, Skeleton, Card, Badge } from '../components/ui';
import { PageHeader } from '../components/layout/PageHeader';

function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  if (type === 'success') {
    toast.success(message);
  } else if (type === 'error') {
    toast.error(message);
  } else {
    toast(message);
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  general: 'عام',
  fashion: 'ملابس وموضة',
  electronics: 'إلكترونيات',
  food: 'طعام ومشروبات',
  digital: 'منتجات رقمية',
  services: 'خدمات'
};

const CATEGORY_ICONS: Record<string, any> = {
  general: Globe,
  fashion: Shirt,
  electronics: Monitor,
  food: UtensilsCrossed,
  digital: Smartphone,
  services: Wrench
};

const PLAN_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  free_trial: { label: 'تجربة مجانية', color: 'text-slate-700', bg: 'bg-slate-100' },
  starter: { label: 'Starter', color: 'text-blue-700', bg: 'bg-blue-50' },
  professional: { label: 'Professional', color: 'text-purple-700', bg: 'bg-purple-50' },
  business: { label: 'Business', color: 'text-amber-700', bg: 'bg-amber-50' }
};

export default function ThemesList() {
  const navigate = useNavigate();
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<any>(null);
  const [detailTab, setDetailTab] = useState<'info' | 'merchants' | 'versions'>('info');
  const [themeMerchants, setThemeMerchants] = useState<any[]>([]);
  const [loadingMerchants, setLoadingMerchants] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchThemes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/super-admin/themes');
      setThemes(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch themes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchThemes(); }, []);

  const handlePlansChange = async (id: string, plan: string, checked: boolean) => {
    const theme = themes.find(t => t._id === id);
    if (!theme) return;
    const newPlans = checked
      ? [...(theme.allowedPlans || []), plan]
      : (theme.allowedPlans || []).filter((p: string) => p !== plan);
    try {
      await api.patch(`/super-admin/themes/${id}/plans`, { allowedPlans: newPlans });
      setThemes(themes.map(t => t._id === id ? { ...t, allowedPlans: newPlans } : t));
      showToast('تم تحديث الباقات');
    } catch { showToast('فشل تحديث الباقات', 'error'); }
  };

  const handleDeleteTheme = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا القالب؟')) return;
    try {
      await api.delete(`/super-admin/themes/${id}`);
      setThemes(themes.filter(t => t._id !== id));
      setSelectedTheme(null);
      toast.success('تم حذف القالب');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل حذف القالب');
    }
  };

  const handleCloneTheme = async (id: string, name: string) => {
    try {
      const res = await api.post(`/super-admin/themes/${id}/clone`);
      toast.success(`تم نسخ القالب: ${name}`);
      fetchThemes();
      if (res.data?.data?._id) {
        navigate(`/themes/${res.data.data._id}/builder`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل نسخ القالب');
    }
  };

  const openDetail = async (theme: any) => {
    setSelectedTheme(theme);
    setDetailTab('info');
    setLoadingMerchants(true);
    try {
      const res = await api.get(`/super-admin/themes/${theme._id}/merchants`);
      setThemeMerchants(res.data.data || []);
      setThemes(ts => ts.map(t => t._id === theme._id ? { ...t, merchantCount: res.data.count } : t));
    } catch { setThemeMerchants([]); }
    finally { setLoadingMerchants(false); }
  };

  const filteredThemes = themes.filter(t => {
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (searchTerm && !t.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: themes.length,
    active: themes.filter(t => t.status === 'active').length,
    premium: themes.filter(t => t.isPremium).length,
    totalMerchants: themes.reduce((s, t) => s + (t.merchantCount || 0), 0)
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader icon={<Palette size={24} />} title="محرك القوالب" iconBg="bg-purple-50" iconColor="text-purple-600" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <Skeleton key={i} className="h-80 rounded-3xl" />)}
        </div>
      </div>
    );
  }

  if (error) return <Card className="p-6"><div className="flex items-center gap-2 text-red-600"><AlertCircle size={20}/> {error}</div></Card>;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Palette size={24} />}
        title="محرك القوالب (Theme Engine)"
        description="إدارة ومراقبة قوالب المنصة وتحديد الباقات المسموح لها باستخدام كل قالب."
        iconBg="bg-purple-50"
        iconColor="text-purple-600"
        actions={<Button size="sm" icon={<Plus size={16} />} onClick={() => setShowCreateModal(true)}>قالب جديد</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="md" className="text-center">
          <div className="text-2xl font-black text-slate-900">{stats.total}</div>
          <div className="text-sm text-slate-500 font-medium">إجمالي القوالب</div>
        </Card>
        <Card padding="md" className="text-center">
          <div className="text-2xl font-black text-emerald-600">{stats.active}</div>
          <div className="text-sm text-slate-500 font-medium">قوالب نشطة</div>
        </Card>
        <Card padding="md" className="text-center">
          <div className="text-2xl font-black text-amber-600">{stats.premium}</div>
          <div className="text-sm text-slate-500 font-medium">Premium</div>
        </Card>
        <Card padding="md" className="text-center">
          <div className="text-2xl font-black text-blue-600">{stats.totalMerchants}</div>
          <div className="text-sm text-slate-500 font-medium">متاجر تستخدم</div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" placeholder="ابحث عن قالب..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-matgarco-500 w-52" />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-matgarco-500">
          <option value="all">كل التصنيفات</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500">
          <option value="all">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="maintenance">صيانة</option>
          <option value="draft">مسودة</option>
        </select>
      </div>

      {/* Theme Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredThemes.map(theme => (
          <ThemeCard
            key={theme._id}
            theme={theme}
            onPlansChange={(p, c) => handlePlansChange(theme._id, p, c)}
            onOpenDetail={() => openDetail(theme)}
            onDelete={() => handleDeleteTheme(theme._id)}
            onClone={() => handleCloneTheme(theme._id, theme.name)}
          />
        ))}
      </div>

      {selectedTheme && (
        <ThemeDetailModal
          theme={selectedTheme}
          merchants={themeMerchants}
          loadingMerchants={loadingMerchants}
          tab={detailTab}
          setTab={setDetailTab}
          onClose={() => setSelectedTheme(null)}
          onRefresh={fetchThemes}
          onClone={() => handleCloneTheme(selectedTheme._id, selectedTheme.name)}
        />
      )}

      {showCreateModal && (
        <CreateThemeModal
          onClose={() => setShowCreateModal(false)}
          onRefresh={fetchThemes}
          onCreated={(themeId) => navigate(`/themes/${themeId}/builder`)}
        />
      )}
    </div>
  );
}

/* ─── Theme Storefront Preview (Dynamic CSS Mockup) ────────────────────────── */
function ThemeStorefrontPreview({ colors }: { colors: Record<string, string> }) {
  const primary = colors?.primary || '#3B82F6';
  const secondary = colors?.secondary || '#1E40AF';
  const background = colors?.background || '#F8FAFC';
  const surface = colors?.surface || '#FFFFFF';
  const text = colors?.text || '#111827';
  const textMuted = colors?.textMuted || '#6B7280';
  const accent = colors?.accent || '#10B981';
  const border = colors?.border || '#E5E7EB';

  return (
    <div 
      className="w-full h-full flex flex-col text-[6px] select-none font-cairo overflow-hidden transition-all duration-300 group-hover:scale-105" 
      style={{ backgroundColor: background, color: text }}
      dir="rtl"
    >
      {/* Mini Announcement Bar */}
      <div 
        className="h-2 flex items-center justify-center text-[4px] font-bold text-white px-2 shrink-0 overflow-hidden"
        style={{ backgroundColor: secondary }}
      >
        <span>شحن مجاني للطلبات فوق 200 جنيه</span>
      </div>

      {/* Mini Header */}
      <div 
        className="h-6 px-2 flex items-center justify-between border-b shrink-0 bg-white"
        style={{ borderColor: border, backgroundColor: surface, color: text }}
      >
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primary }} />
          <span className="font-extrabold text-[5px]">متجر</span>
        </div>
        <div className="flex items-center gap-1 opacity-60 scale-75">
          <div className="w-2 h-0.5 rounded-xs" style={{ backgroundColor: text }} />
          <div className="w-3 h-0.5 rounded-xs" style={{ backgroundColor: text }} />
          <div className="w-2 h-0.5 rounded-xs" style={{ backgroundColor: text }} />
        </div>
        <div className="flex items-center gap-1 scale-75">
          <div className="w-2 h-2 rounded bg-slate-100 flex items-center justify-center" style={{ color: text, fontSize: '4px' }}>🔍</div>
          <div className="w-2 h-2 rounded bg-slate-100 flex items-center justify-center" style={{ color: text, fontSize: '4px' }}>🛒</div>
        </div>
      </div>

      {/* Mini Hero */}
      <div 
        className="p-1.5 flex flex-col justify-center items-start gap-0.5 relative overflow-hidden shrink-0 border-b"
        style={{ backgroundColor: primary + '12', borderColor: border }}
      >
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full opacity-10 filter blur-xs" style={{ backgroundColor: accent }} />
        <div className="w-10 h-1.5 rounded-xs" style={{ backgroundColor: primary }} />
        <div className="w-16 h-1 rounded-xs" style={{ backgroundColor: textMuted }} />
        <div className="px-1 py-[1px] rounded-[2px] text-[3.5px] text-white font-extrabold mt-0.5" style={{ backgroundColor: accent }}>
          تسوق الآن
        </div>
      </div>

      {/* Mini Products Grid */}
      <div className="p-1.5 flex-1 grid grid-cols-3 gap-1 overflow-hidden">
        {[1, 2, 3].map(i => (
          <div 
            key={i} 
            className="rounded border p-0.5 flex flex-col gap-0.5"
            style={{ backgroundColor: surface, borderColor: border }}
          >
            <div className="aspect-square rounded-xs bg-slate-50 flex items-center justify-center overflow-hidden" style={{ backgroundColor: background }}>
              <div className="w-2 h-2 rounded-full opacity-25 flex items-center justify-center" style={{ color: textMuted, fontSize: '4px' }}>🛍️</div>
            </div>
            <div className="w-full h-[3px] rounded-xs" style={{ backgroundColor: text, opacity: 0.8 }} />
            <div className="flex items-center justify-between scale-90 origin-right">
              <div className="w-3 h-1 rounded-xs" style={{ backgroundColor: accent }} />
              <div className="w-2 h-[3px] rounded-xs" style={{ backgroundColor: textMuted }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Theme Card ─────────────────────────────────────────────────────────────── */
function ThemeCard({ theme, onPlansChange, onOpenDetail, onDelete, onClone }: {
  theme: any; onPlansChange: (p: string, c: boolean) => void;
  onOpenDetail: () => void; onDelete: () => void; onClone: () => void;
}) {
  const [showHover, setShowHover] = useState(false);

  return (
    <div
      className={clsx(
        'bg-white rounded-3xl border transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-xl',
        theme.status === 'active' ? 'border-slate-200 hover:border-indigo-300' : 'border-slate-200 opacity-80'
      )}
      onMouseEnter={() => setShowHover(true)}
      onMouseLeave={() => setShowHover(false)}
    >
      {theme.isPremium && (
        <div className="absolute top-4 right-4 z-20 bg-gradient-to-tr from-amber-400 to-amber-300 text-amber-950 text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg shadow-amber-400/20">
          ⭐ Premium
        </div>
      )}

      <div className="aspect-video bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden border-b border-slate-100">
        <ThemeStorefrontPreview colors={theme.globalSettings?.colors} />
        {showHover && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center gap-3 z-10 animate-in fade-in duration-200">
            <button onClick={onOpenDetail} className="w-12 h-12 rounded-full bg-white text-slate-900 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg" title="تعديل الخصائص">
              <Settings2 size={20} />
            </button>
            <button onClick={onDelete} className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg" title="حذف القالب">
              <Package size={20} />
            </button>
          </div>
        )}
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2 truncate">
              {theme.name}
              <span className="text-slate-400 font-medium text-xs font-mono shrink-0">v{theme.version || '1.0.0'}</span>
            </h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge variant="default" size="xs" className="px-2 py-0.5">
                {(() => { const Icon = CATEGORY_ICONS[theme.category]; return Icon ? <Icon size={10} className="ml-1" /> : null })()}
                {CATEGORY_LABELS[theme.category] || 'عام'}
              </Badge>
              {theme.merchantCount > 0 && (
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
                  <Store size={12} /> {theme.merchantCount} متجر
                </span>
              )}
            </div>
          </div>
          
          {/* Colors Swatch Palette */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-full p-1 shrink-0">
            {Object.entries(theme.globalSettings?.colors || {}).slice(0, 5).map(([key, val]: [string, any]) => {
              const labelMap: Record<string, string> = {
                primary: 'الرئيسي',
                secondary: 'الثانوي',
                background: 'الخلفية',
                surface: 'السطح',
                text: 'النص',
                accent: 'التمييز',
              };
              if (!labelMap[key]) return null;
              return (
                <div 
                  key={key} 
                  className="group/swatch relative w-3.5 h-3.5 rounded-full border border-slate-200 cursor-help"
                  style={{ backgroundColor: val }}
                >
                  <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-950 text-white text-[9px] rounded font-bold whitespace-nowrap opacity-0 group-hover/swatch:opacity-100 transition-opacity duration-150 pointer-events-none z-20 shadow-md">
                    {labelMap[key]}: {val}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 h-10">{theme.description}</p>

        <div className="flex justify-between items-center text-sm border-t border-slate-50 pt-2.5">
          <span className="font-bold text-slate-700">الحالة</span>
          <Badge variant={theme.status === 'active' ? 'success' : theme.status === 'maintenance' ? 'warning' : 'default'} dot>
            {theme.status === 'active' ? 'متاح' : theme.status === 'maintenance' ? 'صيانة' : 'مسودة'}
          </Badge>
        </div>

        <div className="border-t border-slate-100 pt-3 space-y-2">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">الباقات المسموحة</span>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(PLAN_LABELS).map(([planId, { label, color, bg }]) => (
              <label key={planId} className={clsx("flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer text-xs font-bold transition-all border border-transparent hover:border-slate-200", bg, color)}>
                <input type="checkbox" checked={(theme.allowedPlans || []).includes(planId)} onChange={e => onPlansChange(planId, e.target.checked)} className="w-3.5 h-3.5 rounded accent-current cursor-pointer" />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-2">
          <button onClick={onOpenDetail} className="py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-350 transition-colors flex items-center justify-center gap-1 active:scale-98">
            <Settings2 size={13} /> الخصائص
          </button>
          <button onClick={onClone} className="py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-350 transition-colors flex items-center justify-center gap-1 active:scale-98">
            <Copy size={13} /> نسخ
          </button>
          <Link to={`/themes/${theme._id}/builder`} className="py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold flex items-center justify-center gap-1 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 active:scale-98">
            <Palette size={13} /> مصمم
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Theme Detail Modal ─────────────────────────────────────────────────────── */
function ThemeDetailModal({ theme, merchants, loadingMerchants, tab, setTab, onClose, onRefresh, onClone }: {
  theme: any; merchants: any[]; loadingMerchants: boolean;
  tab: 'info' | 'merchants' | 'versions'; setTab: (t: any) => void;
  onClose: () => void; onRefresh: () => void; onClone: () => void;
}) {
  const [editName, setEditName] = useState(theme.name);
  const [editDesc, setEditDesc] = useState(theme.description);
  const [editPremium, setEditPremium] = useState(theme.isPremium);
  const [saving, setSaving] = useState(false);
  const [newVersion, setNewVersion] = useState('');
  const [changelog, setChangelog] = useState('');
  const [versionSaving, setVersionSaving] = useState(false);

  const handleSaveInfo = async () => {
    setSaving(true);
    try {
      await api.patch(`/super-admin/themes/${theme._id}`, { name: editName, description: editDesc, isPremium: editPremium });
      onRefresh();
      showToast('تم الحفظ بنجاح');
    } catch { showToast('فشل الحفظ', 'error'); }
    finally { setSaving(false); }
  };

  const handleReleaseVersion = async () => {
    if (!newVersion) return showToast('أدخل رقم الإصدار', 'info');
    setVersionSaving(true);
    try {
      await api.post(`/super-admin/themes/${theme._id}/version`, { version: newVersion, changelog });
      setNewVersion(''); setChangelog('');
      onRefresh();
      showToast('تم إصدار التحديث');
    } catch { showToast('فشل إصدار التحديث', 'error'); }
    finally { setVersionSaving(false); }
};

  return (
    <Modal open onClose={onClose} title={theme.name} size="lg">
      <div className="flex border-b border-slate-100 px-6">
        {[
          { id: 'info', label: 'معلومات وتعديل', icon: Settings2 },
          { id: 'merchants', label: `المتاجر (${merchants.length})`, icon: UsersIcon },
          { id: 'versions', label: 'الإصدارات', icon: History }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={clsx(
              "flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors",
              tab === t.id ? 'border-matgarco-500 text-matgarco-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {tab === 'info' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">اسم القالب</label>
              <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-matgarco-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">الوصف</label>
              <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-matgarco-500 outline-none resize-none" />
            </div>
            <label className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer">
              <input type="checkbox" checked={editPremium} onChange={e => setEditPremium(e.target.checked)} className="w-5 h-5 accent-amber-600" />
              <span className="font-bold text-amber-900">👑 قالب Premium</span>
            </label>
            <div className="flex gap-3">
              <button onClick={handleSaveInfo} disabled={saving} className="flex items-center gap-2 bg-matgarco-600 hover:bg-matgarco-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors disabled:bg-slate-400">
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} حفظ
              </button>
              <button onClick={onClone} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold transition-colors">
                <Copy size={18} /> نسخ القالب
              </button>
            </div>
          </div>
        )}

        {tab === 'merchants' && (
          loadingMerchants ? <div className="flex justify-center py-10"><div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" /></div>
          : merchants.length === 0 ? <div className="text-center py-10 text-slate-400">لا توجد متاجر تستخدم هذا القالب</div>
          : <div className="space-y-2">
            {merchants.map((m: any) => (
              <div key={m._id || m.merchantId} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><Store size={18} /></div>
                  <div>
                    <div className="font-bold text-slate-900">{m.storeName}</div>
                    <div className="text-xs text-slate-500 font-mono">{m.subdomain}.matgarco.com</div>
                  </div>
                </div>
                <Badge variant={m.isActive ? 'success' : 'danger'} dot>{m.isActive ? 'نشط' : 'موقوف'}</Badge>
              </div>
            ))}
          </div>
        )}

        {tab === 'versions' && (
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <h4 className="font-bold text-slate-900 flex items-center gap-2"><Package size={16} /> إصدار تحديث جديد</h4>
              <div className="grid grid-cols-2 gap-4">
                <input value={newVersion} onChange={e => setNewVersion(e.target.value)} placeholder="مثال: 1.1.0" dir="ltr" className="px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-sm font-mono outline-none focus:border-indigo-500" />
                <input value={changelog} onChange={e => setChangelog(e.target.value)} placeholder="ما الجديد؟" className="px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-sm outline-none focus:border-indigo-500" />
              </div>
              <Button variant="primary" icon={<Package size={14} />} loading={versionSaving} onClick={handleReleaseVersion}>نشر الإصدار</Button>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-3">الإصدار الحالي: v{theme.version || '1.0.0'}</h4>
              {(theme.previousVersions || []).length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm">لا توجد إصدارات سابقة</div>
              ) : (
                <div className="space-y-2">
                  {[...(theme.previousVersions || [])].reverse().map((v: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg">
                      <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500"><Clock size={14} /></div>
                      <div className="flex-1">
                        <span className="font-bold text-slate-900 font-mono text-sm">v{v.version}</span>
                        <span className="text-slate-400 text-xs mr-2">{v.releasedAt ? new Date(v.releasedAt).toLocaleDateString() : ''}</span>
                        {v.changelog && <p className="text-xs text-slate-500 mt-0.5">{v.changelog}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function CreateThemeModal({ onClose, onRefresh, onCreated }: { onClose: () => void; onRefresh: () => void; onCreated: (themeId: string) => void }) {
  const [form, setForm] = useState({ name: '', slug: '', description: '', category: 'general', status: 'draft', isPremium: false });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    try {
      const autoSlug = form.name.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '') || `theme-${Date.now()}`;
      const res = await api.post('/super-admin/themes', { name: form.name, slug: form.slug || autoSlug, description: form.description, category: form.category, status: form.status, isPremium: form.isPremium });
      const createdId = res.data?.data?._id;
      onRefresh();
      onClose();
      if (createdId) onCreated(createdId);
    } catch { showToast('فشل إنشاء القالب!', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <Modal open onClose={onClose} title="إنشاء هيكل قالب جديد" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">اسم القالب</label>
          <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="مثال: Dawn" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Slug</label>
          <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="dawn-theme" dir="ltr" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none font-mono text-sm" />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">الوصف</label>
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none resize-none" />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">التصنيف</label>
          <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none">
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer">
          <input type="checkbox" checked={form.isPremium} onChange={e => setForm(p => ({ ...p, isPremium: e.target.checked }))} className="w-5 h-5 accent-amber-600" />
          <span className="font-bold text-amber-900">قالب Premium مدفوع</span>
        </label>
        <Button type="submit" fullWidth loading={saving}>إنشاء الهيكل</Button>
      </form>
    </Modal>
  );
}

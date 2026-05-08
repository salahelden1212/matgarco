import { useState, useEffect } from 'react';
import { Palette, Plus, AlertCircle, Store, Clock, Save, Package, Settings2, History, Globe, Shirt, Monitor, UtensilsCrossed, Smartphone, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import api from '../lib/api';
import { Button, Card, Badge, Modal, Skeleton, EmptyState, Tabs } from '../components/ui';
import { PageHeader } from '../components/layout/PageHeader';
import { showToast } from '../components/ui/Toast';

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
      showToast('تم حذف القالب');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'فشل حذف القالب', 'error');
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
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500">
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

      {filteredThemes.length === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={<Palette size={32} />}
            title="لا توجد قوالب"
            description="ابدأ بإنشاء أول قالب جديد."
            action={{ label: '+ قالب جديد', onClick: () => setShowCreateModal(true) }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredThemes.map(theme => (
            <ThemeCard
              key={theme._id}
              theme={theme}
              onPlansChange={(p, c) => handlePlansChange(theme._id, p, c)}
              onOpenDetail={() => openDetail(theme)}
              onDelete={() => handleDeleteTheme(theme._id)}
            />
          ))}
        </div>
      )}

      {selectedTheme && (
        <ThemeDetailModal
          theme={selectedTheme}
          merchants={themeMerchants}
          loadingMerchants={loadingMerchants}
          tab={detailTab}
          setTab={setDetailTab}
          onClose={() => setSelectedTheme(null)}
          onRefresh={fetchThemes}
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

function ThemeCard({ theme, onPlansChange, onOpenDetail, onDelete }: {
  theme: any; onPlansChange: (p: string, c: boolean) => void;
  onOpenDetail: () => void; onDelete: () => void;
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
        <div className="absolute top-4 right-4 z-10 bg-gradient-to-tr from-amber-400 to-amber-300 text-amber-950 text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg shadow-amber-400/20">
          ⭐ Premium
        </div>
      )}

      <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 font-bold">
          <Palette size={32} className="mb-2 opacity-40" />
          {theme.name}
        </div>
        {showHover && (
          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center gap-3">
            <button onClick={onOpenDetail} className="w-12 h-12 rounded-full bg-white text-slate-900 flex items-center justify-center hover:scale-110 transition-transform" title="تفاصيل">
              <Settings2 size={20} />
            </button>
            <button onClick={onDelete} className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform" title="حذف">
              <Package size={20} />
            </button>
          </div>
        )}
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h3 className="text-xl font-black text-slate-900">
            {theme.name}
            <span className="text-slate-400 font-medium text-sm mr-2 font-mono">v{theme.version || '1.0.0'}</span>
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="default" size="xs">
              {(() => { const Icon = CATEGORY_ICONS[theme.category]; return Icon ? <Icon size={10} /> : null })()}
              {CATEGORY_LABELS[theme.category] || 'عام'}
            </Badge>
            {theme.merchantCount > 0 && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Store size={12} /> {theme.merchantCount} متجر
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{theme.description}</p>

        <div className="flex justify-between items-center text-sm">
          <span className="font-bold text-slate-700">الحالة</span>
          <Badge variant={theme.status === 'active' ? 'success' : theme.status === 'maintenance' ? 'warning' : 'default'} dot>
            {theme.status === 'active' ? 'متاح' : theme.status === 'maintenance' ? 'صيانة' : 'مسودة'}
          </Badge>
        </div>

        <div className="border-t border-slate-100 pt-3 space-y-2">
          <span className="text-sm font-bold text-slate-700 block mb-1">الباقات المسموحة</span>
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(PLAN_LABELS).map(([planId, { label, color, bg }]) => (
              <label key={planId} className={clsx("flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer text-xs font-bold transition-colors", bg, color)}>
                <input type="checkbox" checked={(theme.allowedPlans || []).includes(planId)} onChange={e => onPlansChange(planId, e.target.checked)} className="w-3.5 h-3.5 rounded accent-current" />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <Button variant="secondary" size="sm" icon={<Settings2 size={14} />} fullWidth onClick={onOpenDetail}>الخصائص</Button>
          <Button size="sm" variant="primary" icon={<Palette size={14} />} fullWidth onClick={() => window.location.href = `/themes/${theme._id}/builder`}>مصمم القالب</Button>
        </div>
      </div>
    </div>
  );
}

function ThemeDetailModal({ theme, merchants, loadingMerchants, tab, setTab, onClose, onRefresh }: {
  theme: any; merchants: any[]; loadingMerchants: boolean;
  tab: 'info' | 'merchants' | 'versions'; setTab: (t: any) => void;
  onClose: () => void; onRefresh: () => void;
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
    <Modal open onClose={onClose} title={theme.name} size="2xl" footer={
      <Button variant="secondary" onClick={onClose}>إغلاق</Button>
    }>
      <Tabs tabs={[
        { id: 'info', label: 'معلومات', icon: <Settings2 size={14} /> },
        { id: 'merchants', label: `المتاجر (${merchants.length})`, icon: <Store size={14} /> },
        { id: 'versions', label: 'الإصدارات', icon: <History size={14} /> },
      ]} activeTab={tab} onChange={setTab} className="-mx-6 px-6" />

      <div className="pt-4">
        {tab === 'info' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">اسم القالب</label>
              <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">الوصف</label>
              <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none resize-none" />
            </div>
            <label className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer">
              <input type="checkbox" checked={editPremium} onChange={e => setEditPremium(e.target.checked)} className="w-5 h-5 accent-amber-600" />
              <span className="font-bold text-amber-900">قالب Premium</span>
            </label>
            <Button icon={<Save size={16} />} fullWidth loading={saving} onClick={handleSaveInfo}>حفظ التعديلات</Button>
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

import { useState, useEffect } from 'react';
import { Settings, Save, Mail, CreditCard, ShieldCheck, AlertCircle, Megaphone, Send, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../lib/api';
import { Button, Card, Input, Textarea, Select, Tabs, Badge, Skeleton } from '../components/ui';
import { PageHeader } from '../components/layout/PageHeader';
import { showToast } from '../components/ui/Toast';

export default function GlobalSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  const [formData, setFormData] = useState({
    siteName: '', supportEmail: '', maintenanceMode: false,
    payment: { paymobApiKey: '', paymobIframeId: '', paymobHmac: '' },
    smtp: { host: '', port: 587, user: '', pass: '' },
    featureFlags: { aiEnabled: true, reviewsEnabled: true, newSignupsEnabled: true, affiliateEnabled: false }
  });

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState('info');
  const [annSending, setAnnSending] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [settingsRes, annRes] = await Promise.all([
          api.get('/super-admin/settings'),
          api.get('/super-admin/announcements')
        ]);
        const s = settingsRes.data.data;
        setFormData({
          siteName: s.siteName || 'Matgarco',
          supportEmail: s.supportEmail || 'support@matgarco.com',
          maintenanceMode: s.maintenanceMode || false,
          payment: s.payment || { paymobApiKey: '', paymobIframeId: '', paymobHmac: '' },
          smtp: s.smtp || { host: '', port: 587, user: '', pass: '' },
          featureFlags: s.featureFlags || { aiEnabled: true, reviewsEnabled: true, newSignupsEnabled: true, affiliateEnabled: false }
        });
        setAnnouncements(annRes.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'فشل تحميل الإعدادات');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleChange = (section: string, field: string, value: any) => {
    if (section === 'root') {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else {
      setFormData(prev => ({ ...prev, [section]: { ...(prev as any)[section], [field]: value } }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setSaved(false);
    try {
      await api.patch('/super-admin/settings', formData);
      setSaved(true);
      showToast('تم الحفظ بنجاح');
      setTimeout(() => setSaved(false), 3000);
    } catch { showToast('فشل حفظ الإعدادات', 'error'); }
    finally { setSaving(false); }
  };

  const handleSendAnnouncement = async () => {
    if (!annTitle || !annContent) return showToast('أدخل العنوان والمحتوى', 'warning');
    setAnnSending(true);
    try {
      const res = await api.post('/super-admin/announcements', { title: annTitle, content: annContent, type: annType, targetPlans: ['all'] });
      setAnnouncements(prev => [res.data.data, ...prev]);
      setAnnTitle(''); setAnnContent('');
      showToast('تم إرسال التعميم');
    } catch { showToast('فشل إرسال التعميم', 'error'); }
    finally { setAnnSending(false); }
  };

  const handleDeleteAnn = async (id: string) => {
    try {
      await api.delete(`/super-admin/announcements/${id}`);
      setAnnouncements(prev => prev.filter(a => a._id !== id));
      showToast('تم الحذف');
    } catch { showToast('فشل الحذف', 'error'); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader icon={<Settings size={24} />} title="الإعدادات العامة" iconBg="bg-slate-100" iconColor="text-slate-700" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-60 rounded-3xl" />
          <Skeleton className="h-60 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error) return <Card className="p-6"><div className="flex items-center gap-2 text-red-600"><AlertCircle size={20}/> {error}</div></Card>;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Settings size={24} />}
        title="الإعدادات العامة للمنصة"
        description="تحكم كامل في إعدادات المنصة، بوابات الدفع، خوادم البريد، والصيانة."
        iconBg="bg-slate-100"
        iconColor="text-slate-700"
      />

      <Tabs
        tabs={[
          { id: 'general', label: 'إعدادات عامة', icon: <Settings size={14} /> },
          { id: 'payment', label: 'بوابات الدفع', icon: <CreditCard size={14} /> },
          { id: 'smtp', label: 'خادم البريد', icon: <Mail size={14} /> },
          { id: 'features', label: 'الخصائص', icon: <ShieldCheck size={14} /> },
          { id: 'announcements', label: 'التعميمات', icon: <Megaphone size={14} /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <form onSubmit={handleSave}>
        {activeTab === 'general' && (
          <Card>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="اسم المنصة" value={formData.siteName} onChange={e => handleChange('root', 'siteName', e.target.value)} />
                <Input label="بريد الدعم الفني" type="email" value={formData.supportEmail} onChange={e => handleChange('root', 'supportEmail', e.target.value)} dir="ltr" />
              </div>
              <label className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer">
                <input type="checkbox" checked={formData.maintenanceMode} onChange={e => handleChange('root', 'maintenanceMode', e.target.checked)} className="w-5 h-5 accent-amber-600 rounded" />
                <div>
                  <span className="font-bold text-amber-900">وضع الصيانة (Maintenance Mode)</span>
                  <p className="text-xs text-amber-700/80 font-normal mt-0.5">سيتم إيقاف التسجيل للمتاجر الجديدة.</p>
                </div>
              </label>
            </div>
          </Card>
        )}

        {activeTab === 'payment' && (
          <Card>
            <div className="space-y-4">
              <Input label="Secret API Key (Paymob)" type="password" value={formData.payment.paymobApiKey} onChange={e => handleChange('payment', 'paymobApiKey', e.target.value)} dir="ltr" hint="احصل عليه من لوحة Paymob" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Iframe ID" value={formData.payment.paymobIframeId} onChange={e => handleChange('payment', 'paymobIframeId', e.target.value)} dir="ltr" />
                <Input label="HMAC Secret" type="password" value={formData.payment.paymobHmac} onChange={e => handleChange('payment', 'paymobHmac', e.target.value)} dir="ltr" />
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'smtp' && (
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 grid grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input label="SMTP Host" value={formData.smtp.host} onChange={e => handleChange('smtp', 'host', e.target.value)} dir="ltr" placeholder="smtp.gmail.com" />
                </div>
                <div>
                  <Input label="Port" type="number" value={formData.smtp.port} onChange={e => handleChange('smtp', 'port', Number(e.target.value))} dir="ltr" />
                </div>
              </div>
              <Input label="Username" value={formData.smtp.user} onChange={e => handleChange('smtp', 'user', e.target.value)} dir="ltr" />
              <Input label="Password" type="password" value={formData.smtp.pass} onChange={e => handleChange('smtp', 'pass', e.target.value)} dir="ltr" />
            </div>
          </Card>
        )}

        {activeTab === 'features' && (
          <Card>
            <div className="space-y-3">
              {[
                { key: 'aiEnabled', label: 'الذكاء الاصطناعي', desc: 'تفعيل/إيقاف خدمات AI لكل التجار' },
                { key: 'reviewsEnabled', label: 'نظام المراجعات', desc: 'السماح للعملاء بكتابة مراجعات' },
                { key: 'newSignupsEnabled', label: 'التسجيلات الجديدة', desc: 'السماح بتسجيل متاجر جديدة' },
                { key: 'affiliateEnabled', label: 'نظام الأفيلييت', desc: 'تفعيل نظام الشركاء والتسويق' },
              ].map(flag => (
                <div key={flag.key} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div>
                    <div className="font-bold text-slate-900">{flag.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{flag.desc}</div>
                  </div>
                  <button type="button" onClick={() => handleChange('featureFlags', flag.key, !(formData.featureFlags as any)[flag.key])} className="text-2xl">
                    {(formData.featureFlags as any)[flag.key] ? <ToggleRight className="text-indigo-600" size={32} /> : <ToggleLeft className="text-slate-400" size={32} />}
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'announcements' && (
          <Card>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input label="عنوان الإشعار" value={annTitle} onChange={e => setAnnTitle(e.target.value)} placeholder="مثال: تحديث هام" />
                </div>
                <Select label="النوع" value={annType} onChange={e => setAnnType(e.target.value)} options={[
                  { value: 'info', label: 'معلومات' },
                  { value: 'warning', label: 'تحذير' },
                  { value: 'promo', label: 'عرض ترويجي' },
                ]} />
              </div>
              <Textarea label="محتوى الرسالة" value={annContent} onChange={e => setAnnContent(e.target.value)} placeholder="اكتب تفاصيل الإشعار..." rows={3} />
              <div className="flex justify-end">
                <Button type="button" variant="primary" icon={<Send size={16} />} loading={annSending} onClick={handleSendAnnouncement}>إرسال التعميم</Button>
              </div>
            </div>

            {announcements.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-6">
                <h3 className="text-sm font-bold text-slate-700 mb-3">التعميمات السابقة ({announcements.length})</h3>
                <div className="space-y-2">
                  {announcements.map(ann => (
                    <div key={ann._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Badge variant={ann.type === 'warning' ? 'warning' : ann.type === 'promo' ? 'amber' : 'info'}>{ann.type === 'warning' ? 'تحذير' : ann.type === 'promo' ? 'عرض' : 'معلومات'}</Badge>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-sm truncate">{ann.title}</div>
                          <div className="text-xs text-slate-500 truncate">{ann.content}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-slate-400">{new Date(ann.createdAt).toLocaleDateString()}</span>
                        <button onClick={() => handleDeleteAnn(ann._id)} className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        <div className="flex items-center gap-4 pt-4">
          <Button type="submit" variant="primary" icon={<Save size={16} />} loading={saving}>حفظ الإعدادات</Button>
          {saved && <Badge variant="success" icon={<ToggleRight size={12} />}>تم الحفظ</Badge>}
        </div>
      </form>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowRight, Store, ShieldAlert, CheckCircle2, XCircle, Users, CreditCard,
  Package, Activity, Loader2, AlertCircle, Eye, Send, ChevronDown,
  Clock, ShoppingBag, Settings2, BarChart2, Ban, Power
} from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

type Tab = 'overview' | 'activity' | 'settings';

const PLANS = [
  { value: 'free_trial', label: 'تجربة مجانية', price: 0 },
  { value: 'starter', label: 'Starter', price: 250 },
  { value: 'professional', label: 'Professional', price: 450 },
  { value: 'business', label: 'Business', price: 699 },
];

export default function MerchantDetails() {
  const { id } = useParams();
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('overview');
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);
  const [planChanging, setPlanChanging] = useState(false);
  const [showNotify, setShowNotify] = useState(false);
  const [notifyMsg, setNotifyMsg] = useState('');
  const [notifySending, setNotifySending] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);

  useEffect(() => {
    const fetchMerchant = async () => {
      try {
        const res = await api.get(`/super-admin/merchants/${id}`);
        setMerchant(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'فشل تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchMerchant();
  }, [id]);

  useEffect(() => {
    if (tab === 'activity' && activityLog.length === 0) {
      setActivityLoading(true);
      // Fetch recent orders for this merchant as activity
      api.get(`/super-admin/merchants/${id}`)
        .then(res => {
          const m = res.data.data;
          // Build fake activity log from stats
          const items: any[] = [];
          if (m.stats?.totalOrders > 0) {
            items.push({ type: 'order', icon: ShoppingBag, color: 'bg-emerald-100 text-emerald-600', message: `${m.stats.totalOrders} طلب إجمالي`, time: new Date().toISOString() });
          }
          if (m.stats?.totalProducts > 0) {
            items.push({ type: 'product', icon: Package, color: 'bg-blue-100 text-blue-600', message: `${m.stats.totalProducts} منتج مضاف`, time: new Date().toISOString() });
          }
          if (m.stats?.totalCustomers > 0) {
            items.push({ type: 'customer', icon: Users, color: 'bg-purple-100 text-purple-600', message: `${m.stats.totalCustomers} عميل مسجل`, time: new Date().toISOString() });
          }
          items.push({ type: 'joined', icon: Store, color: 'bg-matgarco-100 text-matgarco-600', message: `انضم للمنصة بتاريخ ${new Date(m.createdAt).toLocaleDateString('ar-EG')}`, time: m.createdAt });
          setActivityLog(items);
        })
        .finally(() => setActivityLoading(false));
    }
  }, [tab, id, activityLog.length]);

  const handleImpersonate = async () => {
    try {
      const res = await api.post(`/super-admin/impersonate/${id}`);
      window.open(res.data.data.redirectUrl, '_blank');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل الدخول كتاجر');
    }
  };

  const handleChangePlan = async (plan: string) => {
    setPlanChanging(true);
    try {
      const res = await api.patch(`/super-admin/merchants/${id}/plan`, { plan });
      setMerchant(res.data.data);
      toast.success('تم تغيير الباقة بنجاح');
      setShowPlanDropdown(false);
    } catch { toast.error('فشل تغيير الباقة'); }
    finally { setPlanChanging(false); }
  };

  const handleToggleStatus = async () => {
    if (!merchant) return;
    const isSuspended = merchant.subscriptionStatus === 'suspended';
    setStatusChanging(true);
    try {
      await api.patch(`/super-admin/merchants/${id}/status`, {
        status: isSuspended ? 'active' : 'suspended',
      });
      setMerchant((prev: any) => ({ ...prev, subscriptionStatus: isSuspended ? 'active' : 'suspended', isActive: isSuspended }));
      toast.success(isSuspended ? 'تم تفعيل المتجر' : 'تم إيقاف المتجر');
    } catch { toast.error('فشل تغيير الحالة'); }
    finally { setStatusChanging(false); }
  };

  const handleSendNotify = async () => {
    if (!notifyMsg.trim()) return;
    setNotifySending(true);
    try {
      await api.post(`/super-admin/merchants/${id}/notify`, { message: notifyMsg, title: 'رسالة من إدارة المنصة' });
      toast.success('تم إرسال الإشعار');
      setShowNotify(false);
      setNotifyMsg('');
    } catch { toast.error('فشل إرسال الإشعار'); }
    finally { setNotifySending(false); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold"><CheckCircle2 size={14} /> نشط</span>;
      case 'suspended': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-sm font-bold"><ShieldAlert size={14} /> موقوف</span>;
      case 'cancelled': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-bold"><XCircle size={14} /> ملغي</span>;
      default: return null;
    }
  };

  const getPlanLabel = (plan: string) => PLANS.find(p => p.value === plan)?.label || plan;
  const getPlanPrice = (plan: string) => PLANS.find(p => p.value === plan)?.price || 0;

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-matgarco-500" size={40} /></div>;
  if (error || !merchant) return <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2"><AlertCircle /> {error || 'غير موجود'}</div>;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'نظرة عامة', icon: BarChart2 },
    { id: 'activity', label: 'سجل النشاط', icon: Activity },
    { id: 'settings', label: 'الإعدادات والإدارة', icon: Settings2 },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/merchants" className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 shadow-sm">
            <ArrowRight size={20} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-slate-900 truncate">{merchant.storeName}</h1>
            <a href={`https://${merchant.subdomain}.matgarco.com`} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-matgarco-600 text-sm font-mono" dir="ltr">
              {merchant.subdomain}.matgarco.com
            </a>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {getStatusBadge(merchant.subscriptionStatus)}
            <button onClick={() => setShowNotify(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold rounded-xl hover:bg-indigo-100 transition-colors text-sm">
              <Send size={16} /> إرسال إشعار
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-t border-slate-100 pt-4 -mb-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${tab === t.id ? 'bg-matgarco-50 text-matgarco-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Merchant Info */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><Store size={18} className="text-slate-400" /> بيانات المتجر</h2>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                {[
                  { label: 'اسم المالك', value: `${merchant.ownerId?.firstName} ${merchant.ownerId?.lastName}` },
                  { label: 'البريد الإلكتروني', value: merchant.ownerId?.email, mono: true },
                  { label: 'رقم الهاتف', value: merchant.phone || merchant.ownerId?.phone || 'غير متوفر', mono: true },
                  { label: 'تاريخ الانضمام', value: new Date(merchant.createdAt).toLocaleDateString('ar-EG'), mono: true },
                ].map((f, i) => (
                  <div key={i}>
                    <dt className="text-sm text-slate-500">{f.label}</dt>
                    <dd className={`font-bold text-slate-900 ${f.mono ? 'font-mono text-sm' : ''}`}>{f.value}</dd>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><Activity size={18} className="text-slate-400" /> الإحصائيات</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Package, bg: 'bg-blue-100', color: 'text-blue-600', value: merchant.stats?.totalProducts || 0, label: 'منتج' },
                  { icon: CreditCard, bg: 'bg-emerald-100', color: 'text-emerald-600', value: merchant.stats?.totalOrders || 0, label: 'طلب' },
                  { icon: Users, bg: 'bg-purple-100', color: 'text-purple-600', value: merchant.stats?.totalCustomers || 0, label: 'عميل' },
                ].map((s, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${s.bg} ${s.color}`}><s.icon size={16} /></div>
                    <div className="text-2xl font-black text-slate-900">{s.value.toLocaleString()}</div>
                    <div className="text-sm font-medium text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Subscription */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">الاشتراك</h2>
              <div className="flex items-center justify-between p-4 rounded-xl bg-matgarco-50 border border-matgarco-100 mb-4">
                <div>
                  <div className="text-xs text-matgarco-600 font-bold mb-1">الباقة الحالية</div>
                  <div className="text-xl font-black text-matgarco-900">{getPlanLabel(merchant.subscriptionPlan)}</div>
                </div>
                <div className="text-sm font-bold text-matgarco-700 bg-white px-3 py-1.5 rounded-lg border border-matgarco-200 font-mono">
                  {getPlanPrice(merchant.subscriptionPlan)} ج.م/شهر
                </div>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">الحالة</span>
                {getStatusBadge(merchant.subscriptionStatus)}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">إجمالي الإيرادات</span>
                <span className="font-bold text-emerald-600 font-mono">{(merchant.stats?.totalRevenue || 0).toLocaleString()} ج.م</span>
              </div>
            </div>

            {/* God Mode */}
            <div className="bg-red-50 rounded-2xl border border-red-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-red-900 mb-2 flex items-center gap-2"><ShieldAlert size={18} /> منطقة الخطر</h2>
              <p className="text-red-700/80 text-sm mb-5">الإجراءات هنا تؤثر مباشرة على التاجر.</p>
              <div className="space-y-3">
                <button onClick={handleImpersonate} className="w-full flex items-center justify-between px-4 py-3 bg-white border border-red-200 text-slate-900 font-bold rounded-xl hover:bg-red-50 transition-colors shadow-sm">
                  <div className="flex items-center gap-3"><Eye size={18} className="text-slate-400" /> دخول كتاجر (Impersonate)</div>
                </button>
                <button onClick={handleToggleStatus} disabled={statusChanging} className={`w-full flex items-center justify-between px-4 py-3 font-bold rounded-xl transition-colors shadow-sm ${merchant.subscriptionStatus === 'suspended' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'}`}>
                  <div className="flex items-center gap-3">
                    {statusChanging ? <Loader2 size={18} className="animate-spin" /> : merchant.subscriptionStatus === 'suspended' ? <Power size={18} /> : <Ban size={18} />}
                    {merchant.subscriptionStatus === 'suspended' ? 'تفعيل المتجر' : 'إيقاف المتجر'}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><Clock size={18} className="text-slate-400" /> سجل النشاط</h2>
          {activityLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin text-matgarco-500" size={30} /></div>
          ) : activityLog.length === 0 ? (
            <div className="text-center py-16 text-slate-400">لا توجد نشاطات مسجلة</div>
          ) : (
            <div className="relative">
              <div className="absolute right-5 top-0 bottom-0 w-0.5 bg-slate-100" />
              <div className="space-y-6">
                {activityLog.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 relative">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10 shadow-sm ${item.color}`}>
                      <item.icon size={18} />
                    </div>
                    <div className="flex-1 pt-1.5">
                      <div className="font-bold text-slate-900">{item.message}</div>
                      <div className="text-xs text-slate-400 mt-1">{new Date(item.time).toLocaleDateString('ar-EG')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Change Plan */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">تغيير الباقة</h2>
            <p className="text-sm text-slate-500 mb-4">الباقة الحالية: <span className="font-bold text-slate-900">{getPlanLabel(merchant.subscriptionPlan)}</span></p>
            <div className="space-y-2">
              {PLANS.map(p => (
                <button
                  key={p.value}
                  onClick={() => handleChangePlan(p.value)}
                  disabled={planChanging || p.value === merchant.subscriptionPlan}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border font-bold text-sm transition-all ${
                    p.value === merchant.subscriptionPlan
                      ? 'border-matgarco-300 bg-matgarco-50 text-matgarco-700'
                      : 'border-slate-200 hover:border-matgarco-300 hover:bg-matgarco-50 text-slate-700'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <span>{p.label}</span>
                  <span className="font-mono text-xs text-slate-500">{p.price} ج.م/شهر</span>
                </button>
              ))}
            </div>
          </div>

          {/* Send Notification */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Send size={18} className="text-indigo-500" /> إرسال إشعار</h2>
            <textarea
              rows={5}
              placeholder="اكتب رسالتك للتاجر هنا..."
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none resize-none mb-4 text-sm"
              value={notifyMsg}
              onChange={e => setNotifyMsg(e.target.value)}
            />
            <button
              onClick={handleSendNotify}
              disabled={!notifyMsg.trim() || notifySending}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {notifySending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              إرسال الإشعار
            </button>
          </div>
        </div>
      )}

      {/* Notify Modal (from header button) */}
      {showNotify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowNotify(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2"><Send size={20} className="text-indigo-500" /> إرسال إشعار</h2>
            <textarea rows={4} placeholder="اكتب الرسالة..." className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none resize-none mb-4" value={notifyMsg} onChange={e => setNotifyMsg(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={handleSendNotify} disabled={!notifyMsg.trim() || notifySending} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl disabled:opacity-50">
                {notifySending ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'إرسال'}
              </button>
              <button onClick={() => setShowNotify(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Store, Activity, Package, CreditCard, Users, Eye, ShieldAlert, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import { Card, Badge, Button, Skeleton } from '../components/ui';
import { showToast } from '../components/ui/Toast';

export default function MerchantDetails() {
  const { id } = useParams();
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMerchant = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/super-admin/merchants/${id}`);
        setMerchant(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'فشل تحميل بيانات المتجر');
      } finally {
        setLoading(false);
      }
    };
    fetchMerchant();
  }, [id]);

  const handleImpersonate = async () => {
    try {
      const res = await api.post(`/super-admin/impersonate/${id}`);
      window.open(res.data.data.redirectUrl, '_blank');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'فشل الدخول', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'danger' | 'default'> = { active: 'success', suspended: 'danger', cancelled: 'default' };
    const labels: Record<string, string> = { active: 'نشط', suspended: 'موقوف', cancelled: 'ملغى' };
    return <Badge variant={variants[status] || 'default'} dot>{labels[status] || status}</Badge>;
  };

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, 'amber' | 'info' | 'default'> = { business: 'amber', professional: 'info', starter: 'info', free_trial: 'default' };
    const labels: Record<string, string> = { business: 'Business (الأعمال)', professional: 'Professional (الاحترافية)', starter: 'Starter (الأساسية)', free_trial: 'تجربة مجانية' };
    return <Badge variant={variants[plan] || 'default'}>{labels[plan] || plan}</Badge>;
  };

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-20 rounded-2xl" />
      <div className="grid grid-cols-3 gap-6"><Skeleton className="h-60 rounded-2xl" /><Skeleton className="h-60 rounded-2xl col-span-2" /></div>
    </div>
  );

  if (error || !merchant) return <Card className="p-6"><div className="flex items-center gap-2 text-red-600"><AlertCircle size={20}/> {error || 'المتجر غير موجود'}</div></Card>;

  const pricing: Record<string, number> = { free_trial: 0, starter: 250, professional: 450, business: 699 };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/merchants" className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors shadow-sm">
          <ArrowRight size={20} />
        </Link>
        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-slate-900">{merchant.storeName}</h1>
          <a href={`https://${merchant.subdomain}.matgarco.com`} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-indigo-600 transition-colors mt-1 font-mono text-sm" dir="ltr">
            {merchant.subdomain}.matgarco.com
          </a>
        </div>
      </div>

      <div className="flex gap-3">
        {getStatusBadge(merchant.subscriptionStatus)}
        {getPlanBadge(merchant.subscriptionPlan)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-6">
              <Store size={18} className="text-slate-400" />
              <h2 className="text-lg font-bold text-slate-900">بيانات المتجر الأساسية</h2>
            </div>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div><dt className="text-sm text-slate-500">اسم المالك</dt><dd className="font-bold text-slate-900 mt-1">{merchant.ownerId?.firstName} {merchant.ownerId?.lastName}</dd></div>
              <div><dt className="text-sm text-slate-500">البريد الإلكتروني</dt><dd className="font-bold text-slate-900 mt-1 font-mono text-sm" dir="ltr">{merchant.ownerId?.email}</dd></div>
              <div><dt className="text-sm text-slate-500">رقم الهاتف</dt><dd className="font-bold text-slate-900 mt-1 font-mono text-sm" dir="ltr">{merchant.phone || merchant.ownerId?.phone || 'غير متوفر'}</dd></div>
              <div><dt className="text-sm text-slate-500">تاريخ الانضمام</dt><dd className="font-bold text-slate-900 mt-1 font-mono text-sm">{new Date(merchant.createdAt).toLocaleDateString()}</dd></div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-6">
              <Activity size={18} className="text-slate-400" />
              <h2 className="text-lg font-bold text-slate-900">إحصائيات الاستخدام</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'منتج مفعل', value: merchant.stats?.totalProducts?.toLocaleString() || 0, icon: <Package size={16}/>, color: 'blue' },
                { label: 'طلب مكتمل', value: merchant.stats?.totalOrders?.toLocaleString() || 0, icon: <CreditCard size={16}/>, color: 'emerald' },
                { label: 'عميل مسجل', value: merchant.stats?.totalCustomers?.toLocaleString() || 0, icon: <Users size={16}/>, color: 'purple' },
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${stat.color === 'blue' ? 'bg-blue-100 text-blue-600' : stat.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600'}`}>{stat.icon}</div>
                  <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                  <div className="text-sm font-medium text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4">تفاصيل الاشتراك</h2>
            <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-50 border border-indigo-100 mb-4">
              <div>
                <div className="text-sm text-indigo-600 font-bold mb-1">الباقة الحالية</div>
                <div>{getPlanBadge(merchant.subscriptionPlan)}</div>
              </div>
              <div className="text-left font-mono text-sm text-indigo-700 font-bold bg-white px-3 py-1.5 rounded-lg border border-indigo-200">
                {pricing[merchant.subscriptionPlan] || 0} EGP / mo
              </div>
            </div>
            <div className="space-y-3 pb-4 border-b border-slate-100">
              <div className="flex justify-between text-sm"><span className="text-slate-500">الحالة</span><span>{getStatusBadge(merchant.subscriptionStatus)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">إجمالي المبيعات</span><span className="font-bold text-emerald-600 font-mono">{(merchant.stats?.totalRevenue || 0).toLocaleString()} ج.م</span></div>
            </div>
          </Card>

          <Card className="bg-red-50 border-red-100">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert size={18} className="text-red-700" />
              <h2 className="text-lg font-bold text-red-900">منطقة الخطر (God Mode)</h2>
            </div>
            <p className="text-red-700/80 text-sm mb-6 leading-relaxed">تحذير: الإجراءات هنا تؤثر مباشرة على المتجر.</p>
            <div className="space-y-3">
              <Button variant="secondary" icon={<Eye size={16} />} fullWidth onClick={handleImpersonate}>دخول كتاجر</Button>
              <Button variant="danger" icon={<ShieldAlert size={16} />} fullWidth>إيقاف المتجر</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { CreditCard, TrendingUp, DollarSign, Activity, BarChart3, Users, FileText, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../lib/api';
import clsx from 'clsx';
import { Card, StatCard, Badge, Tabs, SkeletonKpiCards, SkeletonChart, EmptyState } from '../components/ui';
import { PageHeader } from '../components/layout/PageHeader';

const PLAN_COLORS: Record<string, string> = {
  free_trial: '#94a3b8',
  starter: '#3b82f6',
  professional: '#8b5cf6',
  business: '#f59e0b'
};

const PLAN_NAMES: Record<string, string> = {
  free_trial: 'تجربة مجانية',
  starter: 'Starter',
  professional: 'Professional',
  business: 'Business'
};

const PLAN_LABELS: Record<string, string> = {
  free_trial: 'تجربة مجانية',
  starter: 'باقة Starter',
  professional: 'باقة Professional',
  business: 'باقة Business'
};

export default function Subscriptions() {
  const [data, setData] = useState<any>(null);
  const [financeData, setFinanceData] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [kpiRes, financeRes, chartRes, subsRes] = await Promise.all([
          api.get('/super-admin/kpis'),
          api.get('/super-admin/finance/advanced'),
          api.get('/super-admin/dashboard/charts'),
          api.get('/super-admin/subscriptions/all').catch(() => ({ data: { data: { invoices: [] } } })),
        ]);
        setData(kpiRes.data.data);
        setFinanceData(financeRes.data.data);
        setCharts(chartRes.data.data);
        setInvoices(subsRes.data.data?.invoices || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load finances');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const planStats = ['business', 'professional', 'starter', 'free_trial'].map(planId => {
    const count = data?.merchantsDistribution?.find((d: any) => d._id === planId)?.count || 0;
    const pricing: Record<string, number> = { free_trial: 0, starter: 250, professional: 450, business: 699 };
    const revenue = count * (pricing[planId] || 0);
    return { id: planId, title: PLAN_LABELS[planId], count, revenue };
  });

  const pieData = (charts?.planDistribution || []).map((d: any) => ({ name: PLAN_NAMES[d.plan] || d.plan, value: d.count }));

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader icon={<CreditCard size={24} />} title="الماليات والاشتراكات" iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <SkeletonKpiCards count={6} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonChart className="lg:col-span-2" />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  if (error) return <Card className="p-6"><div className="flex items-center gap-2 text-red-600"><AlertCircle size={20}/> {error}</div></Card>;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<CreditCard size={24} />}
        title="الماليات والاشتراكات"
        description="متابعة إيرادات المنصة، توزيع الباقات، والعمولات المحصلة."
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
      />

      <Tabs
        tabs={[
          { id: 'overview', label: 'نظرة عامة' },
          { id: 'invoices', label: 'الفواتير', count: invoices.length },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="MRR" value={`${(data?.mrr || 0).toLocaleString()} ج.م`} sub="إيرادات شهرية" icon={<DollarSign size={20} />} iconColor="emerald" />
            <StatCard label="GMV" value={`${(data?.totalGMV || 0).toLocaleString()} ج.م`} sub="مبيعات المتاجر" icon={<TrendingUp size={20} />} iconColor="blue" />
            <StatCard label="متاجر نشطة" value={data?.activeMerchants || 0} sub="متاجر تعمل الآن" icon={<Activity size={20} />} iconColor="purple" />
            <StatCard label="Churn Rate" value={`${financeData?.churnRate || 0}%`} sub="معدل التسرب" icon={<BarChart3 size={20} />} iconColor="amber" />
            <StatCard label="LTV" value={`${(financeData?.avgLTV || 0).toLocaleString()} ج.م`} sub="القيمة الدائمة" icon={<Users size={20} />} iconColor="indigo" />
            <StatCard label="عمولات" value={`${(financeData?.commissionRevenue || 0).toLocaleString()} ج.م`} sub="إيرادات العمولات" icon={<CreditCard size={20} />} iconColor="teal" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card padding="none">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900">نمو الإيرادات (آخر 12 شهر)</h3>
                </div>
                <div className="p-6">
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={charts?.revenueTrend || []}>
                      <defs>
                        <linearGradient id="colorRevFin" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} interval={0} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip formatter={(value) => `${Number(value ?? 0).toLocaleString()} ج.م`} />
                      <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5} fill="url(#colorRevFin)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
            <Card padding="none">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">توزيع الباقات</h3>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" nameKey="name" paddingAngle={4}>
                      {pieData.map((_: any, i: number) => <Cell key={i} fill={Object.values(PLAN_COLORS)[i % 4]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">توزيع الباقات والإيرادات</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {planStats.map(stat => (
                <Card key={stat.id} className={clsx(
                  stat.id === 'business' ? 'border-indigo-200 bg-indigo-50' :
                  stat.id === 'professional' ? 'border-purple-200 bg-purple-50' :
                  stat.id === 'starter' ? 'border-blue-200 bg-blue-50' : ''
                )}>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm font-bold text-slate-600 mb-2">{stat.title}</p>
                      <div className="text-3xl font-black text-slate-900">{stat.count}</div>
                      <div className="text-xs text-slate-500 mt-1">متاجر</div>
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-slate-500 font-bold">الإيراد الشهري</div>
                      <div className="text-lg font-bold text-slate-700 font-mono">{stat.revenue.toLocaleString()} ج.م</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'invoices' && (
        <Card padding="none">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <FileText size={18} className="text-slate-400" />
            <h2 className="text-lg font-bold text-slate-900">سجل مدفوعات الاشتراكات</h2>
            {invoices.length > 0 && (
              <Badge variant="default" size="sm">{invoices.length}</Badge>
            )}
          </div>
          {invoices.length === 0 ? (
            <EmptyState
              icon={<FileText size={32} />}
              title="لا توجد فواتير بعد"
              description="ستظهر هنا فور اشتراك أول تاجر"
            />
          ) : (
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-500">رقم الفاتورة</th>
                  <th className="px-6 py-4 font-bold text-slate-500">المتجر</th>
                  <th className="px-6 py-4 font-bold text-slate-500">الباقة</th>
                  <th className="px-6 py-4 font-bold text-slate-500">المبلغ</th>
                  <th className="px-6 py-4 font-bold text-slate-500">الحالة</th>
                  <th className="px-6 py-4 font-bold text-slate-500">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv: any) => (
                  <tr key={inv._id || inv.invoiceNumber} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{inv.merchantName || '—'}</div>
                      <div className="text-xs text-slate-400">{inv.merchantEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={
                        inv.plan === 'business' ? 'amber' :
                        inv.plan === 'professional' ? 'purple' :
                        inv.plan === 'starter' ? 'info' : 'default'
                      }>
                        {PLAN_NAMES[inv.plan] || inv.plan}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 font-mono">{(inv.amount || 0).toLocaleString()} ج.م</td>
                    <td className="px-6 py-4">
                      <Badge variant={
                        inv.status === 'paid' ? 'success' :
                        inv.status === 'failed' ? 'danger' :
                        inv.status === 'refunded' ? 'default' : 'warning'
                      }>
                        {inv.status === 'paid' ? 'مدفوعة' : inv.status === 'failed' ? 'فشل' : inv.status === 'refunded' ? 'مسترجعة' : 'معلقة'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs font-mono">{new Date(inv.createdAt).toLocaleDateString('ar')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  );
}

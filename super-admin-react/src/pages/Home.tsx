import { useEffect, useState } from 'react';
import { TrendingUp, Users, Store, DollarSign, AlertCircle, ShoppingCart, Zap, Clock } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../lib/api';
import { Card, StatCard, SkeletonKpiCards, SkeletonChart } from '../components/ui';
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

export default function Home() {
  const [kpis, setKpis] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [kpiRes, chartRes] = await Promise.all([
          api.get('/super-admin/kpis'),
          api.get('/super-admin/dashboard/charts')
        ]);
        setKpis(kpiRes.data.data);
        setCharts(chartRes.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader icon={<TrendingUp size={24} />} title="لوحة التحكم السريعة" iconBg="bg-indigo-50" iconColor="text-indigo-600" />
        <SkeletonKpiCards count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonChart className="lg:col-span-2" />
          <SkeletonChart />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonChart className="lg:col-span-2" />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  if (error) return <Card className="p-6"><div className="flex items-center gap-2 text-red-600"><AlertCircle size={20}/> {error}</div></Card>;

  const kpiCards = [
    { title: 'إجمالي المتاجر', value: kpis?.totalMerchants || 0, sub: 'العدد الكلي', icon: Store, iconColor: 'blue' as const, trend: kpis?.merchantGrowth },
    { title: 'الإيرادات الشهرية (MRR)', value: `${(kpis?.mrr || 0).toLocaleString()} ج.م`, sub: 'إيرادات الاشتراكات', icon: DollarSign, iconColor: 'emerald' as const },
    { title: 'المتاجر النشطة', value: kpis?.activeMerchants || 0, sub: 'متاجر مفعلة', icon: Users, iconColor: 'purple' as const },
    { title: 'مبيعات المنصة (GMV)', value: `${(kpis?.totalGMV || 0).toLocaleString()} ج.م`, sub: 'عبر بوابة الدفع', icon: TrendingUp, iconColor: 'amber' as const },
  ];

  const pulse = charts?.dailyPulse || {};

  return (
    <div className="space-y-8">
      <PageHeader
        icon={<TrendingUp size={24} />}
        title="لوحة التحكم السريعة"
        description="نظرة عامة على أداء منصة Matgarco اليوم."
        iconBg="bg-indigo-50"
        iconColor="text-indigo-600"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, idx) => (
          <StatCard
            key={idx}
            label={kpi.title}
            value={kpi.value}
            sub={kpi.sub}
            icon={<kpi.icon size={24} />}
            iconColor={kpi.iconColor}
            trend={kpi.trend}
            trendLabel="vs الشهر الماضي"
          />
        ))}
      </div>

      <div className="bg-gradient-to-l from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-lg shadow-indigo-600/20">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Zap size={20} /> النبض اليومي (Daily Pulse)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="text-white/70 text-sm font-medium">متاجر جديدة اليوم</div>
            <div className="text-3xl font-black mt-1">{pulse.newMerchants || 0}</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="text-white/70 text-sm font-medium">طلبات اليوم</div>
            <div className="text-3xl font-black mt-1">{pulse.todayOrders || 0}</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="text-white/70 text-sm font-medium">مبيعات اليوم</div>
            <div className="text-3xl font-black mt-1">{(pulse.todayRevenue || 0).toLocaleString()} ج.م</div>
          </div>
        </div>
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
                    <linearGradient id="colorRevenueHome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} interval={0} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip formatter={(value) => `${Number(value ?? 0).toLocaleString()} ج.م`} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorRevenueHome)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div>
          <Card padding="none">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">توزيع الباقات</h3>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={(charts?.planDistribution || []).map((d: any) => ({ ...d, name: PLAN_NAMES[d.plan] || d.plan }))}
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={75}
                    dataKey="count" nameKey="name"
                    paddingAngle={4}
                  >
                    {(charts?.planDistribution || []).map((d: any, i: number) => (
                      <Cell key={i} fill={PLAN_COLORS[d.plan] || '#cbd5e1'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card padding="none">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">تسجيلات المتاجر (آخر 30 يوم)</h3>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={charts?.registrations || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-45} textAnchor="end" height={55} interval={0} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card padding="none">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Clock size={18} className="text-slate-400"/> آخر النشاطات</h3>
          </div>
          <div className="space-y-2 max-h-[280px] overflow-y-auto p-4">
            {(charts?.recentActivity || []).length === 0 ? (
              <div className="text-sm text-slate-400 text-center py-8">لا توجد نشاطات حتى الآن</div>
            ) : (charts?.recentActivity || []).map((act: any, i: number) => (
              <div key={i} className="flex gap-3 items-start p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${act.type === 'new_merchant' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {act.type === 'new_merchant' ? <Store size={14} /> : <ShoppingCart size={14} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900 truncate">{act.message}</div>
                  <div className="text-xs text-slate-500 truncate">{act.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, Users, Store, DollarSign, Loader2, AlertCircle, ShoppingCart, Zap, Clock, Trophy, TrendingDown, Download, RefreshCw, Calendar } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../lib/api';

const PLAN_COLORS: Record<string, string> = {
  free_trial: '#94a3b8',
  starter: '#3b82f6',
  professional: '#8b5cf6',
  business: '#f59e0b',
};
const PLAN_NAMES: Record<string, string> = {
  free_trial: 'تجربة مجانية',
  starter: 'Starter',
  professional: 'Professional',
  business: 'Business',
};

type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export default function Home() {
  const [kpis, setKpis] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('monthly');
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [kpiRes, chartRes] = await Promise.all([
          api.get('/super-admin/kpis'),
          api.get('/super-admin/dashboard/charts'),
        ]);
        setKpis(kpiRes.data.data);
        setCharts(chartRes.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'فشل تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const fetchReport = useCallback(async (period: ReportPeriod) => {
    setReportLoading(true);
    try {
      const res = await api.get(`/super-admin/finance/report?period=${period}`);
      setReport(res.data.data);
    } catch { /* ignore */ }
    finally { setReportLoading(false); }
  }, []);

  useEffect(() => { fetchReport(reportPeriod); }, [reportPeriod, fetchReport]);

  const exportCSV = () => {
    if (!report?.report?.length) return;
    const headers = ['الفترة', 'الإيرادات', 'الطلبات', 'العمولة'];
    const rows = report.report.map((r: any) => [r.period, r.revenue, r.orders, r.commission]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matgarco-report-${reportPeriod}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-matgarco-500" size={40} /></div>;
  if (error) return <div className="flex justify-center items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl"><AlertCircle /> {error}</div>;

  const kpiCards = [
    { title: 'إجمالي المتاجر', value: kpis?.totalMerchants || 0, sub: `+${kpis?.newMerchantsThisMonth || 0} هذا الشهر`, icon: Store, color: 'text-blue-600', bg: 'bg-blue-100', trend: 'up' },
    { title: 'الإيرادات الشهرية (MRR)', value: `${(kpis?.mrr || 0).toLocaleString()} ج.م`, sub: 'إيرادات الاشتراكات', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100', trend: 'up' },
    { title: 'المتاجر النشطة', value: kpis?.activeMerchants || 0, sub: 'متاجر مفعلة', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100', trend: 'neutral' },
    { title: 'مبيعات المنصة (GMV)', value: `${(kpis?.totalGMV || 0).toLocaleString()} ج.م`, sub: 'عبر الطلبات المدفوعة', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-100', trend: 'up' },
  ];

  const pulse = charts?.dailyPulse || {};
  const topMerchants: any[] = charts?.topMerchants || [];

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">لوحة التحكم</h1>
          <p className="text-slate-500">نظرة عامة على أداء منصة Matgarco.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{kpi.title}</p>
              <h3 className="text-2xl font-black text-slate-900">{kpi.value}</h3>
              <div className="mt-2 text-xs font-bold text-emerald-600">{kpi.sub}</div>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.bg} ${kpi.color}`}>
              <kpi.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Churn Rate Card + Daily Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Churn Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-600">معدل الإلغاء (Churn)</h3>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <TrendingDown size={16} />
            </div>
          </div>
          <div>
            <div className="text-4xl font-black text-rose-600">{kpis?.churnRate ?? 0}%</div>
            <p className="text-xs text-slate-500 mt-2">إلغاءات هذا الشهر: <span className="font-bold text-slate-700">{kpis?.cancelledThisMonth || 0}</span></p>
            <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-rose-400 rounded-full transition-all" style={{ width: `${Math.min(kpis?.churnRate || 0, 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Daily Pulse */}
        <div className="lg:col-span-3 bg-gradient-to-l from-matgarco-600 to-matgarco-800 rounded-2xl p-6 text-white shadow-lg shadow-matgarco-600/20">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Zap size={20} /> النبض اليومي</h3>
          <div className="grid grid-cols-3 gap-4">
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
      </div>

      {/* Revenue Chart + Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">نمو الإيرادات (آخر 12 شهر)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={charts?.revenueTrend || []}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip formatter={(v) => `${Number(v ?? 0).toLocaleString()} ج.م`} />
              <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">توزيع الباقات</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={(charts?.planDistribution || []).map((d: any) => ({ ...d, name: PLAN_NAMES[d.plan] || d.plan }))}
                cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                dataKey="count" nameKey="name" paddingAngle={4}
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
      </div>

      {/* Finance Report with Period Selector + Export */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar size={20} className="text-slate-400" /> تقرير الإيرادات التفصيلي
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              {(['daily', 'weekly', 'monthly'] as ReportPeriod[]).map(p => (
                <button
                  key={p}
                  onClick={() => setReportPeriod(p)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${reportPeriod === p ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {p === 'daily' ? 'يومي' : p === 'weekly' ? 'أسبوعي' : 'شهري'}
                </button>
              ))}
            </div>
            <button
              onClick={exportCSV}
              disabled={!report?.report?.length}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} /> تصدير CSV
            </button>
          </div>
        </div>

        {reportLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-matgarco-500" size={30} /></div>
        ) : report ? (
          <>
            {/* Totals */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'إجمالي الإيرادات', value: `${(report.totals?.revenue || 0).toLocaleString()} ج.م`, color: 'text-emerald-600' },
                { label: 'إجمالي الطلبات', value: (report.totals?.orders || 0).toLocaleString(), color: 'text-blue-600' },
                { label: 'إجمالي العمولات', value: `${(report.totals?.commission || 0).toLocaleString()} ج.م`, color: 'text-purple-600' },
              ].map((t, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="text-sm text-slate-500 mb-1">{t.label}</div>
                  <div className={`text-xl font-black ${t.color}`}>{t.value}</div>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={report.report || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip formatter={(v) => `${Number(v ?? 0).toLocaleString()} ج.م`} />
                <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} name="الإيرادات" />
                <Bar dataKey="commission" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="العمولات" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </>
        ) : null}
      </div>

      {/* Top Merchants + Registrations + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Merchants Leaderboard */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" /> أفضل المتاجر
          </h3>
          <div className="space-y-3">
            {topMerchants.length === 0 ? (
              <div className="text-sm text-slate-400 text-center py-8">لا توجد بيانات</div>
            ) : topMerchants.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                  i === 0 ? 'bg-amber-400 text-amber-900' : i === 1 ? 'bg-slate-200 text-slate-700' : i === 2 ? 'bg-orange-300 text-orange-900' : 'bg-slate-100 text-slate-600'
                }`}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-slate-900 truncate">{m.storeName}</div>
                  <div className="text-xs text-slate-400 font-mono">{m.orderCount} طلب</div>
                </div>
                <div className="text-sm font-black text-emerald-600 shrink-0">{m.totalRevenue.toLocaleString()} ج.م</div>
              </div>
            ))}
          </div>
        </div>

        {/* Registrations Bar */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">تسجيلات المتاجر (آخر 30 يوم)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={charts?.registrations || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Clock size={18} className="text-slate-400" /> آخر النشاطات</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
          {(charts?.recentActivity || []).map((act: any, i: number) => (
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
          {(!charts?.recentActivity || charts.recentActivity.length === 0) && (
            <div className="col-span-2 text-sm text-slate-400 text-center py-8">لا توجد نشاطات حتى الآن</div>
          )}
        </div>
      </div>
    </div>
  );
}

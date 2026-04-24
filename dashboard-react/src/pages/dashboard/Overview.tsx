import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { merchantAPI, orderAPI, productAPI, aiAPI } from '../../lib/api';
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  ArrowLeft,
  Plus,
  Sparkles,
  Zap,
  BarChart3,
  Palette,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Store,
  ExternalLink,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const ORDER_STATUS_AR: Record<string, string> = {
  pending: 'معلق',
  confirmed: 'مؤكد',
  processing: 'جاري التجهيز',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
  refunded: 'مُسترد',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
};

const fmt = (n: number) => n.toLocaleString('ar-EG');

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-xl" />
      <div className="w-16 h-6 bg-gray-200 rounded-full" />
    </div>
    <div className="w-24 h-8 bg-gray-200 rounded mb-2" />
    <div className="w-20 h-4 bg-gray-200 rounded" />
  </div>
);

const SkeletonChart = () => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
    <div className="w-40 h-6 bg-gray-200 rounded mb-6" />
    <div className="w-full h-56 bg-gray-100 rounded-xl" />
  </div>
);

export default function Overview() {
  const user = useAuthStore((state) => state.user);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const { data: merchantData, isLoading: merchantLoading } = useQuery({
    queryKey: ['merchant', user?.merchantId],
    queryFn: () => merchantAPI.getById(user!.merchantId!),
    enabled: !!user?.merchantId,
  });
  const merchant = merchantData?.data?.data?.merchant;

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders-dashboard', { limit: 50 }],
    queryFn: () => orderAPI.getAll({ limit: 50 }),
  });
  const orders: any[] = ordersData?.data?.data?.orders || [];

  const { data: productsData } = useQuery({
    queryKey: ['products-dashboard', { limit: 5 }],
    queryFn: () => productAPI.getAll({ limit: 5, status: 'active' }),
  });
  const activeProducts: any[] = productsData?.data?.data?.products || [];

  const revenueChartData = useMemo(() => {
    const days: Record<string, { day: string; إيراد: number; طلبات: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('ar-EG', { weekday: 'short' });
      days[key] = { day: label, إيراد: 0, طلبات: 0 };
    }
    orders.forEach((o) => {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      if (days[key] && o.orderStatus !== 'cancelled' && o.orderStatus !== 'refunded') {
        days[key].إيراد += o.total || 0;
        days[key].طلبات += 1;
      }
    });
    return Object.values(days);
  }, [orders]);

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayRevenue = revenueChartData.find((d) => d.day === new Date().toLocaleDateString('ar-EG', { weekday: 'short' }))?.إيراد || 0;
  const todayOrders = orders.filter((o) => new Date(o.createdAt).toISOString().slice(0, 10) === todayKey).length;
  const pendingOrders = orders.filter((o) => o.orderStatus === 'pending').length;

  const totalRevenue = merchant?.stats?.totalRevenue || 0;
  const totalOrders = merchant?.stats?.totalOrders || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const storeHealth = useMemo(() => {
    let score = 0;
    let issues: string[] = [];
    if (merchant?.stats?.totalProducts === 0) issues.push('لا توجد منتجات');
    else score += 25;
    if (pendingOrders > 0) issues.push(`${pendingOrders} طلبات معلقة`);
    else score += 25;
    if (merchant?.subscriptionStatus === 'active') score += 25;
    if (merchant?.storeName) score += 25;
    return { score, issues, label: score >= 75 ? 'ممتاز' : score >= 50 ? 'جيد' : score >= 25 ? 'يحتاج تحسين' : 'حرج' };
  }, [merchant, pendingOrders]);

  const fetchAIInsights = async () => {
    setShowAIInsights(true);
    setAiLoading(true);
    try {
      const response = await aiAPI.getAnalyticsInsights({});
      setAiInsights(response.data?.data?.insights || '');
    } catch {
      setAiInsights('حدث خطأ أثناء تحليل البيانات.');
    } finally {
      setAiLoading(false);
    }
  };

  const isLoading = merchantLoading || ordersLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-8 animate-pulse">
          <div className="w-48 h-8 bg-white/20 rounded mb-3" />
          <div className="w-64 h-5 bg-white/10 rounded" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-8 text-white overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">مرحباً، {user?.firstName} 👋</h1>
              <p className="text-blue-100">
                متجرك{' '}
                <span className="font-semibold text-white">{merchant?.storeName}</span>
                {' · '}
                <span className="opacity-80">{merchant?.subdomain}.matgarco.com</span>
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
              <div className={`w-2.5 h-2.5 rounded-full ${storeHealth.score >= 75 ? 'bg-green-400' : storeHealth.score >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`} />
              <span className="text-sm font-medium">صحة المتجر: {storeHealth.label}</span>
            </div>
          </div>
          {storeHealth.issues.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {storeHealth.issues.map((issue, i) => (
                <span key={i} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm">
                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-300" />
                  {issue}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Today Snapshot */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-emerald-50 p-2.5 rounded-xl">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" /> اليوم
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmt(Math.round(todayRevenue))} ج</p>
          <p className="text-sm text-gray-500 mt-0.5">إيرادات اليوم</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-blue-50 p-2.5 rounded-xl">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
            {pendingOrders > 0 ? (
              <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                <Clock className="w-3 h-3" /> {pendingOrders} معلق
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> لا معلق
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">{todayOrders}</p>
          <p className="text-sm text-gray-500 mt-0.5">طلبات اليوم</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-purple-50 p-2.5 rounded-xl">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmt(Math.round(avgOrderValue))} ج</p>
          <p className="text-sm text-gray-500 mt-0.5">متوسط قيمة الطلب</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-orange-50 p-2.5 rounded-xl">
              <Package className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{merchant?.stats?.totalProducts || 0}</p>
          <p className="text-sm text-gray-500 mt-0.5">إجمالي المنتجات</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">الإيرادات</h2>
              <p className="text-sm text-gray-500">آخر 7 أيام</p>
            </div>
            <div className="text-left">
              <p className="text-lg font-bold text-gray-900">{fmt(Math.round(revenueChartData.reduce((s, d) => s + d.إيراد, 0)))} ج</p>
              <p className="text-xs text-gray-500">إجمالي الأسبوع</p>
            </div>
          </div>
          {revenueChartData.some((d) => d.إيراد > 0) ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(v: any) => [`${fmt(v)} ج`, 'إيراد']}
                />
                <Area type="monotone" dataKey="إيراد" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorRevenue)" dot={false} activeDot={{ r: 5, fill: '#6366f1' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[240px] text-gray-400">
              <BarChart3 className="w-12 h-12 mb-3 text-gray-200" />
              <p className="text-sm">لا توجد بيانات إيرادات بعد</p>
            </div>
          )}
        </div>

        {/* AI Insights Widget */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-100 p-2.5 rounded-xl">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">تحليل ذكي</h2>
              <p className="text-xs text-gray-500">رؤى AI لمتجرك</p>
            </div>
          </div>

          {!showAIInsights ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-indigo-500" />
              </div>
              <p className="text-sm text-gray-600 mb-4">احصل على تحليل ذكي لأداء متجرك مع توصيات عملية</p>
              <button
                onClick={fetchAIInsights}
                disabled={aiLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {aiLoading ? 'جاري التحليل...' : 'حلل بياناتي'}
              </button>
            </div>
          ) : aiLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-indigo-200 rounded w-3/4" />
              <div className="h-4 bg-indigo-200 rounded w-full" />
              <div className="h-4 bg-indigo-200 rounded w-5/6" />
              <div className="h-4 bg-indigo-200 rounded w-2/3" />
            </div>
          ) : (
            <div className="bg-white rounded-xl p-4 max-h-72 overflow-y-auto">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap" dir="rtl">{aiInsights}</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-bold text-gray-900 text-lg mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { to: '/dashboard/products/new', icon: Plus, label: 'إضافة منتج', desc: 'منتج جديد', color: 'blue' },
            { to: '/dashboard/orders', icon: ShoppingCart, label: 'الطلبات', desc: pendingOrders > 0 ? `${pendingOrders} معلق` : 'عرض الكل', color: 'green' },
            { to: '/dashboard/customers', icon: Users, label: 'العملاء', desc: 'قاعدة العملاء', color: 'purple' },
            { to: '/dashboard/store-design', icon: Palette, label: 'تصميم المتجر', desc: 'تخصيص المظهر', color: 'pink' },
            { to: '/dashboard/reports', icon: BarChart3, label: 'التقارير', desc: 'تحليل الأداء', color: 'orange' },
            { to: '/dashboard/settings', icon: Store, label: 'الإعدادات', desc: 'إعدادات المتجر', color: 'gray' },
          ].map((action) => {
            const colorMap: Record<string, string> = {
              blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100',
              green: 'bg-green-50 text-green-600 hover:bg-green-100 border-green-100',
              purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-100',
              pink: 'bg-pink-50 text-pink-600 hover:bg-pink-100 border-pink-100',
              orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-100',
              gray: 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-100',
            };
            const Icon = action.icon;
            return (
              <Link
                key={action.to}
                to={action.to}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all hover:shadow-md ${colorMap[action.color]}`}
              >
                <Icon className="w-6 h-6" />
                <div className="text-center">
                  <p className="font-medium text-sm">{action.label}</p>
                  <p className="text-xs opacity-70 mt-0.5">{action.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Orders + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">أحدث الطلبات</h2>
              <p className="text-sm text-gray-500">{orders.length > 0 ? `آخر ${Math.min(orders.length, 6)} طلبات` : 'لا توجد طلبات'}</p>
            </div>
            <Link to="/dashboard/orders" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              عرض الكل
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {orders.length > 0 ? (
              orders.slice(0, 6).map((order: any) => (
                <Link
                  key={order._id}
                  to={`/dashboard/orders/${order._id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">
                        {order.customerInfo?.firstName} {order.customerInfo?.lastName}
                        {' · '}
                        {new Date(order.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">{fmt(Math.round(order.total || 0))} ج</p>
                    <span className={`inline-block px-2.5 py-0.5 text-xs rounded-full font-medium ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                      {ORDER_STATUS_AR[order.orderStatus] || order.orderStatus}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">لا توجد طلبات بعد</p>
                <p className="text-gray-400 text-sm mt-1">ستظهر الطلبات هنا بمجرد بدئها</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">المنتجات النشطة</h2>
              <p className="text-sm text-gray-500">{activeProducts.length} منتج</p>
            </div>
            <Link to="/dashboard/products" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              عرض الكل
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {activeProducts.length > 0 ? (
              activeProducts.slice(0, 5).map((product: any) => (
                <Link
                  key={product._id}
                  to={`/dashboard/products/${product._id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition"
                >
                  {product.images?.[0]?.url ? (
                    <img src={product.images[0].url} alt={product.name} className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Package className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      {fmt(product.price || 0)} ج
                      {' · '}
                      مخزون: {product.quantity || product.stock || 0}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-300" />
                </Link>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">لا توجد منتجات</p>
                <Link
                  to="/dashboard/products/new"
                  className="inline-flex items-center gap-1.5 mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  أضف أول منتج
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

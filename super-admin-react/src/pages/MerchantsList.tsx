import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Store, Eye, MoreVertical, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import { Button, Badge, Input, Card, EmptyState, Pagination, SkeletonTable } from '../components/ui';
import { PageHeader } from '../components/layout/PageHeader';

interface Merchant {
  _id: string;
  storeName: string;
  subdomain: string;
  ownerId: { firstName: string; lastName: string; email: string };
  subscriptionPlan: 'free_trial' | 'starter' | 'professional' | 'business';
  subscriptionStatus: 'active' | 'suspended' | 'cancelled';
  stats: { totalRevenue: number };
  createdAt: string;
}

const PLAN_LABELS: Record<string, string> = {
  free_trial: 'تجربة مجانية',
  starter: 'Starter',
  professional: 'Professional',
  business: 'Business',
};

const STATUS_LABELS: Record<string, { label: string; variant: 'success' | 'danger' | 'default' }> = {
  active: { label: 'نشط', variant: 'success' },
  suspended: { label: 'موقوف', variant: 'danger' },
  cancelled: { label: 'ملغى', variant: 'default' },
};

export default function MerchantsList() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeMerchants, setActiveMerchants] = useState(0);

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        setLoading(true);
        const res = await api.get('/super-admin/merchants', {
          params: { page, limit: pageSize }
        });
        const data = res.data.data || [];
        setMerchants(data);
        setTotal(res.data.total || data.length);
        setTotalRevenue(res.data.stats?.totalRevenue || 0);
        setActiveMerchants(res.data.stats?.activeCount || 0);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch merchants');
      } finally {
        setLoading(false);
      }
    };
    fetchMerchants();
  }, [page, pageSize]);

  const filteredMerchants = merchants.filter((m) => {
    const matchesSearch =
      m.storeName.includes(searchTerm) ||
      m.subdomain.includes(searchTerm) ||
      `${m.ownerId?.firstName} ${m.ownerId?.lastName}`.includes(searchTerm);
    const matchesPlan = filterPlan === 'all' || m.subscriptionPlan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  if (loading) return <SkeletonTable rows={8} cols={6} />;
  if (error) return <Card className="p-6"><div className="flex items-center gap-2 text-red-600"><AlertCircle size={20}/> {error}</div></Card>;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Store size={24} />}
        title="التجار والمتاجر"
        description="أدر كافة المتاجر، راقب حالة الاشتراك، وتحكم في الصلاحيات المركزية."
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
        actions={
          <Button size="sm">+ إضافة متجر</Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="md">
          <p className="text-sm font-medium text-slate-500 mb-1">إجمالي المتاجر</p>
          <p className="text-2xl font-black text-slate-900">{total}</p>
        </Card>
        <Card padding="md">
          <p className="text-sm font-medium text-slate-500 mb-1">متاجر نشطة</p>
          <p className="text-2xl font-black text-emerald-600">{activeMerchants}</p>
        </Card>
        <Card padding="md">
          <p className="text-sm font-medium text-slate-500 mb-1">إجمالي المبيعات</p>
          <p className="text-2xl font-black text-slate-900 font-mono">{totalRevenue.toLocaleString()} ج.م</p>
        </Card>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="ابحث برابط المتجر، المالك..."
              leftIcon={<Search size={16} />}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-indigo-500"
              value={filterPlan}
              onChange={(e) => { setFilterPlan(e.target.value); setPage(1); }}
            >
              <option value="all">كل الباقات</option>
              <option value="free_trial">التجربة المجانية</option>
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="business">Business</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredMerchants.length === 0 ? (
            <EmptyState
              icon={<Store size={32} />}
              title="لا يوجد متاجر مطابقة للبحث"
              description="جرب تعديل عوامل البحث أو أضف متجر جديد."
              action={{ label: '+ إضافة متجر', onClick: () => {} }}
            />
          ) : (
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-500">المتجر / المالك</th>
                  <th className="px-6 py-4 font-bold text-slate-500">الرابط</th>
                  <th className="px-6 py-4 font-bold text-slate-500">الباقة</th>
                  <th className="px-6 py-4 font-bold text-slate-500">الحالة</th>
                  <th className="px-6 py-4 font-bold text-slate-500">إجمالي المبيعات</th>
                  <th className="px-6 py-4 font-bold text-slate-500">تاريخ الانضمام</th>
                  <th className="px-6 py-4 font-bold text-slate-500 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMerchants.map((merchant) => (
                  <tr key={merchant._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{merchant.storeName}</div>
                      <div className="text-slate-500 text-xs mt-1">
                        {merchant.ownerId?.firstName} {merchant.ownerId?.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600 bg-slate-50/30">
                      <a href={`https://${merchant.subdomain}.matgarco.com`} target="_blank" rel="noreferrer" className="hover:text-indigo-600 hover:underline">
                        {merchant.subdomain}.matgarco.com
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={
                        merchant.subscriptionPlan === 'business' ? 'amber' :
                        merchant.subscriptionPlan === 'professional' ? 'purple' :
                        merchant.subscriptionPlan === 'starter' ? 'info' : 'default'
                      }>
                        {PLAN_LABELS[merchant.subscriptionPlan]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={STATUS_LABELS[merchant.subscriptionStatus]?.variant} dot>
                        {STATUS_LABELS[merchant.subscriptionStatus]?.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700 font-mono">
                      {merchant.stats?.totalRevenue?.toLocaleString() || 0} ج.م
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                      {new Date(merchant.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/merchants/${merchant._id}`}
                          className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye size={16} />
                        </Link>
                        <button className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          showPageSize
        />
      </Card>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Wallet, CheckCircle, Building2, ChevronRight } from 'lucide-react';
import api from '../lib/api';
import { Button, Card, Badge, Modal, StatCard, Skeleton, EmptyState, SegmentedControl } from '../components/ui';
import { PageHeader } from '../components/layout/PageHeader';
import { showToast } from '../components/ui/Toast';

interface PendingMerchant {
  merchantId: string;
  storeName: string;
  subdomain: string;
  email: string;
  subscriptionPlan: string;
  bankInfo?: { bankName: string; accountNumber: string; accountName: string; iban: string };
  ordersCount: number;
  grossAmount: number;
  paymobFees: number;
  matgarcoCommission: number;
  netAmount: number;
  oldestOrder: string;
  orderIds: string[];
}

interface Payout {
  _id: string;
  merchantId: { storeName: string; email: string };
  periodFrom: string;
  periodTo: string;
  ordersCount: number;
  grossAmount: number;
  paymobFees: number;
  matgarcoCommission: number;
  netAmount: number;
  status: string;
  paidAt?: string;
  transferReference?: string;
  createdAt: string;
}

export default function Payouts() {
  const [tab, setTab] = useState<'pending' | 'history'>('pending');
  const [pending, setPending] = useState<PendingMerchant[]>([]);
  const [history, setHistory] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [modal, setModal] = useState<PendingMerchant | null>(null);
  const [transferRef, setTransferRef] = useState('');
  const [notes, setNotes] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pendingRes, historyRes] = await Promise.all([
        api.get('/payouts/pending'),
        api.get('/payouts/history'),
      ]);
      setPending(pendingRes.data.data || []);
      setHistory(historyRes.data.data || []);
    } catch {
      showToast('فشل تحميل البيانات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleProcess = async () => {
    if (!modal) return;
    setProcessing(modal.merchantId);
    try {
      await api.post('/payouts/process', { merchantId: modal.merchantId, transferReference: transferRef, notes });
      showToast(`تم تسجيل تسوية ${modal.storeName} بنجاح`);
      setModal(null);
      setTransferRef('');
      setNotes('');
      fetchData();
    } catch {
      showToast('فشل العملية', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const totalPending = pending.reduce((s, m) => s + m.netAmount, 0);
  const totalCommission = pending.reduce((s, m) => s + m.matgarcoCommission, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader icon={<Wallet size={24} />} title="إدارة التسويات" iconBg="bg-blue-50" iconColor="text-blue-600" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Wallet size={24} />}
        title="إدارة التسويات الأسبوعية"
        description="مراجعة أرصدة التجار وتحويل مستحقاتهم"
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="إجمالي المعلق للتجار" value={`${totalPending.toLocaleString()} ج.م`} sub="أرصدة معلقة" icon={<Wallet size={20} />} iconColor="blue" />
        <StatCard label="عمولات Matgarco" value={`${totalCommission.toLocaleString()} ج.م`} sub="عمولات محصلة" icon={<CheckCircle size={20} />} iconColor="emerald" />
        <StatCard label="تجار بأرصدة معلقة" value={pending.length} sub="بحاجة لتسوية" icon={<Building2 size={20} />} iconColor="indigo" />
      </div>

      <Card padding="none">
        <div className="px-6 py-4 border-b border-slate-100">
          <SegmentedControl
            options={[
              { id: 'pending', label: `أرصدة معلقة (${pending.length})` },
              { id: 'history', label: 'سجل التسويات' },
            ]}
            value={tab}
            onChange={(id) => setTab(id as 'pending' | 'history')}
          />
        </div>

        {tab === 'pending' ? (
          pending.length === 0 ? (
            <EmptyState icon={<Wallet size={32} />} title="لا توجد أرصدة معلقة" description="جميع التجار تم تسويتهم." />
          ) : (
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-500">التاجر</th>
                  <th className="px-6 py-4 font-bold text-slate-500">الباقة</th>
                  <th className="px-6 py-4 font-bold text-slate-500">الطلبات</th>
                  <th className="px-6 py-4 font-bold text-slate-500">إجمالي المبيعات</th>
                  <th className="px-6 py-4 font-bold text-slate-500">رسوم Paymob</th>
                  <th className="px-6 py-4 font-bold text-slate-500">عمولة المنصة</th>
                  <th className="px-6 py-4 font-bold text-slate-500 text-blue-600">صافي التاجر</th>
                  <th className="px-6 py-4 font-bold text-slate-500">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pending.map((m) => (
                  <tr key={m.merchantId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{m.storeName}</div>
                      <div className="text-xs text-slate-400">{m.email}</div>
                      {m.bankInfo?.bankName && <div className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5"><Building2 size={10} />{m.bankInfo.bankName}</div>}
                    </td>
                    <td className="px-6 py-4"><Badge variant={m.subscriptionPlan === 'business' ? 'amber' : m.subscriptionPlan === 'professional' ? 'purple' : m.subscriptionPlan === 'starter' ? 'info' : 'default'}>{m.subscriptionPlan}</Badge></td>
                    <td className="px-6 py-4 font-mono text-slate-700">{m.ordersCount}</td>
                    <td className="px-6 py-4 font-mono text-slate-700">{m.grossAmount.toLocaleString()} ج.م</td>
                    <td className="px-6 py-4 font-mono text-rose-600">−{m.paymobFees.toLocaleString()} ج.م</td>
                    <td className="px-6 py-4 font-mono text-emerald-600">−{m.matgarcoCommission.toLocaleString()} ج.م</td>
                    <td className="px-6 py-4 font-black text-blue-600 font-mono">{m.netAmount.toLocaleString()} ج.م</td>
                    <td className="px-6 py-4">
                      <Button size="xs" variant="primary" icon={<ChevronRight size={12} />} onClick={() => setModal(m)} loading={processing === m.merchantId}>تسوية</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : history.length === 0 ? (
          <EmptyState icon={<CheckCircle size={32} />} title="لا يوجد سجل تسويات" description="سيظهر هنا سجل التسويات بعد أول عملية." />
        ) : (
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-500">التاجر</th>
                <th className="px-6 py-4 font-bold text-slate-500">الفترة</th>
                <th className="px-6 py-4 font-bold text-slate-500">الطلبات</th>
                <th className="px-6 py-4 font-bold text-slate-500">المبلغ المحوّل</th>
                <th className="px-6 py-4 font-bold text-slate-500">رقم الإيصال</th>
                <th className="px-6 py-4 font-bold text-slate-500">الحالة</th>
                <th className="px-6 py-4 font-bold text-slate-500">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{p.merchantId?.storeName}</div>
                    <div className="text-xs text-slate-400">{p.merchantId?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-mono">{new Date(p.periodFrom).toLocaleDateString('ar')} ← {new Date(p.periodTo).toLocaleDateString('ar')}</td>
                  <td className="px-6 py-4 font-mono">{p.ordersCount}</td>
                  <td className="px-6 py-4 font-black text-blue-600 font-mono">{p.netAmount.toLocaleString()} ج.م</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">{p.transferReference || '—'}</td>
                  <td className="px-6 py-4"><Badge variant={p.status === 'paid' ? 'success' : p.status === 'failed' ? 'danger' : 'warning'}>{p.status === 'paid' ? 'محوّل' : p.status === 'failed' ? 'فشل' : 'معلق'}</Badge></td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-mono">{new Date(p.createdAt).toLocaleDateString('ar')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {modal && (
        <Modal open onClose={() => setModal(null)} title={`تسوية: ${modal.storeName}`} size="sm" footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>إلغاء</Button>
            <Button variant="primary" icon={<CheckCircle size={16} />} loading={!!processing} onClick={handleProcess}>تأكيد التسوية</Button>
          </>
        }>
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600"><span>إجمالي المبيعات</span><span className="font-mono">{modal.grossAmount.toLocaleString()} ج.م</span></div>
              <div className="flex justify-between text-rose-600"><span>رسوم Paymob</span><span className="font-mono">−{modal.paymobFees.toLocaleString()} ج.م</span></div>
              <div className="flex justify-between text-emerald-600"><span>عمولة Matgarco</span><span className="font-mono">−{modal.matgarcoCommission.toLocaleString()} ج.م</span></div>
              <div className="flex justify-between font-black text-blue-700 pt-2 border-t border-slate-200 text-base">
                <span>صافي التاجر</span><span className="font-mono">{modal.netAmount.toLocaleString()} ج.م</span>
              </div>
            </div>
            {modal.bankInfo?.bankName && (
              <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 space-y-1">
                <div className="font-bold flex items-center gap-1"><Building2 size={12} />{modal.bankInfo.bankName}</div>
                <div>{modal.bankInfo.accountName} — {modal.bankInfo.accountNumber}</div>
                {modal.bankInfo.iban && <div>IBAN: {modal.bankInfo.iban}</div>}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">رقم إيصال التحويل</label>
              <input value={transferRef} onChange={e => setTransferRef(e.target.value)} placeholder="مثال: TXN-20260324-001" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">ملاحظات</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

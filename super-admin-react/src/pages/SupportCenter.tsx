import { useState, useEffect } from 'react';
import { LifeBuoy, AlertCircle, Send, User, Store } from 'lucide-react';
import clsx from 'clsx';
import api from '../lib/api';
import { Button, Card, Badge, Modal, SegmentedControl, Skeleton, EmptyState } from '../components/ui';
import { PageHeader } from '../components/layout/PageHeader';
import { showToast } from '../components/ui/Toast';

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'danger' | 'warning' | 'info' | 'default' }> = {
  open: { label: 'مفتوحة', variant: 'info' },
  in_progress: { label: 'قيد المعالجة', variant: 'warning' },
  resolved: { label: 'تم الحل', variant: 'success' },
  closed: { label: 'مغلقة', variant: 'default' }
};

const CATEGORY_LABELS: Record<string, string> = {
  billing: 'فواتير', technical: 'تقني', shipping: 'شحن', general: 'عام'
};

const PRIORITY_MAP: Record<string, string> = {
  low: 'منخفضة', medium: 'متوسطة', high: 'عالية', urgent: 'عاجلة'
};

export default function SupportCenter() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replying, setReplying] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/super-admin/tickets', { params: { status: filterStatus } });
      setTickets(res.data.data || []);
      setStats(res.data.stats || {});
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل تحميل التذاكر');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [filterStatus]);

  const handleReply = async () => {
    if (!replyContent.trim() || !selectedTicket) return;
    setReplying(true);
    try {
      const res = await api.post(`/super-admin/tickets/${selectedTicket._id}/reply`, { content: replyContent });
      setSelectedTicket(res.data.data);
      setReplyContent('');
      fetchTickets();
      showToast('تم إرسال الرد بنجاح');
    } catch { showToast('فشل إرسال الرد', 'error'); }
    finally { setReplying(false); }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      await api.patch(`/super-admin/tickets/${ticketId}/status`, { status: newStatus });
      if (selectedTicket?._id === ticketId) setSelectedTicket({ ...selectedTicket, status: newStatus });
      fetchTickets();
      showToast('تم تحديث الحالة');
    } catch { showToast('فشل تحديث الحالة', 'error'); }
  };

  const openTicket = async (ticket: any) => {
    try {
      const res = await api.get(`/super-admin/tickets/${ticket._id}`);
      setSelectedTicket(res.data.data);
    } catch { setSelectedTicket(ticket); }
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader icon={<LifeBuoy size={24} />} title="مركز الدعم الفني" iconBg="bg-teal-50" iconColor="text-teal-600" />
        <div className="grid grid-cols-4 gap-4"><Skeleton className="h-20 rounded-2xl" /><Skeleton className="h-20 rounded-2xl" /><Skeleton className="h-20 rounded-2xl" /><Skeleton className="h-20 rounded-2xl" /></div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (error) return <Card className="p-6"><div className="flex items-center gap-2 text-red-600"><AlertCircle size={20}/> {error}</div></Card>;

  const statItems = [
    { label: 'مفتوحة', value: stats.open || 0, color: 'blue' as const },
    { label: 'قيد المعالجة', value: stats.in_progress || 0, color: 'amber' as const },
    { label: 'تم الحل', value: stats.resolved || 0, color: 'emerald' as const },
    { label: 'مغلقة', value: stats.closed || 0, color: 'purple' as const },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<LifeBuoy size={24} />}
        title="مركز الدعم الفني"
        description="إدارة تذاكر الدعم والرد على استفسارات التجار."
        iconBg="bg-teal-50"
        iconColor="text-teal-600"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((s, i) => (
          <Card key={i} padding="md" className="text-center">
            <div className={clsx('text-2xl font-black', s.color === 'emerald' ? 'text-emerald-600' : s.color === 'amber' ? 'text-amber-600' : s.color === 'purple' ? 'text-purple-600' : 'text-blue-600')}>{s.value}</div>
            <div className="text-sm text-slate-500 font-medium">{s.label}</div>
          </Card>
        ))}
      </div>

      <SegmentedControl
        options={[
          { id: 'all', label: 'الكل' },
          { id: 'open', label: 'مفتوحة' },
          { id: 'in_progress', label: 'قيد المعالجة' },
          { id: 'resolved', label: 'تم الحل' },
          { id: 'closed', label: 'مغلقة' },
        ]}
        value={filterStatus}
        onChange={setFilterStatus}
      />

      <Card padding="none">
        {tickets.length === 0 ? (
          <EmptyState icon={<LifeBuoy size={32} />} title="لا توجد تذاكر" description="جميع التذاكر تم حلها." />
        ) : (
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 font-bold text-slate-500">الموضوع</th>
                <th className="px-5 py-3.5 font-bold text-slate-500">المتجر</th>
                <th className="px-5 py-3.5 font-bold text-slate-500">الفئة</th>
                <th className="px-5 py-3.5 font-bold text-slate-500">الأولوية</th>
                <th className="px-5 py-3.5 font-bold text-slate-500">الحالة</th>
                <th className="px-5 py-3.5 font-bold text-slate-500">آخر تحديث</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map(ticket => (
                <tr key={ticket._id} onClick={() => openTicket(ticket)} className="hover:bg-slate-50 cursor-pointer transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{ticket.subject}</td>
                  <td className="px-5 py-3.5 text-slate-600">{ticket.merchantId?.storeName || '—'}</td>
                  <td className="px-5 py-3.5 text-slate-600">{CATEGORY_LABELS[ticket.category] || ticket.category}</td>
                  <td className="px-5 py-3.5"><span className="font-bold text-slate-600">{PRIORITY_MAP[ticket.priority] || ticket.priority}</span></td>
                  <td className="px-5 py-3.5"><Badge variant={STATUS_MAP[ticket.status]?.variant} dot>{STATUS_MAP[ticket.status]?.label}</Badge></td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs font-mono">{new Date(ticket.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {selectedTicket && (
        <Modal open onClose={() => setSelectedTicket(null)} title={selectedTicket.subject} size="2xl" footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setSelectedTicket(null)}>إغلاق</Button>
          </div>
        }>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Store size={14} /> {selectedTicket.merchantId?.storeName || '—'}
              <span className="mx-1">•</span>
              {CATEGORY_LABELS[selectedTicket.category]}
            </div>
            <div className="flex items-center gap-2">
              <select value={selectedTicket.status} onChange={e => handleStatusChange(selectedTicket._id, e.target.value)} className={clsx('px-3 py-1.5 rounded-lg text-xs font-bold border outline-none', selectedTicket.status === 'open' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-700 border-slate-200')}>
                <option value="open">مفتوحة</option>
                <option value="in_progress">قيد المعالجة</option>
                <option value="resolved">تم الحل</option>
                <option value="closed">مغلقة</option>
              </select>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {(selectedTicket.messages || []).length === 0 ? (
                <div className="text-center py-8 text-slate-400">لا توجد رسائل بعد</div>
              ) : (selectedTicket.messages || []).map((msg: any, i: number) => (
                <div key={i} className={clsx('flex gap-3', msg.senderRole === 'admin' ? 'flex-row-reverse' : '')}>
                  <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center shrink-0', msg.senderRole === 'admin' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600')}>
                    <User size={14} />
                  </div>
                  <div className={clsx('max-w-[70%] rounded-2xl px-4 py-3', msg.senderRole === 'admin' ? 'bg-indigo-50 text-slate-900' : 'bg-slate-50 text-slate-900')}>
                    <div className="text-xs font-bold mb-1">{msg.senderName || (msg.senderRole === 'admin' ? 'الإدارة' : 'التاجر')}</div>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <div className="text-xs text-slate-400 mt-1">{msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <input value={replyContent} onChange={e => setReplyContent(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleReply()} placeholder="اكتب ردك هنا..." className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 text-sm" />
              <Button variant="primary" icon={<Send size={16} />} onClick={handleReply} loading={replying} disabled={!replyContent.trim()}>إرسال</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

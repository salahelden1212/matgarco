import { useState, useEffect } from 'react';
import { Users, Plus, AlertCircle, UserCheck, Search } from 'lucide-react';
import api from '../lib/api';
import { Button, Card, Badge, Input, Modal, EmptyState, Skeleton, SegmentedControl } from '../components/ui';
import { PageHeader } from '../components/layout/PageHeader';
import { showToast } from '../components/ui/Toast';

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'support' | 'finance';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterRole, setFilterRole] = useState('all');

  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'support' });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await api.get('/super-admin/staff');
      setStaff(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password) return;
    setSaving(true);
    try {
      await api.post('/super-admin/staff', newUser);
      showToast('تم إنشاء حساب الفريق بنجاح');
      setShowAddModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'support' });
      fetchStaff();
    } catch {
      showToast('فشل إنشاء الحساب', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/super-admin/staff/${id}`, { isActive: !currentStatus });
      setStaff(prev => prev.map(s => s._id === id ? { ...s, isActive: !currentStatus } : s));
      showToast(!currentStatus ? 'تم إيقاف الحساب' : 'تم تفعيل الحساب');
    } catch {
      showToast('فشل تحديث الحالة', 'error');
    }
  };

  const handleResetPassword = async (id: string) => {
    try {
      await api.post(`/super-admin/staff/${id}/reset-password`);
      showToast('تم إرسال رابط إعادة تعيين كلمة المرور');
    } catch {
      showToast('فشل إرسال الرابط', 'error');
    }
  };

  const filteredStaff = staff.filter(s => {
    const matchesSearch = (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (s.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || s.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const ROLE_LABELS: Record<string, string> = {
    super_admin: 'مدير أعلى',
    support: 'دعم فني',
    finance: 'مالية',
  };

  const ROLE_BADGE: Record<string, 'default' | 'success' | 'info' | 'purple' | 'amber'> = {
    super_admin: 'amber',
    support: 'info',
    finance: 'purple',
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader icon={<Users size={24} />} title="فريق الإدارة" iconBg="bg-purple-50" iconColor="text-purple-600" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-red-600"><AlertCircle size={20} /> {error}</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Users size={24} />}
        title="فريق الإدارة"
        description="إدارة حسابات فريق الدعم والمالية في لوحة تحكم السوبر أدمن."
        iconBg="bg-purple-50"
        iconColor="text-purple-600"
        actions={<Button size="sm" icon={<Plus size={16} />} onClick={() => setShowAddModal(true)}>إضافة عضو</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="md">
          <p className="text-sm font-medium text-slate-500 mb-1">إجمالي الفريق</p>
          <p className="text-2xl font-black text-slate-900">{staff.length}</p>
        </Card>
        <Card padding="md">
          <p className="text-sm font-medium text-slate-500 mb-1">مديرين نشطين</p>
          <p className="text-2xl font-black text-emerald-600">{staff.filter(s => s.isActive && s.role === 'super_admin').length}</p>
        </Card>
        <Card padding="md">
          <p className="text-sm font-medium text-slate-500 mb-1">فريق الدعم</p>
          <p className="text-2xl font-black text-blue-600">{staff.filter(s => s.isActive && s.role === 'support').length}</p>
        </Card>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="ابحث بالاسم أو البريد..."
              leftIcon={<Search size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <SegmentedControl
            options={[
              { id: 'all', label: 'الكل' },
              { id: 'super_admin', label: 'مديرين' },
              { id: 'support', label: 'دعم' },
              { id: 'finance', label: 'مالية' },
            ]}
            value={filterRole}
            onChange={setFilterRole}
          />
        </div>

        {filteredStaff.length === 0 ? (
          <EmptyState
            icon={<Users size={32} />}
            title="لا يوجد أعضاء"
            description="ابدأ بإضافة أول عضو في فريق الإدارة."
            action={{ label: '+ إضافة عضو', onClick: () => setShowAddModal(true) }}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredStaff.map((member) => (
              <div key={member._id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                    <Users size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{member.name || member.email}</div>
                    <div className="text-xs text-slate-500 font-mono">{member.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={ROLE_BADGE[member.role] || 'default'}>{ROLE_LABELS[member.role]}</Badge>
                  <Badge variant={member.isActive ? 'success' : 'default'} dot>{member.isActive ? 'نشط' : 'موقوف'}</Badge>
                  <div className="flex items-center gap-1">
                    <Button size="xs" variant="ghost" icon={<UserCheck size={14} />} onClick={() => handleToggleStatus(member._id, member.isActive)}>
                      {member.isActive ? 'إيقاف' : 'تفعيل'}
                    </Button>
                    <Button size="xs" variant="ghost" onClick={() => handleResetPassword(member._id)}>
                      إعادة كلمة المرور
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="إضافة عضو جديد" size="md">
        <form onSubmit={handleAddUser} className="space-y-4">
          <Input
            label="الاسم"
            value={newUser.name}
            onChange={(e) => setNewUser(p => ({ ...p, name: e.target.value }))}
            placeholder="مثال: أحمد محمد"
          />
          <Input
            label="البريد الإلكتروني"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser(p => ({ ...p, email: e.target.value }))}
            placeholder="example@matgarco.com"
            dir="ltr"
          />
          <Input
            label="كلمة المرور المؤقتة"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser(p => ({ ...p, password: e.target.value }))}
            placeholder="••••••••"
            dir="ltr"
          />
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">الصلاحية</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser(p => ({ ...p, role: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500"
            >
              <option value="support">دعم فني</option>
              <option value="finance">مالية</option>
              <option value="super_admin">مدير أعلى</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={() => setShowAddModal(false)}>إلغاء</Button>
            <Button type="submit" fullWidth loading={saving}>إنشاء الحساب</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

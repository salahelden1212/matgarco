import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Tag,
  Plus,
  Percent,
  Truck,
  Trash2,
  PencilLine,
  CheckCircle2,
  Clock,
  Search,
  Sparkles,
  Copy,
  AlertCircle,
  Mail,
  Send,
  Users,
  Eye,
  MousePointerClick,
} from 'lucide-react';
import api from '../../lib/axios';

interface Discount {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrderValue?: number;
  maxUses?: number;
  usedCount: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  applicableProducts?: string[];
  createdAt: string;
}

const emptyDiscount: Omit<Discount, '_id' | 'usedCount' | 'createdAt'> = {
  code: '',
  type: 'percentage',
  value: 0,
  minOrderValue: 0,
  maxUses: 0,
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  isActive: true,
};

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'discounts' | 'create' | 'email'>('discounts');
  const [form, setForm] = useState(emptyDiscount);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'percentage' | 'fixed' | 'free_shipping'>('all');
  const queryClient = useQueryClient();

  // Email marketing state
  const [emailSegment, setEmailSegment] = useState<'all' | 'active' | 'inactive' | 'vip'>('all');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSending, setEmailSending] = useState(false);

  const { data: discountsData } = useQuery({
    queryKey: ['discounts'],
    queryFn: () => api.get('/discounts').then((r) => r.data.data as Discount[]),
  });
  const discounts = discountsData || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/discounts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      toast.success(editingId ? 'تم تحديث الخصم بنجاح' : 'تم إنشاء الخصم بنجاح');
      setForm(emptyDiscount);
      setEditingId(null);
      setActiveTab('discounts');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'فشل في حفظ الخصم');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/discounts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      toast.success('تم حذف الخصم');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/discounts/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      toast.success('تم تحديث الحالة');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) {
      toast.error('كود الخصم مطلوب');
      return;
    }
    if (form.value <= 0) {
      toast.error('القيمة يجب أن تكون أكبر من صفر');
      return;
    }
    if (editingId) {
      createMutation.mutate({ ...form, id: editingId });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleEdit = (discount: Discount) => {
    setForm({
      code: discount.code,
      type: discount.type,
      value: discount.value,
      minOrderValue: discount.minOrderValue || 0,
      maxUses: discount.maxUses || 0,
      startDate: discount.startDate?.split('T')[0] || '',
      endDate: discount.endDate?.split('T')[0] || '',
      isActive: discount.isActive,
    });
    setEditingId(discount._id);
    setActiveTab('create');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الخصم؟')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredDiscounts = discounts.filter((d) => {
    const matchSearch = d.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === 'all' || d.type === typeFilter;
    return matchSearch && matchType;
  });

  const stats = {
    total: discounts.length,
    active: discounts.filter((d) => d.isActive && !(d.endDate && new Date(d.endDate) < new Date())).length,
    expired: discounts.filter((d) => d.endDate && new Date(d.endDate) < new Date()).length,
    totalUsed: discounts.reduce((s, d) => s + (d.usedCount || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التسويق والخصومات</h1>
          <p className="text-gray-500 text-sm mt-1">أنشئ وأدِر أكواد الخصم والعروض الترويجية</p>
        </div>
        <button
          onClick={() => {
            setForm(emptyDiscount);
            setEditingId(null);
            setActiveTab('create');
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          خصم جديد
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2.5 rounded-xl">
              <Tag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">إجمالي الخصومات</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-green-50 p-2.5 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-sm text-gray-500">خصومات نشطة</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-red-50 p-2.5 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
              <p className="text-sm text-gray-500">خصومات منتهية</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-purple-50 p-2.5 rounded-xl">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsed}</p>
              <p className="text-sm text-gray-500">مرات الاستخدام</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Form */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 text-lg mb-6">
            {editingId ? 'تعديل الخصم' : 'إنشاء خصم جديد'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  كود الخصم <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
                  placeholder="SUMMER2024"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  نوع الخصم
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="percentage">نسبة مئوية (%)</option>
                  <option value="fixed">مبلغ ثابت (جنيه)</option>
                  <option value="free_shipping">شحن مجاني</option>
                </select>
              </div>

              {form.type !== 'free_shipping' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    قيمة الخصم <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.value || ''}
                      onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder={form.type === 'percentage' ? '20' : '50'}
                      min="0"
                      max={form.type === 'percentage' ? 100 : undefined}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      {form.type === 'percentage' ? '%' : 'جنيه'}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  الحد الأدنى للطلب
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.minOrderValue || ''}
                    onChange={(e) => setForm({ ...form, minOrderValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">جنيه</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  الحد الأقصى للاستخدامات
                </label>
                <input
                  type="number"
                  value={form.maxUses || ''}
                  onChange={(e) => setForm({ ...form, maxUses: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0 = غير محدود"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  تاريخ البداية
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  تاريخ النهاية (اختياري)
                </label>
                <input
                  type="date"
                  value={form.endDate || ''}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium text-sm disabled:opacity-50"
              >
                {createMutation.isPending ? 'جاري الحفظ...' : editingId ? 'تحديث الخصم' : 'إنشاء الخصم'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm(emptyDiscount);
                  setEditingId(null);
                  setActiveTab('discounts');
                }}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Discounts List */}
      {activeTab === 'discounts' && (
        <div className="bg-white rounded-xl border border-gray-100">
          {/* Search & Filter */}
          <div className="px-6 py-4 border-b border-gray-50 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="بحث بكود الخصم..."
                dir="rtl"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">كل الأنواع</option>
              <option value="percentage">نسبة مئوية</option>
              <option value="fixed">مبلغ ثابت</option>
              <option value="free_shipping">شحن مجاني</option>
            </select>
          </div>

          <div className="divide-y divide-gray-50">
            {filteredDiscounts.length > 0 ? (
              filteredDiscounts.map((discount) => {
                const typeIcon = discount.type === 'percentage' ? Percent : discount.type === 'free_shipping' ? Truck : Tag;
                const typeLabel = discount.type === 'percentage' ? `${discount.value}%` : discount.type === 'free_shipping' ? 'شحن مجاني' : `${discount.value} جنيه`;
                const isExpired = discount.endDate && new Date(discount.endDate) < new Date();
                const isExhausted = discount.maxUses && discount.usedCount >= discount.maxUses;

                return (
                  <div key={discount._id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition">
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${discount.isActive ? 'bg-indigo-50' : 'bg-gray-100'}`}>
                        {React.createElement(typeIcon, {
                          className: `w-5 h-5 ${discount.isActive ? 'text-indigo-600' : 'text-gray-400'}`,
                        })}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-bold text-gray-900">{discount.code}</p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(discount.code);
                              toast.success('تم نسخ الكود');
                            }}
                            className="p-0.5 text-gray-400 hover:text-gray-600"
                            title="نسخ الكود"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                            discount.isActive && !isExpired && !isExhausted
                              ? 'bg-green-100 text-green-700'
                              : isExpired ? 'bg-red-100 text-red-700'
                              : isExhausted ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {isExpired ? 'منتهي' : isExhausted ? 'مستنفذ' : discount.isActive ? 'نشط' : 'معطل'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {typeLabel}
                          {discount.minOrderValue ? ` · حد أدنى ${discount.minOrderValue} جنيه` : ''}
                          {discount.maxUses ? ` · ${discount.usedCount}/${discount.maxUses} استخدام` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleMutation.mutate({ id: discount._id, isActive: !discount.isActive })}
                        className={`p-2 rounded-lg transition ${
                          discount.isActive ? 'text-amber-500 hover:bg-amber-50' : 'text-green-500 hover:bg-green-50'
                        }`}
                        title={discount.isActive ? 'تعطيل' : 'تفعيل'}
                      >
                        {discount.isActive ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleEdit(discount)}
                        className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition"
                        title="تعديل"
                      >
                        <PencilLine className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(discount._id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Tag className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">
                  {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد خصومات بعد'}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm ? 'جرب البحث بكود مختلف' : 'أنشئ أول كود خصم لبدء التسويق'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setActiveTab('create')}
                    className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    إنشاء خصم
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Email Marketing Tab */}
      {activeTab === 'email' && (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 bg-white rounded-xl border border-gray-100 p-1.5">
            <button
              onClick={() => setActiveTab('discounts')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              <Tag className="w-4 h-4" />
              أكواد الخصم
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white"
            >
              <Mail className="w-4 h-4" />
              حملة بريدية
            </button>
          </div>

          {/* Customer Segments */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4">اختر شريحة العملاء</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: 'all', label: 'جميع العملاء', icon: Users, color: 'bg-blue-50 text-blue-700 border-blue-200' },
                { key: 'active', label: 'عملاء نشطين', icon: CheckCircle2, color: 'bg-green-50 text-green-700 border-green-200' },
                { key: 'inactive', label: 'عملاء غير نشطين', icon: Clock, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
                { key: 'vip', label: 'عملاء VIP', icon: Sparkles, color: 'bg-purple-50 text-purple-700 border-purple-200' },
              ].map((seg) => {
                const Icon = seg.icon;
                return (
                  <button
                    key={seg.key}
                    onClick={() => setEmailSegment(seg.key as any)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                      emailSegment === seg.key
                        ? seg.color
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{seg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email Template */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4">محتوى الرسالة</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  عنوان الرسالة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="عنوان الرسالة..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  محتوى الرسالة <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
                  placeholder="اكتب محتوى الرسالة هنا..."
                />
              </div>

              {/* Quick Templates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  قوالب سريعة
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'عرض خاص', subject: 'عرض خاص لك!', body: 'مرحباً {name}،\n\nلدينا عرض خاص لك! استخدم كود الخصم للحصول على خصم على مشترياتك.\n\nمع تحياتنا' },
                    { label: 'منتج جديد', subject: 'منتج جديد وصل!', body: 'مرحباً {name}،\n\nوصلنا منتج جديد قد يعجبك! تفقد متجرنا الآن.\n\nمع تحياتنا' },
                    { label: 'تذكير بالسلة', subject: 'نسيت شيئاً في سلتك!', body: 'مرحباً {name}،\n\nيبدو أنك نسيت إكمال طلبك! المنتجات لا تزال في سلتك.\n\nأكمل طلبك الآن' },
                  ].map((tpl) => (
                    <button
                      key={tpl.label}
                      onClick={() => {
                        setEmailSubject(tpl.subject);
                        setEmailBody(tpl.body);
                      }}
                      className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Send Button */}
          <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-6">
            <div className="text-sm text-gray-500">
              سيتم إرسال الرسالة لشريحة: <span className="font-medium text-gray-900">
                {emailSegment === 'all' ? 'جميع العملاء' : emailSegment === 'active' ? 'العملاء النشطين' : emailSegment === 'inactive' ? 'العملاء غير النشطين' : 'عملاء VIP'}
              </span>
            </div>
            <button
              onClick={() => {
                if (!emailSubject || !emailBody) {
                  toast.error('يرجى ملء عنوان ومحتوى الرسالة');
                  return;
                }
                setEmailSending(true);
                // Simulate sending
                setTimeout(() => {
                  setEmailSending(false);
                  toast.success('تم إرسال الحملة البريدية بنجاح');
                  setEmailSubject('');
                  setEmailBody('');
                }, 2000);
              }}
              disabled={emailSending || !emailSubject || !emailBody}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium text-sm disabled:opacity-50"
            >
              {emailSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  إرسال الحملة
                </>
              )}
            </button>
          </div>

          {/* Campaign Analytics (Placeholder) */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4">إحصائيات الحملات السابقة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Mail className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-500">حملات مرسلة</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Users className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-500">مستلمين</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Eye className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">0%</p>
                <p className="text-xs text-gray-500">معدل الفتح</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <MousePointerClick className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">0%</p>
                <p className="text-xs text-gray-500">معدل النقر</p>
              </div>
            </div>
            <p className="text-center text-sm text-gray-400 mt-4">
              ستظهر الإحصائيات هنا بعد إرسال أول حملة بريدية
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

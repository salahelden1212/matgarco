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
  const [activeTab, setActiveTab] = useState<'discounts' | 'create'>('discounts');
  const [form, setForm] = useState(emptyDiscount);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

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

  const filteredDiscounts = discounts.filter((d) =>
    d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: discounts.length,
    active: discounts.filter((d) => d.isActive).length,
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
      <div className="grid grid-cols-3 gap-4">
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
          {/* Search */}
          <div className="px-6 py-4 border-b border-gray-50">
            <div className="relative max-w-sm">
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
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                            discount.isActive && !isExpired && !isExhausted
                              ? 'bg-green-100 text-green-700'
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
    </div>
  );
}

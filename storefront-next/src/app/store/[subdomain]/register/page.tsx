'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, Lock, User, Phone, Eye, EyeOff, Store } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function RegisterPage({ params }: { params: { subdomain: string } }) {
  const { subdomain } = params;
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/storefront/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, subdomain }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message || 'فشل إنشاء الحساب');
        return;
      }
      localStorage.setItem(`customer_token_${subdomain}`, json.data.accessToken);
      localStorage.setItem(`customer_refresh_${subdomain}`, json.data.refreshToken);
      router.push(`/store/${subdomain}/account`);
      router.refresh();
    } catch {
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[var(--background)] to-[var(--surface)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Store className="w-12 h-12 mx-auto mb-3 text-[var(--primary)]" />
          <h1 className="text-2xl font-black">إنشاء حساب جديد</h1>
          <p className="text-sm mt-1 text-[var(--text-muted)]">أنشئ حسابك لتتبع طلباتك وشرائك بسهولة</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[var(--surface)] rounded-2xl p-6 shadow-xl border border-[var(--border)] space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium text-center border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-[var(--text)]">
                <User className="w-4 h-4 inline ml-1" /> الاسم الأول
              </label>
              <input value={form.firstName} onChange={update('firstName')} required className="w-full px-4 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text)]" placeholder="محمد" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-[var(--text)]">
                <User className="w-4 h-4 inline ml-1" /> الاسم الأخير
              </label>
              <input value={form.lastName} onChange={update('lastName')} required className="w-full px-4 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text)]" placeholder="أحمد" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text)]">
              <Mail className="w-4 h-4 inline ml-1" /> البريد الإلكتروني
            </label>
            <input type="email" value={form.email} onChange={update('email')} required className="w-full px-4 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text)]" placeholder="example@email.com" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text)]">
              <Phone className="w-4 h-4 inline ml-1" /> رقم الهاتف
            </label>
            <input type="tel" value={form.phone} onChange={update('phone')} className="w-full px-4 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text)]" placeholder="01012345678" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text)]">
              <Lock className="w-4 h-4 inline ml-1" /> كلمة المرور
            </label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={update('password')} required minLength={8} className="w-full px-4 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text)]" placeholder="•••••••• (8 أحرف أو أكثر)" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><UserPlus className="w-4 h-4" /> إنشاء الحساب</>
            )}
          </button>

          <p className="text-center text-sm text-[var(--text-muted)]">
            لديك حساب بالفعل؟{' '}
            <Link href={`/store/${subdomain}/login`} className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
              تسجيل دخول
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

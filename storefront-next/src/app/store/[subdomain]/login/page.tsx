'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Mail, Lock, Eye, EyeOff, Store } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function LoginPage({ params }: { params: { subdomain: string } }) {
  const { subdomain } = params;
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/storefront/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, subdomain }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message || 'فشل تسجيل الدخول');
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
          <h1 className="text-2xl font-black">تسجيل الدخول</h1>
          <p className="text-sm mt-1 text-[var(--text-muted)]">مرحباً بعودتك! سجل دخولك لمتابعة طلباتك</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[var(--surface)] rounded-2xl p-6 shadow-xl border border-[var(--border)] space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium text-center border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5 text-[var(--text)]">
              <Mail className="w-4 h-4 inline ml-1" /> البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text)]"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-[var(--text)]">
              <Lock className="w-4 h-4 inline ml-1" /> كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              className="w-full px-4 py-3.5 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text)]"
              placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-[var(--text-muted)]">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><LogIn className="w-4 h-4" /> تسجيل الدخول</>
            )}
          </button>

          <p className="text-center text-sm text-[var(--text-muted)]">
            ليس لديك حساب؟{' '}
            <Link href={`/store/${subdomain}/register`} className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
              إنشاء حساب جديد
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

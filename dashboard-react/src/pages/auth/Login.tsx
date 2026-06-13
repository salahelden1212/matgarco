import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Check for error in URL params
  useState(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    
    if (errorParam === 'merchant_required') {
      setError('يرجى تسجيل الدخول مرة أخرى لتحديث بيانات الحساب');
    } else if (errorParam === 'authentication_failed') {
      setError('فشلت عملية التحقق عبر جوجل. يرجى المحاولة مرة أخرى.');
    }
  });

  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (response) => {
      const { user, accessToken } = response.data.data;
      setAuth(user, accessToken);
      
      // Redirect based on role / onboarding state
      if (user.role === 'super_admin') {
        navigate('/admin');
      } else if (user.onboardingCompleted === false) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      
      let errorMessage = 'فشل تسجيل الدخول';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 401) {
        errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      } else if (error.response?.status === 404) {
        errorMessage = 'الحساب غير موجود';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      if (errorMessage.toLowerCase().includes('invalid credentials')) {
        errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      } else if (errorMessage.toLowerCase().includes('user not found')) {
        errorMessage = 'الحساب غير موجود';
      } else if (errorMessage.toLowerCase().includes('network')) {
        errorMessage = 'خطأ في الاتصال. تأكد من تشغيل الخادم';
      }
      
      setError(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email.trim()) {
      setError('البريد الإلكتروني مطلوب');
      return;
    }
    
    if (!formData.password) {
      setError('كلمة المرور مطلوبة');
      return;
    }
    
    loginMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Helper to generate correct OAuth URL without double /api path
  const getOAuthUrl = (provider: 'google' | 'apple') => {
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api$/, '');
    return `${baseUrl}/api/auth/oauth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans select-none relative overflow-hidden">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl shadow-xl p-8 relative">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center justify-center">
            <img src="/logo.png" alt="Matgarco" className="h-14 w-auto object-contain mb-3" />
            <div className="text-2xl font-black text-slate-900 tracking-wider">
              MATGARCO
            </div>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mt-4">مرحباً بك مجدداً</h1>
          <p className="text-slate-500 mt-2 text-sm">سجل دخولك لمتابعة مبيعات متجرك</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50/80 border border-red-100 rounded-2xl text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-600 mb-2 mr-1">البريد الإلكتروني</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 pr-12 text-slate-900 outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition text-sm font-medium"
                placeholder="example@matgarco.com"
                disabled={loginMutation.isPending}
              />
              <div className="absolute inset-y-0 right-4 flex items-center text-slate-400 pointer-events-none">
                <Mail className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Password input */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-600 mb-2 mr-1">كلمة المرور</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 pr-12 text-slate-900 outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition text-sm font-medium"
                placeholder="••••••••"
                disabled={loginMutation.isPending}
              />
              <div className="absolute inset-y-0 right-4 flex items-center text-slate-400 pointer-events-none">
                <Lock className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-4 flex items-center text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Utilities */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <label className="flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded-lg bg-slate-50 border border-slate-200 text-indigo-600 focus:ring-0 focus:ring-offset-0 transition cursor-pointer"
              />
              <span className="mr-2 text-slate-600">تذكرني</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-indigo-600 hover:text-indigo-700 font-bold transition"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 shadow-md shadow-indigo-100"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري تسجيل الدخول...
              </>
            ) : (
              'تسجيل الدخول'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-8 flex items-center">
          <div className="flex-1 border-t border-slate-100"></div>
          <span className="px-4 text-xs text-slate-400 font-bold">أو عبر</span>
          <div className="flex-1 border-t border-slate-100"></div>
        </div>

        {/* OAuth Buttons */}
        <div className="mt-6">
          <a
            href={getOAuthUrl('google')}
            className="flex items-center justify-center gap-2.5 w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition active:scale-[0.98] text-sm shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            تسجيل الدخول باستخدام Google
          </a>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-xs text-slate-400">
          ليس لديك حساب؟{' '}
          <Link
            to="/register"
            className="text-indigo-600 hover:text-indigo-700 font-bold transition ml-1"
          >
            إنشاء حساب جديد
          </Link>
        </div>
      </div>
    </div>
  );
}

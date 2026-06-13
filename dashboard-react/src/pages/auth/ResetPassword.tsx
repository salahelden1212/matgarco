import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authAPI } from '../../lib/api';
import { Lock, Eye, EyeOff, Loader2, Check, X, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Password Validation States
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password && password === confirmPassword;

  const isFormValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && passwordsMatch;

  useEffect(() => {
    if (!token) {
      setError('رمز إعادة التعيين مفقود. يرجى استخدام رابط إعادة التعيين الصحيح من بريدك الإلكتروني.');
    }
  }, [token]);

  const resetMutation = useMutation({
    mutationFn: () => authAPI.resetPassword(token || '', password),
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (err: any) => {
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'حدث خطأ أثناء إعادة تعيين كلمة المرور. قد يكون الرابط منتهي الصلاحية.'
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!isFormValid) return;
    setError('');
    resetMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans select-none relative overflow-hidden">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl shadow-xl p-8 relative">
        {success ? (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">تم تغيير كلمة المرور بنجاح!</h2>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed">
              لقد قمنا بتحديث كلمة المرور الخاصة بك. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition shadow-md shadow-indigo-100"
            >
              الذهاب لتسجيل الدخول
            </button>
          </div>
        ) : (
          <>
            {/* Brand Header */}
            <div className="text-center mb-8">
              <div className="flex flex-col items-center justify-center">
                <img src="/logo.png" alt="Matgarco" className="h-14 w-auto object-contain mb-3" />
                <div className="text-2xl font-black text-slate-900 tracking-wider">
                  MATGARCO
                </div>
              </div>
              <h1 className="text-xl font-bold text-slate-800 mt-4">إعادة تعيين كلمة المرور</h1>
              <p className="text-slate-500 mt-2 text-sm">أدخل كلمة المرور الجديدة والقوية لحسابك</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50/80 border border-red-100 rounded-2xl text-red-700 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password Input */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-600 mb-2 mr-1">كلمة المرور الجديدة</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 pr-12 text-slate-900 outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition text-sm font-medium"
                    placeholder="••••••••"
                    disabled={!token || resetMutation.isPending}
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

              {/* Confirm Password Input */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-600 mb-2 mr-1">تأكيد كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 pr-12 text-slate-900 outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition text-sm font-medium"
                    placeholder="••••••••"
                    disabled={!token || resetMutation.isPending}
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center text-slate-400 pointer-events-none">
                    <Lock className="w-5 h-5" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 left-4 flex items-center text-slate-400 hover:text-slate-600 transition"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Password Validation List */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs text-slate-500">
                <span className="font-bold text-slate-700 block mb-1">شروط كلمة المرور:</span>
                <div className="flex items-center gap-2">
                  {hasMinLength ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-500" />}
                  <span className={hasMinLength ? 'text-slate-700 font-medium' : ''}>8 أحرف على الأقل</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasUpperCase ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-500" />}
                  <span className={hasUpperCase ? 'text-slate-700 font-medium' : ''}>حرف كبير واحد على الأقل (A-Z)</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasLowerCase ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-500" />}
                  <span className={hasLowerCase ? 'text-slate-700 font-medium' : ''}>حرف صغير واحد على الأقل (a-z)</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasNumber ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-500" />}
                  <span className={hasNumber ? 'text-slate-700 font-medium' : ''}>رقم واحد على الأقل (0-9)</span>
                </div>
                <div className="flex items-center gap-2">
                  {passwordsMatch ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-500" />}
                  <span className={passwordsMatch ? 'text-slate-700 font-medium' : ''}>تطابق كلمتي المرور</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!token || !isFormValid || resetMutation.isPending}
                className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 shadow-md shadow-indigo-100"
              >
                {resetMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري حفظ كلمة المرور...
                  </>
                ) : (
                  'حفظ وتغيير كلمة المرور'
                )}
              </button>

              {/* Back to Login Link */}
              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-indigo-600 hover:text-indigo-700 transition text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  العودة لصفحة الدخول
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

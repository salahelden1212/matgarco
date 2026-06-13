import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authAPI } from '../../lib/api';
import { Mail, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const forgotMutation = useMutation({
    mutationFn: authAPI.forgotPassword,
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (err: any) => {
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'فشل في إرسال البريد. تأكد من صحة البريد الإلكتروني المدخل وحاول مرة أخرى.'
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('البريد الإلكتروني مطلوب');
      return;
    }
    
    forgotMutation.mutate(email);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans select-none relative overflow-hidden">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl shadow-xl p-8 relative">
        {submitted ? (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">تفقد بريدك الإلكتروني!</h2>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed">
              لقد أرسلنا تعليمات لإعادة تعيين كلمة المرور إلى <strong className="text-slate-800">{email}</strong>. يرجى مراجعة بريدك والضغط على الرابط لتغيير كلمة المرور.
            </p>
            <Link
              to="/login"
              className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition flex items-center justify-center gap-2 shadow-md shadow-indigo-100"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة لتسجيل الدخول
            </Link>
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
              <h1 className="text-xl font-bold text-slate-800 mt-4">نسيت كلمة المرور؟</h1>
              <p className="text-slate-500 mt-2 text-sm">أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة التعيين</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50/80 border border-red-100 rounded-2xl text-red-700 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 mr-1">البريد الإلكتروني</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full bg-slate-50 border ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100'} rounded-2xl px-4 py-3.5 pr-12 text-slate-900 outline-none focus:bg-white focus:ring-4 transition text-sm font-medium`}
                    placeholder="example@matgarco.com"
                    disabled={forgotMutation.isPending}
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center text-slate-400 pointer-events-none">
                    <Mail className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={forgotMutation.isPending}
                className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 shadow-md shadow-indigo-100"
              >
                {forgotMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  'إرسال رابط إعادة التعيين'
                )}
              </button>

              <div className="text-center mt-6">
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 text-xs font-bold inline-flex items-center gap-1.5 transition">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  العودة لصفحة الدخول
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

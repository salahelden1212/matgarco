import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authAPI } from '../../lib/api';
import { ShieldCheck, Loader2, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

export default function EmailVerification() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  const verifyMutation = useMutation({
    mutationFn: (t: string) => authAPI.verifyEmail(t),
    onSuccess: () => {
      setVerified(true);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.response?.data?.error || 'فشل في التحقق من البريد الإلكتروني.');
    },
  });

  const handleVerify = () => {
    if (token) {
      verifyMutation.mutate(token);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">رابط غير صالح</h1>
          <p className="text-gray-600 mb-6">
            لم يتم العثور على رمز التحقق. يرجى التحقق من بريدك الإلكتروني مرة أخرى.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            <ArrowRight className="w-4 h-4" />
            العودة لتسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">تم التحقق بنجاح!</h1>
          <p className="text-gray-600 mb-6">
            تم التحقق من بريدك الإلكتروني بنجاح. يمكنك الآن استخدام جميع مميزات المنصة.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            <ArrowRight className="w-4 h-4" />
            الذهاب للوحة التحكم
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">تحقق من بريدك الإلكتروني</h1>
        <p className="text-gray-600 mb-6">
          اضغط على الزر أدناه للتحقق من بريدك الإلكتروني.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={verifyMutation.isPending}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-400 flex items-center justify-center gap-2"
        >
          {verifyMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري التحقق...
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              تحقق من البريد الإلكتروني
            </>
          )}
        </button>

        <div className="mt-4">
          <Link to="/login" className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1">
            <ArrowRight className="w-3 h-3" />
            العودة لتسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}

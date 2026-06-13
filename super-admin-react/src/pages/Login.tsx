import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { Button, Input, Card } from '../components/ui';
import { Mail, Lock, KeyRound } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken } = response.data.data;
      
      if (user.role !== 'super_admin') {
        setError('لا تملك صلاحية الدخول كمدير للنظام.');
        setLoading(false);
        return;
      }
      
      login(user, accessToken);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'البريد الإلكتروني أو كلمة المرور غير صالحة.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-50/70 -z-10 blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-slate-100 -z-10 blur-3xl" />

      <div className="w-full max-w-md z-10">
        {/* Header Block */}
        <div className="flex flex-col items-center mb-8 text-center">
          <img 
            src="/logo.png" 
            alt="Matgarco" 
            className="w-48 h-auto object-contain mb-5 transition-transform duration-300 hover:scale-105" 
          />
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-heading">
            ماتجرّكو للإدارة
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm font-semibold">
            لوحة تحكم الإدارة العامة والرقابة
          </p>
        </div>

        {/* Card Form */}
        <Card padding="lg" className="border-t-4 border-indigo-600 shadow-xl rounded-2xl bg-white">
          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="البريد الإلكتروني"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@matgarco.com"
              dir="ltr"
              required
              leftIcon={<Mail className="w-5 h-5 text-slate-400" />}
            />
            
            <Input
              label="كلمة المرور"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              dir="ltr"
              required
              leftIcon={<Lock className="w-5 h-5 text-slate-400" />}
            />

            {error && (
              <div className="p-3.5 bg-red-50 text-red-650 rounded-xl text-xs font-bold border border-red-200 flex items-center gap-2">
                ⚠️ {error}
              </div>
            )}

            <Button 
              type="submit" 
              fullWidth 
              loading={loading} 
              className="mt-3 py-3 rounded-xl text-sm font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20"
              icon={<KeyRound className="w-4 h-4 ml-1" />}
            >
              {loading ? 'جاري التحقق...' : 'تسجيل الدخول للإدارة'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

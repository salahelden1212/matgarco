import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { Button, Input, Card } from '../components/ui';

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
      setError(err.response?.data?.message || 'Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Matgarco" className="w-16 h-16 object-contain mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Matgarco Admin</h1>
          <p className="text-slate-500 mt-1 text-sm">تسجيل الدخول للإدارة العليا</p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="البريد الإلكتروني"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@matgarco.com"
              dir="ltr"
              required
            />
            <Input
              label="كلمة المرور"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              dir="ltr"
              required
            />

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-200">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth loading={loading} className="mt-2">
              {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

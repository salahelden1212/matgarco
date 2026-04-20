import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function AuthCallback() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get parameters from URL
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const onboarding = params.get('onboarding');
        const error = params.get('error');

        if (error) {
          console.error('OAuth error:', error);
          navigate('/login?error=authentication_failed');
          return;
        }

        if (!token) {
          console.error('No token received');
          navigate('/login?error=no_token');
          return;
        }

        // Get current user data
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        const user = userData.data;

        // Set auth in store
        setAuth(user, token);

        // Redirect based on merchant status
        if (onboarding === '/dashboard') {
          navigate('/dashboard');
        } else if (onboarding === '/onboarding') {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login?error=callback_error');
      }
    };

    handleCallback();
  }, [setAuth, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">جاري تسجيل الدخول...</h2>
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    </div>
  );
}

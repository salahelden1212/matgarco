import toast, { Toaster } from 'react-hot-toast';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export function showToast(message: string, _type: ToastType = 'success') {
  toast(message, {
    duration: 4000,
    position: 'top-center',
    style: {
      borderRadius: '16px',
      padding: '12px 16px',
      fontFamily: 'Tajawal, sans-serif',
      fontWeight: 'bold',
      fontSize: '14px',
    },
  });
}

export const ToastProvider = () => (
  <Toaster
    toastOptions={{
      className: 'border shadow-lg',
    }}
  />
);

import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  CreditCard,
  Palette,
  Settings,
  Users,
  LifeBuoy,
  Wallet,
  Package,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';

const menuItems = [
  { name: 'الرئيسية', icon: LayoutDashboard, path: '/' },
  { name: 'التجار والمتاجر', icon: Store, path: '/merchants' },
  { name: 'الماليات والاشتراكات', icon: CreditCard, path: '/finance' },
  { name: 'التسويات الأسبوعية', icon: Wallet, path: '/payouts' },
  { name: 'باقات الاشتراك', icon: Package, path: '/plans' },
  { name: 'القوالب والثيمات', icon: Palette, path: '/themes' },
  { name: 'الدعم الفني', icon: LifeBuoy, path: '/support' },
  { name: 'الإعدادات العامة', icon: Settings, path: '/settings' },
  { name: 'فريق الإدارة', icon: Users, path: '/staff' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onCloseMobile?: () => void;
}

export function Sidebar({ collapsed, onToggle, onCloseMobile }: SidebarProps) {
  const { logout } = useAuthStore();

  return (
    <aside
      className={cn(
        'fixed top-0 bottom-0 right-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800',
        'text-slate-300 flex flex-col z-40',
        'transition-all duration-300 ease-out',
        'border-r border-slate-700/50',
        'shadow-2xl shadow-black/20',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      <div className="h-[68px] flex items-center justify-center border-b border-slate-700/50 shrink-0 px-4">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Matgarco" className="w-9 h-9 object-contain shrink-0" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-white font-extrabold text-lg leading-tight">Matgarco</span>
              <span className="text-slate-500 text-[10px] font-medium">Super Admin</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin">
        {!collapsed && (
          <div className="mb-2 px-3">
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">القائمة الرئيسية</span>
          </div>
        )}
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all group relative',
                    'before:absolute before:right-0 before:top-1/2 before:-translate-y-1/2 before:h-0 before:w-1 before:rounded-l-full before:transition-all',
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/20 to-transparent text-indigo-400 before:h-8 before:bg-indigo-500'
                      : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
                  )
                }
              >
                <item.icon size={20} className="shrink-0" />
                {!collapsed && (
                  <span className="truncate flex-1 text-sm">{item.name}</span>
                )}
                {collapsed && (
                  <div className="absolute right-full mr-3 px-3 py-2 bg-slate-800 text-white text-sm font-bold rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700/50">
                    {item.name}
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-6 pt-4 border-t border-slate-700/50">
          {!collapsed && (
            <div className="mb-2 px-3">
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">الإحصائيات</span>
            </div>
          )}
          <div className={cn('px-3 space-y-2', collapsed && 'px-2')}>
            <div className={cn('rounded-xl p-3 bg-slate-800/40 border border-slate-700/30', collapsed && 'p-2')}>
              <div className={cn('font-bold text-white text-lg', collapsed && 'text-center text-sm')}>12</div>
              <div className={cn('text-slate-500 text-xs', collapsed && 'text-[9px]')}>متاجر نشطة</div>
            </div>
            <div className={cn('rounded-xl p-3 bg-slate-800/40 border border-slate-700/30', collapsed && 'p-2')}>
              <div className={cn('font-bold text-emerald-400 text-lg', collapsed && 'text-center text-sm')}>3,450</div>
              <div className={cn('text-slate-500 text-xs', collapsed && 'text-[9px]')}>إجمالي الطلبات</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-2 border-t border-slate-700/50 shrink-0 space-y-1">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-slate-500 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all"
        >
          {collapsed ? (
            <ChevronLeft size={18} />
          ) : (
            <>
              <ChevronRight size={18} />
              <span className="text-xs font-medium">طي الشريط</span>
            </>
          )}
        </button>
        <button
          onClick={() => { logout(); onCloseMobile?.(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span className="text-xs font-medium">تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  );
}
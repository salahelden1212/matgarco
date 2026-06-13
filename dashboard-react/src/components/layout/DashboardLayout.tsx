import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { orderAPI } from '../../lib/api';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionKey } from '../../lib/permissions';
import { NotificationBell } from '../NotificationPanel';
import { AIAssistant } from '../AIAssistant';
import SearchBar from '../SearchBar';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  BarChart2,
  LogOut,
  Menu,
  X,
  UserRound,
  Palette,
  Wallet,
  Megaphone,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { can, isOwner } = usePermissions();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  // Fetch pending orders count for badge
  const { data: pendingData } = useQuery({
    queryKey: ['orders-pending-count'],
    queryFn: () => orderAPI.getAll({ status: 'pending', limit: 1 }),
    refetchInterval: 60000, // refresh every 60s
  });
  const pendingCount: number = pendingData?.data?.data?.pagination?.total || 0;

  interface MenuItem {
    name: string;
    path: string;
    icon: React.ElementType;
    badge: number;
    permission?: PermissionKey;
    ownerOnly?: boolean;
    section?: string;
  }

  const allMenuItems: MenuItem[] = [
    { name: 'لوحة التحكم', path: '/dashboard', icon: LayoutDashboard, badge: 0, section: 'main' },
    { name: 'المنتجات', path: '/dashboard/products', icon: Package, badge: 0, permission: 'products.view', section: 'main' },
    { name: 'الطلبات', path: '/dashboard/orders', icon: ShoppingCart, badge: pendingCount, permission: 'orders.view', section: 'main' },
    { name: 'العملاء', path: '/dashboard/customers', icon: Users, badge: 0, permission: 'customers.view', section: 'main' },
    { name: 'التسويق', path: '/dashboard/marketing', icon: Megaphone, badge: 0, section: 'main' },
    { name: 'التقييمات', path: '/dashboard/reviews', icon: Star, badge: 0, section: 'main' },
    { name: 'التقارير', path: '/dashboard/reports', icon: BarChart2, badge: 0, permission: 'reports.view', section: 'main' },
    { name: 'تصميم المتجر', path: '/dashboard/store-design', icon: Palette, badge: 0, section: 'store' },
    { name: 'الماليات', path: '/dashboard/finance', icon: Wallet, badge: 0, section: 'store' },
    { name: 'الاشتراك', path: '/dashboard/subscription', icon: BarChart2, badge: 0, section: 'store' },
    { name: 'الإعدادات', path: '/dashboard/settings', icon: Settings, badge: 0, permission: 'settings.view', section: 'settings' },
    { name: 'الموظفون', path: '/dashboard/staff', icon: UserRound, badge: 0, permission: 'staff.view' as PermissionKey, section: 'settings' },
  ];

  const menuItems = allMenuItems.filter((item) => {
    if (item.ownerOnly) return isOwner;
    if (!item.permission) return true;
    return can(item.permission);
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Sidebar for Desktop */}
      <aside className={`hidden lg:fixed lg:inset-y-0 lg:right-0 lg:flex lg:flex-col bg-slate-900 text-slate-300 border-l border-slate-800 transition-all duration-300 ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}>
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto overflow-x-hidden">
          {/* Logo & Toggle Header */}
          <div className={`flex items-center px-6 transition-all duration-300 justify-between ${sidebarCollapsed ? 'px-2 flex-col gap-4' : ''}`}>
            <div className="flex items-center justify-center flex-1">
              <img 
                src="/logo.png" 
                alt="Matgarco" 
                className={`object-contain transition-all duration-300 ${sidebarCollapsed ? 'h-15 w-15' : 'h-30 w-auto'}`} 
              />
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title={sidebarCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* User Info */}
          <div className={`mt-8 px-6 transition-all duration-300 ${sidebarCollapsed ? 'px-2 flex justify-center' : ''}`}>
            <div className={`flex items-center p-3 rounded-2xl bg-slate-800/40 border border-slate-800/60 transition-all duration-300 ${sidebarCollapsed ? 'bg-transparent border-transparent p-0' : ''}`}>
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-sm">
                  <span className="text-indigo-400 font-bold text-sm">
                    {user?.firstName[0]}{user?.lastName[0]}
                  </span>
                </div>
              </div>
              {!sidebarCollapsed && (
                <div className="mr-3 transition-all duration-300">
                  <p className="text-sm font-bold text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-slate-500 truncate max-w-[130px]">{user?.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-6 flex-1 px-4">
            {(() => {
              let currentSection = '';
              const sectionLabels: Record<string, string> = {
                main: '',
                store: 'المتجر',
                settings: 'النظام',
              };

              return menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.path === '/dashboard'
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);
                
                const showSectionHeader = item.section && item.section !== currentSection;
                if (item.section) currentSection = item.section;

                return (
                  <div key={item.path}>
                    {showSectionHeader && (
                      !sidebarCollapsed ? (
                        sectionLabels[item.section!] && (
                          <p className="px-4 pt-4 pb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider transition-all">
                            {sectionLabels[item.section!]}
                          </p>
                        )
                      ) : (
                        <div className="my-3 border-t border-slate-800 mx-2" />
                      )
                    )}
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-2.5 text-sm font-bold rounded-xl transition mb-0.5 group relative ${
                        isActive
                          ? 'bg-indigo-600/15 text-indigo-400 shadow-sm'
                          : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                      } ${sidebarCollapsed ? 'justify-center' : ''}`}
                    >
                      <Icon className={`h-5 w-5 flex-shrink-0 transition-all ${sidebarCollapsed ? 'ml-0' : 'ml-3'} ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      {!sidebarCollapsed && <span className="flex-1 whitespace-nowrap">{item.name}</span>}
                      
                      {item.badge > 0 && (
                        sidebarCollapsed ? (
                          <span className="absolute top-1 right-2 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                            {item.badge > 9 ? '!' : item.badge}
                          </span>
                        ) : (
                          <span className="mr-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )
                      )}

                      {/* Tooltip if collapsed */}
                      {sidebarCollapsed && (
                        <div className="absolute right-full mr-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-md z-50">
                          {item.name}
                        </div>
                      )}
                    </Link>
                  </div>
                );
              });
            })()}
          </nav>

          {/* Logout */}
          <div className="px-4 pb-4">
            <button
              onClick={handleLogout}
              className={`flex items-center w-full px-4 py-3 text-sm font-bold text-slate-400 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition relative group ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <LogOut className={`h-5 w-5 flex-shrink-0 ${sidebarCollapsed ? 'ml-0' : 'ml-3'}`} />
              {!sidebarCollapsed && <span>تسجيل الخروج</span>}
              {sidebarCollapsed && (
                <div className="absolute right-full mr-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-md z-50">
                  تسجيل الخروج
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-650 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          
          <div className="fixed inset-y-0 right-0 flex flex-col w-64 bg-slate-900 border-l border-slate-800 text-slate-300">
            <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800">
              <div className="flex items-center justify-center flex-1">
                <img src="/logo.png" alt="Matgarco" className="h-14 w-auto object-contain" />
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition">
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 px-4 mt-4">
              {(() => {
                let currentSection = '';
                const sectionLabels: Record<string, string> = {
                  main: '',
                  store: 'المتجر',
                  settings: 'النظام',
                };

                return menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.path === '/dashboard'
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path);
                  
                  const showSectionHeader = item.section && item.section !== currentSection;
                  if (item.section) currentSection = item.section;

                  return (
                    <div key={item.path}>
                      {showSectionHeader && sectionLabels[item.section!] && (
                        <p className="px-4 pt-4 pb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {sectionLabels[item.section!]}
                        </p>
                      )}
                      <Link
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center px-4 py-2.5 text-sm font-bold rounded-xl transition mb-0.5 ${
                          isActive
                            ? 'bg-indigo-600/15 text-indigo-400'
                            : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                        }`}
                      >
                        <Icon className="ml-3 h-5 w-5 flex-shrink-0" />
                        <span className="flex-1">{item.name}</span>
                        {item.badge > 0 && (
                          <span className="mr-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </Link>
                    </div>
                  );
                });
              })()}
            </nav>

            <div className="px-4 pb-4">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-sm font-bold text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition"
              >
                <LogOut className="ml-3 h-5 w-5" />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:mr-20' : 'lg:mr-64'}`}>
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Search bar */}
              <SearchBar />

              {/* Notifications */}
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}

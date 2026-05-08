import { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, Settings, ChevronDown, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

export function Topbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { user } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className={cn(
      'h-[68px] bg-white/80 backdrop-blur-xl border-b border-slate-200/80',
      'flex items-center justify-between px-6',
      'sticky top-0 z-40',
      'transition-all duration-300'
    )}>
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
          aria-label="القائمة"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div className={cn(
          'relative flex-1 max-w-xl transition-all duration-300',
          searchFocused && 'max-w-2xl'
        )}>
          <Search size={16} className={cn(
            'absolute top-1/2 -translate-y-1/2 text-slate-400 transition-all',
            searchFocused ? 'right-4' : 'right-4'
          )} />
          <input
            type="text"
            placeholder="ابحث في المنصة... (⌘K)"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={cn(
              'w-full px-4 py-2.5 pr-10 bg-slate-50/80 border rounded-xl text-sm transition-all outline-none',
              'placeholder:text-slate-400',
              searchFocused
                ? 'border-indigo-300 bg-white ring-2 ring-indigo-500/20'
                : 'border-slate-200 hover:border-slate-300 focus:border-indigo-300 focus:bg-white'
            )}
            dir="rtl"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-500 rounded border border-slate-200">⌘K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="الإشعارات"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>

          {showNotif && (
            <div className={cn(
              'absolute left-0 top-full mt-2 w-80',
              'bg-white rounded-2xl border border-slate-200 shadow-2xl',
              'overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200'
            )}>
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="font-bold text-slate-900 text-sm">الإشعارات</span>
                <button className="text-xs text-indigo-600 font-bold hover:text-indigo-700">قراءة الكل</button>
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                <div className="py-8 text-center text-sm text-slate-400">
                  <Bell size={32} className="mx-auto mb-2 opacity-30" />
                  <p>لا توجد إشعارات جديدة</p>
                </div>
              </div>
              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                <button className="w-full text-center text-sm text-indigo-600 font-bold hover:text-indigo-700">
                  عرض كل الإشعارات
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200 mx-1"></div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-slate-900 leading-tight">{user?.name || 'مدير المنصة'}</div>
              <div className="text-[10px] text-slate-500 leading-tight">مدير النظام</div>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <User size={18} />
            </div>
          </button>

          {showUserMenu && (
            <div className={cn(
              'absolute left-0 top-full mt-2 w-64',
              'bg-white rounded-2xl border border-slate-200 shadow-2xl',
              'overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200'
            )}>
              <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{user?.name || 'مدير المنصة'}</div>
                    <div className="text-xs text-slate-500">{user?.email}</div>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
                  <Settings size={16} className="text-slate-400" />
                  الإعدادات
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
                  <User size={16} className="text-slate-400" />
                  الملف الشخصي
                </button>
                <div className="my-1 border-t border-slate-100"></div>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                  تسجيل الخروج
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, BookOpen, Settings, Bell, Search, Leaf, LogOut, Sprout, Activity, ChevronLeft, ChevronRight, User, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const ALL_NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, translationKey: 'admin.layout.platformOverview', end: true, allowedRoles: ['admin', 'researcher'] },
  { to: '/admin/seed-intelligence', icon: Sprout, translationKey: 'admin.layout.seedIntelligence', allowedRoles: ['admin', 'researcher'] },
  { to: '/admin/disease-intelligence', icon: Activity, translationKey: 'admin.layout.diseaseIntelligence', allowedRoles: ['admin', 'researcher'] },
  { to: '/admin/knowledge-base', icon: BookOpen, translationKey: 'admin.layout.knowledgeBase', allowedRoles: ['admin', 'researcher'] },
  { to: '/admin/management', icon: Settings, translationKey: 'admin.layout.systemManagement', allowedRoles: ['admin', 'researcher'] },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const role = user?.role || 'admin';
  const navItems = ALL_NAV_ITEMS.filter(item => item.allowedRoles.includes(role));
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ur' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ur' ? 'rtl' : 'ltr';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if(searchQuery.trim()) {
      alert(t('admin.layout.searchAlert', { query: searchQuery }).replace('{query}', searchQuery));
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-mesh">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 rtl:right-0 rtl:left-auto bg-white/80 backdrop-blur-2xl border-r rtl:border-l rtl:border-r-0 border-slate-200 shadow-glass-heavy hidden md:flex md:flex-col z-20 transition-all duration-300 overflow-hidden ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
        <div className={`h-16 flex items-center border-b border-slate-200 flex-shrink-0 ${isSidebarCollapsed ? 'justify-center' : 'px-6'}`}>
          <Leaf className={`w-6 h-6 text-emerald-600 flex-shrink-0 ${isSidebarCollapsed ? '' : 'mx-2'}`} />
          {!isSidebarCollapsed && (
            <span className="text-xl font-black text-slate-900 tracking-tight whitespace-nowrap truncate">
              {role === 'researcher' ? t('admin.layout.researcherTitle') : t('admin.layout.adminTitle')}
            </span>
          )}
        </div>
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center py-4 text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-700 border-r-4 rtl:border-l-4 rtl:border-r-0 border-emerald-500 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-500/5 hover:text-slate-900 border-r-4 rtl:border-l-4 rtl:border-r-0 border-transparent'
                } ${isSidebarCollapsed ? 'justify-center px-0' : 'pl-8 pr-4 rtl:pr-8 rtl:pl-4'}`
              }
              title={isSidebarCollapsed ? t(item.translationKey) : ''}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mx-3'} ${
                      isActive ? 'text-green-600' : 'text-gray-400'
                    }`}
                  />
                  {!isSidebarCollapsed && t(item.translationKey)}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`flex items-center w-full px-2 py-2.5 text-sm font-medium rounded-lg text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none ${isSidebarCollapsed ? 'justify-center' : ''}`}
            title={isSidebarCollapsed ? t('admin.layout.expandSidebar') : t('admin.layout.collapse')}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <><ChevronLeft className="w-5 h-5 mx-3" /> {t('admin.layout.collapse')}</>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex flex-col min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'md:pl-20 rtl:md:pr-20 rtl:md:pl-0' : 'md:pl-72 rtl:md:pr-72 rtl:md:pl-0'}`}>
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm transition-all duration-300">
          <div className="flex-1 flex items-center">
            <form onSubmit={handleSearch} className="max-w-md w-full lg:max-w-xs relative bg-white/60 backdrop-blur-md border border-slate-200 rounded-xl">
              <div className="absolute inset-y-0 left-0 rtl:right-0 rtl:left-auto px-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full px-10 py-2 border-transparent bg-transparent rounded-xl leading-5 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:text-sm transition-colors" 
                placeholder={t('admin.layout.searchPlaceholder')}
                type="search" 
              />
            </form>
          </div>
          <div className="ml-4 flex items-center md:ml-6 space-x-4">
            <button
              onClick={toggleLanguage}
              className="bg-white p-1.5 rounded-full text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors cursor-pointer flex items-center justify-center border border-gray-100 shadow-sm"
              title="Change Language"
            >
              <Globe className="h-5 w-5" />
            </button>
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors cursor-pointer"
              >
                <Bell className="h-6 w-6" />
              </button>

              {showNotifications && (
                <div className="origin-top-right absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-72 rounded-xl shadow-xl py-1 bg-white border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-gray-900">{t('admin.layout.notifications')}</h3>
                  </div>
                  <div className="p-6 text-center">
                    <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">{t('admin.layout.noNotifications')}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors cursor-pointer"
              >
                <img
                  className="h-8 w-8 rounded-full object-cover border border-gray-200"
                  src={`https://ui-avatars.com/api/?name=${(user?.name || 'Admin User').replace(/\(.*?\)/g, '').replace(/[^a-zA-Z ]/g, '').trim().replace(/ +/g, '+')}&background=16a34a&color=fff`}
                  alt="User avatar"
                />
              </button>

              {showProfileMenu && (
                <div className="origin-top-right absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-48 rounded-xl shadow-xl py-1 bg-white border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-sm font-medium text-gray-900">{user?.name === 'System Admin' ? t('admin.layout.systemAdmin', 'System Admin') : (user?.name || t('admin.layout.adminUser', 'Admin User'))}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role === 'admin' ? t('admin.layout.administrator', 'Administrator') : (t(`admin.management.roles.${user?.role?.toLowerCase()}`) || user?.role || t('admin.layout.administrator', 'Administrator'))}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/admin/profile');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center cursor-pointer"
                  >
                    <User className="w-4 h-4 mx-2" /> {t('admin.layout.viewProfile')}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mx-2" /> {t('admin.layout.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-8 pt-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, BookOpen, Settings, Bell, Search, Leaf, LogOut, Bean, ScanSearch, ChevronLeft, ChevronRight, ChevronDown, User, Globe, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext';
import FloatingAgent from '../components/FloatingAgent';
import Logo from '../components/Logo';

const ALL_NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, translationKey: 'admin.layout.platformOverview', end: true, allowedRoles: ['admin', 'researcher'] },
  { to: '/admin/seed-intelligence', icon: Bean, translationKey: 'admin.layout.seedIntelligence', allowedRoles: ['admin', 'researcher'] },
  { to: '/admin/disease-intelligence', icon: ScanSearch, translationKey: 'admin.layout.diseaseIntelligence', allowedRoles: ['admin', 'researcher'] },
  { to: '/admin/knowledge-base', icon: BookOpen, translationKey: 'admin.layout.knowledgeBase', allowedRoles: ['admin', 'researcher'] },
  { to: '/admin/management', icon: Settings, translationKey: 'admin.layout.systemManagement', allowedRoles: ['admin', 'researcher'] },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const role = user?.role || 'admin';
  const navItems = ALL_NAV_ITEMS.filter(item => item.allowedRoles.includes(role));
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const languageRef = useRef(null);
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const mainContentRef = useRef(null);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setShowLanguageMenu(false);
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

  const handleLanguageChange = (newLang) => {
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ur' ? 'rtl' : 'ltr';
    localStorage.setItem('preferredLanguage', newLang);
    setShowLanguageMenu(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if(searchQuery.trim()) {
      showToast(t('admin.layout.searchAlert', { query: searchQuery }).replace('{query}', searchQuery), '', 'info');
      setSearchQuery('');
    }
  };

  return (
    <div className="h-screen bg-sand text-charcoal overflow-hidden">
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 rtl:right-0 rtl:left-auto bg-white border-r rtl:border-l rtl:border-r-0 border-earth shadow-none flex flex-col z-50 transition-all duration-300 overflow-hidden 
        ${isMobileMenuOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'} 
        md:ltr:translate-x-0 md:rtl:translate-x-0
        ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'} w-64`}
      >
        <div className={`h-16 flex items-center border-b border-earth flex-shrink-0 ${isSidebarCollapsed ? 'justify-center' : 'px-6'}`}>
          <Logo className={`w-7 h-7 flex-shrink-0 ${isSidebarCollapsed ? '' : 'mx-2'}`} iconColor="#07571C" sparkleColor="#07571C" />
          {!isSidebarCollapsed && (
            <div className="flex flex-col ml-1 rtl:ml-0 rtl:mr-1">
              <span className="text-xl font-bold font-serif tracking-tight whitespace-nowrap" dir="ltr">
                <span className="text-[#1D2B15]">Peanut</span><span className="text-[#07571C]">IQ</span>
              </span>
              <span className="text-[10px] text-[#07571C] font-bold uppercase tracking-wider -mt-1 opacity-80 text-left rtl:text-right whitespace-nowrap">
                {role === 'researcher' ? t('admin.management.roles.researcher', 'Researcher Portal') : t('admin.management.roles.admin', 'Admin Portal')}
              </span>
            </div>
          )}
        </div>
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center whitespace-nowrap py-4 text-sm font-bold transition-all duration-300 group ${
                  isActive
                    ? 'bg-forest text-white border-r-4 rtl:border-l-4 rtl:border-r-0 border-forest shadow-md'
                    : 'text-charcoal opacity-80 hover:bg-forest/10 hover:text-forest hover:opacity-100 border-r-4 rtl:border-l-4 rtl:border-r-0 border-transparent'
                } ${isSidebarCollapsed ? 'justify-center px-0' : 'pl-8 pr-4 rtl:pr-8 rtl:pl-4'}`
              }
              title={isSidebarCollapsed ? t(item.translationKey) : ''}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-5 h-5 flex-shrink-0 ${isSidebarCollapsed ? '' : 'mx-3'} ${
                      isActive ? 'text-white stroke-2' : 'text-charcoal opacity-70 stroke-2 group-hover:text-forest group-hover:opacity-100'
                    }`}
                  />
                  {!isSidebarCollapsed && t(item.translationKey)}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-earth space-y-2 hidden md:block">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`flex items-center w-full px-2 py-2.5 text-sm font-bold rounded-lg text-charcoal opacity-70 hover:bg-forest/10 hover:opacity-100 transition-colors focus:outline-none ${isSidebarCollapsed ? 'justify-center' : ''}`}
            title={isSidebarCollapsed ? t('layout.sidebar.expand') : t('layout.sidebar.collapse')}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-5 h-5 rtl:rotate-180" /> : <><ChevronLeft className="w-5 h-5 me-3 rtl:rotate-180" /> {t('layout.sidebar.collapse')}</>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main ref={mainContentRef} className={`flex flex-col h-screen transition-all duration-300 md:ltr:pl-0 md:rtl:pr-0 ${isSidebarCollapsed ? 'md:ltr:pl-20 md:rtl:pr-20' : 'md:ltr:pl-64 md:rtl:pr-64'}`}>
        {/* Header */}
        <header className="h-16 flex-shrink-0 bg-white border-b border-earth flex items-center justify-between px-4 md:px-6 z-30 transition-all duration-300 shadow-none">
          
          <div className="flex items-center gap-2 md:hidden">
            <button 
              className="p-2 -ml-2 text-charcoal hover:bg-forest/10 rounded-lg cursor-pointer rtl:-mr-2 rtl:ml-0"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <Logo className="w-6 h-6 flex-shrink-0" iconColor="#07571C" sparkleColor="#07571C" />
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden sm:block md:ml-0 ml-4">
            <form onSubmit={handleSearch} className="max-w-md w-full lg:max-w-xs relative bg-sand shadow-sm border border-earth rounded-xl">
              <div className="absolute inset-y-0 left-0 rtl:right-0 rtl:left-auto px-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-charcoal opacity-50" />
              </div>
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full px-10 py-2 border-transparent bg-transparent rounded-xl leading-5 text-charcoal placeholder-charcoal/50 focus:outline-none focus:ring-1 focus:ring-forest sm:text-sm transition-colors" 
                placeholder={t('admin.layout.searchPlaceholder')}
                type="search" 
              />
            </form>
          </div>
          <div className="ml-4 flex items-center md:ml-6 space-x-4">
            <div className="relative" ref={languageRef}>
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className={`flex items-center gap- bg-white p-2 rounded-full transition-colors focus:outline-none cursor-pointer border-2 shadow-none ${showLanguageMenu ? "bg-green-50 text-forest opacity-100 border-green-50" : "text-charcoal opacity-70 border-earth hover:text-forest hover:opacity-100 hover:bg-forest/10"}`}
                title="Change Language"
              >
                <Globe className="h-5 w-5" />
                <span className="text-sm font-medium">{i18n.language === 'ur' ? 'Urdu' : 'English'}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {showLanguageMenu && (
                <div className="origin-top-right rtl:origin-top-left absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-32 rounded-xl shadow-none py-1 bg-white border-2 border-earth overflow-hidden z-50">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className="w-full text-start px-4 py-2 text-sm font-bold text-charcoal hover:bg-forest/10 hover:text-forest flex items-center cursor-pointer transition-colors"
                  >
                    English
                  </button>
                  <button
                    onClick={() => handleLanguageChange('ur')}
                    className="w-full text-start px-4 py-2 text-sm font-bold text-charcoal hover:bg-forest/10 hover:text-forest flex items-center cursor-pointer transition-colors"
                  >
                    Urdu
                  </button>
                </div>
              )}
            </div>
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative bg-white p-2 rounded-full transition-colors focus:outline-none cursor-pointer ${showNotifications ? "bg-green-50 text-forest opacity-100" : "text-charcoal opacity-70 hover:text-forest hover:opacity-100 hover:bg-forest/10"}`}
              >
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 rtl:right-auto rtl:left-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">3</span>
              </button>

              {showNotifications && (
                <div className="origin-top-right absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-72 rounded-xl shadow-xl py-1 bg-white border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100 bg-sand flex justify-between items-center">
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
                className="flex items-center gap- text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest transition-colors cursor-pointer"
              >
                <img
                  className="h-8 w-8 rounded-full object-cover border-2 border-earth shadow-sm"
                  src={`https://ui-avatars.com/api/?name=${(user?.name || 'Admin User').replace(/\(.*?\)/g, '').replace(/[^a-zA-Z ]/g, '').trim().replace(/ +/g, '+')}&background=2D5A27&color=fff`}
                  alt="User avatar"
                />
                <ChevronDown className="h-4 w-4 text-charcoal opacity-70" />
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
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-forest/10 hover:text-forest flex items-center cursor-pointer transition-colors"
                  >
                    <User className="w-4 h-4 mx-2" /> {t('admin.layout.viewProfile')}
                  </button>
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-forest/10 hover:text-forest flex items-center cursor-pointer transition-colors"
                    >
                      <LogOut className="w-4 h-4 mx-2" /> {t('admin.layout.logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 md:pt-4">
          <Outlet />
        </div>
      </main>
      <FloatingAgent />
    </div>
  );
}

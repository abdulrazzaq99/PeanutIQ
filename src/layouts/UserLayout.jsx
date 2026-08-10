import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Leaf, User, BookOpen, Bean, ScanSearch, Bell, LogOut, ChevronLeft, ChevronRight, ChevronDown, MessageSquare, History, Globe, Search, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import FloatingAgent from '../components/FloatingAgent';
import Logo from '../components/Logo';

const navItems = [
  { to: '/user', icon: LayoutDashboard, labelKey: 'layout.nav.dashboard', end: true },
  { to: '/user/seed', icon: Bean, labelKey: 'layout.nav.seedIntelligence' },
  { to: '/user/disease', icon: ScanSearch, labelKey: 'layout.nav.diseaseIntelligence' },
  { to: '/user/history', icon: History, labelKey: 'layout.nav.history' },
  { to: '/user/knowledge-base', icon: BookOpen, labelKey: 'layout.nav.knowledgeBase' },
  { to: '/user/profile', icon: User, labelKey: 'layout.nav.profile' },
];

export default function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const languageRef = useRef(null);
  const mainContentRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
    setIsMobileMenuOpen(false); // Close mobile menu on route change
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
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

  return (
    <div className="h-screen bg-sand text-charcoal overflow-hidden relative">
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 rtl:left-auto rtl:right-0 bg-white border-e border-earth shadow-none flex flex-col z-50 print:hidden transition-all duration-300 overflow-hidden 
        ${isMobileMenuOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'} 
        md:ltr:translate-x-0 md:rtl:translate-x-0 
        ${isSidebarCollapsed ? 'md:w-20' : 'md:w-56'} w-64`}
      >
        <div className={`h-16 flex items-center border-b border-earth flex-shrink-0 ${isSidebarCollapsed ? 'justify-center' : 'px-6'}`}>
          <Logo className={`w-7 h-7 flex-shrink-0 ${isSidebarCollapsed ? '' : 'me-2'}`} iconColor="#07571C" sparkleColor="#07571C" />
          {!isSidebarCollapsed && (
            <span className="text-xl font-bold font-serif tracking-tight" dir="ltr">
              <span className="text-[#1D2B15]">Peanut</span><span className="text-[#07571C]">IQ</span>
            </span>
          )}
        </div>
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center whitespace-nowrap py-4 text-sm font-bold transition-all duration-300 group ${
                  isActive
                    ? 'bg-forest text-white border-e-4 border-forest shadow-md'
                    : 'text-charcoal opacity-80 hover:bg-forest/10 hover:text-forest hover:opacity-100 border-e-4 border-transparent'
                } ${isSidebarCollapsed ? 'justify-center px-0' : 'ps-8 pe-4'}`
              }
              title={isSidebarCollapsed ? t(item.labelKey) : ''}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-5 h-5 flex-shrink-0 ${isSidebarCollapsed ? '' : 'mx-3'} ${
                      isActive ? 'text-white stroke-2' : 'text-charcoal opacity-70 stroke-2 group-hover:text-forest group-hover:opacity-100'
                    }`}
                  />
                  {!isSidebarCollapsed && t(item.labelKey)}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-earth hidden md:block">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`flex items-center w-full py-4 text-sm font-bold transition-all duration-300 group text-charcoal opacity-80 hover:bg-forest/10 hover:text-forest hover:opacity-100 border-e-4 border-transparent focus:outline-none ${isSidebarCollapsed ? 'justify-center px-0' : 'ps-8 pe-4'}`}
            title={isSidebarCollapsed ? t('layout.sidebar.expand') : t('layout.sidebar.collapse')}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-5 h-5 flex-shrink-0 opacity-70 stroke-2 group-hover:opacity-100 rtl:rotate-180" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 flex-shrink-0 mx-3 opacity-70 stroke-2 group-hover:opacity-100 rtl:rotate-180" />
                {t('layout.sidebar.collapse')}
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex flex-col h-screen print:ps-0 transition-all duration-300  ${isSidebarCollapsed ? 'md:ps-20' : 'md:ps-56'}`}>
        {/* Header */}
        <header className="h-16 flex-shrink-0 bg-white border-b border-earth flex items-center justify-between px-4 md:px-6 z-30 print:hidden transition-all duration-300 shadow-none">
          
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
            <div className="relative">
              <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t('layout.header.search', 'Search anything...')}
                className="block w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border border-earth rounded-xl leading-5 bg-sand placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest sm:text-sm text-charcoal transition-colors shadow-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4 ms-auto">
            <div className="relative" ref={languageRef}>
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className={`flex items-center gap- p-2 rounded-full transition-colors focus:outline-none cursor-pointer ${showLanguageMenu ? "bg-green-50 text-forest opacity-100" : "text-charcoal opacity-70 hover:text-forest hover:opacity-100 hover:bg-forest/10"}`}
                title="Change Language"
              >
                <Globe className="h-5 w-5" />
                <span className="text-sm font-medium hidden sm:block">{i18n.language === 'ur' ? 'Urdu' : 'English'}</span>
                <ChevronDown className="h-4 w-4 hidden sm:block" />
              </button>

              {showLanguageMenu && (
                <div className="origin-top-right rtl:origin-top-left absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-32 rounded-xl shadow-none py-1 bg-white border-2 border-earth overflow-hidden z-50">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className="w-full text-start px-4 py-2 text-sm font-bold text-charcoal hover:bg-forest/10 hover:text-forest flex items-center cursor-pointer"
                  >
                    English
                  </button>
                  <button
                    onClick={() => handleLanguageChange('ur')}
                    className="w-full text-start px-4 py-2 text-sm font-bold text-charcoal hover:bg-forest/10 hover:text-forest flex items-center cursor-pointer"
                  >
                    Urdu
                  </button>
                </div>
              )}
            </div>
            <div className="relative" ref={notificationRef}>
              <button onClick={() => setShowNotifications(!showNotifications)} className={`p-2 rounded-full transition-colors focus:outline-none relative cursor-pointer ${showNotifications ? "bg-green-50 text-forest opacity-100" : "text-charcoal opacity-70 hover:text-forest hover:opacity-100 hover:bg-forest/10"}`}>
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 rtl:right-auto rtl:left-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">3</span>
              </button>

              {showNotifications && (
                <div className="origin-top-right rtl:origin-top-left fixed left-4 right-4 top-16 sm:absolute sm:top-auto sm:left-auto sm:right-0 rtl:sm:left-0 rtl:sm:right-auto mt-2 w-auto sm:w-80 rounded-xl shadow-none bg-white border-2 border-earth overflow-hidden z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-earth flex justify-between items-center bg-sand">
                      <p className="text-sm font-bold text-charcoal">{t('layout.header.notifications')}</p>
                      <span className="text-xs font-bold text-forest hover:text-terracotta cursor-pointer">{t('layout.header.markAllRead')}</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      <div className="px-4 py-3 border-b border-earth bg-sand hover:bg-forest/10 cursor-pointer transition-colors">
                        <p className="text-sm font-bold text-terracotta">{t('layout.notifications.heavyRainTitle', 'Heavy Rain Warning')}</p>
                        <p className="text-xs text-charcoal opacity-70 mt-1">{t('layout.notifications.heavyRainDesc', 'Meteorological data suggests heavy rainfall in your region over the next 48 hours.')}</p>
                        <p className="text-xs text-terracotta opacity-70 mt-2 font-bold">{t('layout.notifications.hoursAgo2', '2 hours ago')}</p>
                      </div>
                      <div className="px-4 py-3 hover:bg-forest/10 cursor-pointer transition-colors border-b border-earth">
                        <p className="text-sm font-bold text-charcoal">{t('layout.notifications.seedAnalysisTitle', 'Seed Analysis Complete')}</p>
                        <p className="text-xs text-charcoal opacity-70 mt-1">{t('layout.notifications.seedAnalysisDesc', 'Your recent BARI-2016 seed scan shows 92% viability.')}</p>
                        <p className="text-xs text-charcoal opacity-50 mt-2 font-bold">{t('layout.notifications.yesterday', 'Yesterday')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`flex items-center gap- p-1 rounded-full text-sm focus:outline-none transition-colors cursor-pointer ${showProfileMenu ? "bg-green-50 opacity-100" : "opacity-90 hover:opacity-100 hover:bg-forest/10"}`}
              >
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src={`https://ui-avatars.com/api/?name=${(user?.name || 'Farmer User').replace(/\(.*?\)/g, '').replace(/[^a-zA-Z ]/g, '').trim().replace(/ +/g, '+')}&background=2D5A27&color=fff`}
                  alt="User avatar"
                />
                <ChevronDown className="h-4 w-4 text-charcoal opacity-70" />
              </button>

              {showProfileMenu && (
                <div className="origin-top-right rtl:origin-top-left absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-48 rounded-xl shadow-none py-1 bg-white border-2 border-earth overflow-hidden z-50">
                  <NavLink
                    to="/user/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="px-4 py-2 text-sm font-bold text-charcoal hover:bg-forest/10 hover:text-forest flex items-center cursor-pointer transition-colors"
                  >
                    <User className="w-4 h-4 me-2" /> {t('layout.header.viewProfile')}
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm font-bold text-terracotta hover:bg-red-50 hover:text-red-700 flex items-center cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4 me-2" /> {t('layout.header.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div ref={mainContentRef} className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-8 md:pt-4">
          <Outlet />
        </div>
      </main>
      <FloatingAgent />
    </div>
  );
}

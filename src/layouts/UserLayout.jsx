import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Leaf, User, BookOpen, Sprout, Activity, Bell, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/user', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/user/seed', icon: Sprout, label: 'Seed Intelligence' },
  { to: '/user/disease', icon: Activity, label: 'Disease Intelligence' },
  { to: '/user/knowledge-base', icon: BookOpen, label: 'Knowledge Base' },
  { to: '/user/profile', icon: User, label: 'Profile' },
];

export default function UserLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
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

  return (
    <div className="min-h-screen bg-mesh">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-white/80 backdrop-blur-2xl border-r border-slate-200 shadow-glass-heavy hidden md:flex md:flex-col z-20 print:hidden transition-all duration-300 overflow-hidden ${isSidebarCollapsed ? 'w-20' : 'w-56'}`}>
        <div className={`h-16 flex items-center border-b border-slate-200 flex-shrink-0 ${isSidebarCollapsed ? 'justify-center' : 'px-6'}`}>
          <Leaf className={`w-6 h-6 text-emerald-600 ${isSidebarCollapsed ? '' : 'mr-2'}`} />
          {!isSidebarCollapsed && <span className="text-xl font-black text-slate-900 tracking-tight">PeanutIQ</span>}
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
                    ? 'bg-emerald-500/10 text-emerald-700 border-r-4 border-emerald-500 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-500/5 hover:text-slate-900 border-r-4 border-transparent'
                } ${isSidebarCollapsed ? 'justify-center px-0' : 'pl-8 pr-4'}`
              }
              title={isSidebarCollapsed ? item.label : ''}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'} ${
                      isActive ? 'text-green-600' : 'text-gray-400'
                    }`}
                  />
                  {!isSidebarCollapsed && item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`flex items-center w-full px-2 py-2.5 text-sm font-medium rounded-lg text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none ${isSidebarCollapsed ? 'justify-center' : ''}`}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse"}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <><ChevronLeft className="w-5 h-5 mr-3" /> Collapse</>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex flex-col min-h-screen print:pl-0 transition-all duration-300 ${isSidebarCollapsed ? 'md:pl-20' : 'md:pl-56'}`}>
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-end px-6 sticky top-0 z-10 print:hidden transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="relative" ref={notificationRef}>
              <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors focus:outline-none relative cursor-pointer">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
              </button>

              {showNotifications && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-xl shadow-xl bg-white border border-gray-100 overflow-hidden z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                      <p className="text-sm font-bold text-gray-900">Notifications</p>
                      <span className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">Mark all as read</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      <div className="px-4 py-3 border-b border-gray-50 bg-red-50 hover:bg-red-100 cursor-pointer transition-colors">
                        <p className="text-sm font-bold text-red-800">Heavy Rain Warning</p>
                        <p className="text-xs text-red-600 mt-1">Meteorological data suggests heavy rainfall in your region over the next 48 hours.</p>
                        <p className="text-xs text-red-400 mt-2 font-medium">2 hours ago</p>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50">
                        <p className="text-sm font-medium text-gray-900">Seed Analysis Complete</p>
                        <p className="text-xs text-gray-500 mt-1">Your recent BARI-2016 seed scan shows 92% viability.</p>
                        <p className="text-xs text-gray-400 mt-2 font-medium">Yesterday</p>
                      </div>
                    </div>
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
                  src="https://ui-avatars.com/api/?name=Farmer+User&background=16a34a&color=fff"
                  alt="User avatar"
                />
              </button>

              {showProfileMenu && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-xl py-1 bg-white border border-gray-100 overflow-hidden z-50">
                  <NavLink
                    to="/user/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center cursor-pointer"
                  >
                    <User className="w-4 h-4 mr-2" /> View Profile
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
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

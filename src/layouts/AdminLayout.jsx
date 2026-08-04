import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, BookOpen, Settings, Bell, Search, Leaf, LogOut, Sprout, Activity, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Platform Overview', end: true },
  { to: '/admin/seed-intelligence', icon: Sprout, label: 'Seed Intelligence' },
  { to: '/admin/disease-intelligence', icon: Activity, label: 'Disease Intelligence' },
  { to: '/admin/knowledge-base', icon: BookOpen, label: 'Knowledge Base' },
  { to: '/admin/management', icon: Settings, label: 'System Management' },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
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

  const handleSearch = (e) => {
    e.preventDefault();
    if(searchQuery.trim()) {
      alert(`Global search results for "${searchQuery}" are currently being indexed. The full search feature will be available in the upcoming data warehouse update.`);
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-mesh">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-white/80 backdrop-blur-2xl border-r border-slate-200 shadow-glass-heavy hidden md:flex md:flex-col z-20 transition-all duration-300 overflow-hidden ${isSidebarCollapsed ? 'w-20' : 'w-56'}`}>
        <div className={`h-16 flex items-center border-b border-slate-200 flex-shrink-0 ${isSidebarCollapsed ? 'justify-center' : 'px-6'}`}>
          <Leaf className={`w-6 h-6 text-emerald-600 ${isSidebarCollapsed ? '' : 'mr-2'}`} />
          {!isSidebarCollapsed && <span className="text-xl font-black text-slate-900 tracking-tight">PeanutIQ Admin</span>}
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
      <main className={`flex flex-col min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'md:pl-20' : 'md:pl-56'}`}>
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm transition-all duration-300">
          <div className="flex-1 flex items-center">
            <form onSubmit={handleSearch} className="max-w-md w-full lg:max-w-xs relative bg-white/60 backdrop-blur-md border border-slate-200 rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border-transparent bg-transparent rounded-xl leading-5 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:text-sm transition-colors" 
                placeholder="Search globally..." 
                type="search" 
              />
            </form>
          </div>
          <div className="ml-4 flex items-center md:ml-6 space-x-4">
            <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
              <Bell className="h-6 w-6" />
            </button>
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors cursor-pointer"
              >
                <img
                  className="h-8 w-8 rounded-full object-cover border border-gray-200"
                  src="https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff"
                  alt="User avatar"
                />
              </button>

              {showProfileMenu && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-xl py-1 bg-white border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-sm font-medium text-gray-900">Admin User</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      alert("Admin profile settings will be available soon.");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center cursor-pointer"
                  >
                    <User className="w-4 h-4 mr-2" /> View Profile
                  </button>
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

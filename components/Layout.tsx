import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, CalendarPlus, LogOut, Sparkles, LogIn, FlaskConical, UserCircle, Home } from 'lucide-react';
import { Patient } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
  userRole?: 'admin' | 'patient' | null;
  currentUser?: Patient | null;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, isAuthenticated = false, userRole, currentUser, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname.includes('admin');

  // Hide sidebar on Login page for cleaner look
  if (location.pathname === '/login') {
      return (
          <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
              <main className="flex-1 w-full flex items-center justify-center p-4">
                  {children}
              </main>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar / Navbar */}
      <aside className={`border-r md:w-72 flex-shrink-0 flex flex-col transition-colors duration-300 ${isDashboard ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
        <div className="p-8 flex items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <Sparkles className="w-6 h-6 text-white relative z-10" />
          </div>
          <div>
              <h1 className={`font-extrabold text-2xl tracking-tight flex items-center gap-1 ${isDashboard ? 'text-white' : 'text-slate-900'}`}>
                Randevu<span className="text-blue-600">Pro</span>
              </h1>
              <span className={`text-[10px] uppercase tracking-widest font-bold ${isDashboard ? 'text-slate-500' : 'text-blue-400'}`}>Profesyonel Sistem</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {/* Patient Menu Items */}
          {userRole !== 'admin' && (
            <>
               {isAuthenticated && userRole === 'patient' && (
                 <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-200 group ${
                      isActive 
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <UserCircle className={`w-5 h-5 transition-transform group-hover:scale-110`} />
                  <span className="font-semibold">Profilim</span>
                </NavLink>
               )}

              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-200 group ${
                    isActive 
                    ? 'bg-blue-50 text-blue-700 shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <CalendarPlus className={`w-5 h-5 transition-transform group-hover:scale-110`} />
                <span className="font-semibold">Randevu Al</span>
              </NavLink>

              <NavLink
                to="/labs"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-200 group ${
                    isActive 
                    ? 'bg-teal-50 text-teal-700 shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <FlaskConical className={`w-5 h-5 transition-transform group-hover:scale-110`} />
                <span className="font-semibold">Tahlil Analizi</span>
              </NavLink>
            </>
          )}

          {/* Admin Menu Items */}
          {(!isAuthenticated || userRole === 'admin') && (
             <NavLink
             to="/admin"
             className={({ isActive }) =>
               `flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-200 group ${
                 isActive 
                 ? (isDashboard ? 'bg-blue-600/10 text-blue-400' : 'bg-blue-50 text-blue-700 shadow-sm') 
                 : (isDashboard ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900')
               }`
             }
           >
             <LayoutDashboard className={`w-5 h-5 transition-transform group-hover:scale-110`} />
             <span className="font-semibold">Yönetim Paneli</span>
           </NavLink>
          )}
        </nav>

        <div className="p-6 border-t border-gray-100/10">
            {isAuthenticated && currentUser && (
                <div className="mb-4 px-2 flex items-center gap-3">
                    <img src={currentUser.image} alt="User" className="w-8 h-8 rounded-full border border-gray-200" />
                    <div className="overflow-hidden">
                        <p className={`text-sm font-bold truncate ${isDashboard ? 'text-white' : 'text-gray-800'}`}>{currentUser.name}</p>
                        <p className={`text-xs truncate ${isDashboard ? 'text-gray-500' : 'text-gray-400'}`}>Hasta</p>
                    </div>
                </div>
            )}

            <div className={`p-4 rounded-2xl mb-4 ${isDashboard ? 'bg-slate-800' : 'bg-blue-50'}`}>
                <p className={`text-xs font-medium mb-1 ${isDashboard ? 'text-slate-400' : 'text-blue-600'}`}>Sistem Durumu</p>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <span className={`text-sm font-bold ${isDashboard ? 'text-white' : 'text-gray-800'}`}>Online</span>
                </div>
            </div>
            
            {isAuthenticated ? (
                <button 
                onClick={onLogout}
                className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-colors font-semibold ${isDashboard ? 'text-red-400 hover:text-white hover:bg-red-900/50' : 'text-gray-500 hover:bg-gray-100 hover:text-red-600'}`}
                >
                    <LogOut className="w-5 h-5" />
                    <span>Çıkış Yap</span>
                </button>
            ) : (
                <button 
                  onClick={() => navigate('/login')}
                  className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-colors font-semibold ${isDashboard ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-100 hover:text-blue-600'}`}
                >
                    <LogIn className="w-5 h-5" />
                    <span>Giriş Yap</span>
                </button>
            )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto w-full">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
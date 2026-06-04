import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, Menu, X, LogOut, Bell, User as UserIcon } from 'lucide-react';
import { AppContext } from '../context/AppContext';

export const Header = () => {
  const { state, logout } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Find Match', path: '/matcher' },
    { label: 'Date Planner', path: '/date-planner' },
    { label: 'Proposal', path: '/proposal' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="bg-brand-50 p-2 rounded-lg">
              <Heart className="fill-brand-500 text-brand-500 w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 hidden sm:block">Cupid 4.0</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-brand-50 text-brand-700' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
             <button className="text-slate-400 hover:text-slate-600 transition-colors">
               <Bell size={20} />
             </button>
             <div className="h-6 w-px bg-slate-200"></div>
             <div className="flex items-center gap-3 min-w-0">
               <div className="text-right hidden lg:block min-w-0">
                 <p className="text-sm font-bold text-slate-700 leading-none truncate max-w-[150px]">{state.user?.name}</p>
                 <p className="text-xs text-slate-500 truncate mt-1">{state.user?.level}</p>
               </div>
               <div className="relative group">
                 <img 
                   src={state.user?.avatarUrl} 
                   className="w-10 h-10 rounded-full bg-slate-200 object-cover cursor-pointer ring-2 ring-white shadow-sm hover:ring-brand-200 transition-all"
                   alt="Profile"
                 />
                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 hidden group-hover:block animate-fade-in origin-top-right">
                   <div className="px-4 py-2 border-b border-slate-50 lg:hidden">
                      <p className="text-sm font-bold text-slate-900">{state.user?.name}</p>
                   </div>
                   <button 
                     onClick={() => navigate('/profile')}
                     className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 w-full text-left transition-colors"
                   >
                      <UserIcon size={16} /> Profile
                   </button>
                   <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors">
                     <LogOut size={16} /> Sign Out
                   </button>
                 </div>
               </div>
             </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 absolute w-full left-0 shadow-lg animate-fade-in z-50">
          <div className="p-4 bg-slate-50 flex items-center gap-3 border-b border-slate-100 min-w-0">
             <img src={state.user?.avatarUrl} className="w-10 h-10 rounded-full flex-shrink-0" />
             <div className="min-w-0 flex-1">
               <p className="font-bold text-slate-900 truncate">{state.user?.name}</p>
               <p className="text-xs text-slate-500 truncate">{state.user?.email}</p>
             </div>
          </div>
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  location.pathname === item.path 
                    ? 'bg-brand-50 text-brand-700' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button 
               onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}
               className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium text-slate-600 hover:bg-slate-50"
            >
               Edit Profile
            </button>
            <div className="h-px bg-slate-100 my-2"></div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-3 text-red-600 w-full font-medium hover:bg-red-50 rounded-lg">
               <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
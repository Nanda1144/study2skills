
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Map, FileText, Mic, MessageSquare, TrendingUp, X, 
  UserCircle, Briefcase, BookOpen, LogOut, Trophy, 
  LogIn, Sun, Moon, ShieldCheck, Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Sidebar: React.FC<{ isOpen: boolean; toggle: () => void }> = ({ isOpen, toggle }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isGuest = user?.role === 'guest';
  const isAdmin = user?.role === 'admin';

  const isLight = theme === 'light';

  const links = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/leaderboard', icon: <Trophy size={20} />, label: 'Leaderboard' },
    { to: '/profile', icon: <UserCircle size={20} />, label: 'Profile' },
    { to: '/roadmap', icon: <Map size={20} />, label: 'Roadmap' },
    { to: '/courses', icon: <BookOpen size={20} />, label: 'Courses' },
    { to: '/jobs', icon: <Briefcase size={20} />, label: 'Jobs Hub' },
    { to: '/resume', icon: <FileText size={20} />, label: 'Resume AI' },
    { to: '/interview', icon: <Mic size={20} />, label: 'Interviews' },
    { to: '/insights', icon: <TrendingUp size={20} />, label: 'Insights' },
    { to: '/mentor', icon: <MessageSquare size={20} />, label: 'Assistant' },
  ];

  if (isAdmin) {
    links.push({ to: '/admin', icon: <ShieldCheck size={20} />, label: 'Admin Command' });
  }

  return (
    <>
      {/* Overlay for Mobile & Tablet */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={toggle} 
      />
      
      {/* Sidebar - Animates from left to right */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'} border-r transform transition-transform duration-500 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shadow-2xl`}>
        <div className={`h-20 flex items-center justify-between px-8 border-b ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-slate-800 bg-slate-950/50'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold shadow-lg shadow-indigo-600/20 cursor-pointer text-white" onClick={() => navigate('/dashboard')}>S</div>
            <span className={`text-xl font-black tracking-tighter cursor-pointer ${isLight ? 'text-slate-900' : 'text-white'}`} onClick={() => navigate('/dashboard')}>study2skills</span>
          </div>
          <button onClick={toggle} className={`lg:hidden p-2 ${isLight ? 'text-slate-400 hover:text-slate-900' : 'text-slate-400 hover:text-white'} transition-colors`}>
            <X size={24} />
          </button>
        </div>

        <nav className="p-6 space-y-1.5 overflow-y-auto flex-1 custom-scrollbar">
          <button onClick={() => { navigate('/'); toggle(); }} className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all group ${isLight ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} mb-4`}>
            <Home size={20} className="group-hover:scale-110 transition-transform" /> 
            <span className="text-sm font-bold uppercase tracking-widest">Home Portal</span>
          </button>
          
          <div className={`text-[10px] font-black uppercase tracking-[0.3em] px-4 mb-2 ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>Command Center</div>
          
          {links.map(l => (
            <NavLink 
              key={l.to} 
              to={l.to} 
              onClick={() => window.innerWidth < 1024 && toggle()} 
              className={({ isActive }) => `flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 translate-x-1' : isLight ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}
            >
              <span className="flex-shrink-0">{l.icon}</span>
              <span className="text-sm font-bold tracking-tight">{l.label}</span>
            </NavLink>
          ))}
        </nav>

        {!isGuest && user && (
          <div className={`px-8 py-8 border-t ${isLight ? 'border-slate-100 bg-slate-50/40' : 'border-slate-800 bg-slate-950/40'}`}>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
              <span className={isLight ? 'text-slate-400' : 'text-slate-500'}>Tier {user?.gamification?.level || 1}</span>
              <span className="text-indigo-400">{user.gamification.xp} XP</span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden border ${isLight ? 'bg-slate-200 border-slate-300' : 'bg-slate-800 border-slate-700'}`}>
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: '45%' }}></div>
            </div>
          </div>
        )}

        <div className={`p-6 border-t ${isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900'} space-y-3`}>
          <button 
            onClick={toggleTheme} 
            className={`flex items-center space-x-4 px-4 py-3 rounded-2xl w-full transition-all duration-300 ${
              isLight 
              ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' 
              : 'text-slate-500 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            <span className="text-sm font-bold">{theme === 'dark' ? 'Light' : 'Dark'} Visuals</span>
          </button>
          
          {isGuest ? (
            <button onClick={() => navigate('/auth')} className={`flex items-center space-x-4 px-4 py-4 rounded-2xl w-full font-black text-xs uppercase tracking-widest transition-all ${isLight ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10'}`}>
              <LogIn size={20} /><span>Verify Identity</span>
            </button>
          ) : (
            <button onClick={() => { logout(); navigate('/'); }} className={`flex items-center space-x-4 px-4 py-4 rounded-2xl w-full font-black text-xs uppercase tracking-widest transition-all ${isLight ? 'text-rose-600 bg-rose-50 hover:bg-rose-100' : 'text-rose-400 bg-rose-500/5 hover:bg-rose-500/10'}`}>
              <LogOut size={20} /><span>Detach Session</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;

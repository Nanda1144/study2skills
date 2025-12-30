
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, NavLink } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Roadmap from './pages/Roadmap';
import Resume from './pages/Resume';
import Interview from './pages/Interview';
import Insights from './pages/Insights';
import Assistant from './pages/Assistant';
import Courses from './pages/Courses';
import Jobs from './pages/Jobs';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import AdminDashboard from './pages/AdminDashboard';
import { Menu, Home, BookOpen, Briefcase, UserCircle, Map } from 'lucide-react';

const MobileNav: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  if (!user) return null;

  const isLight = theme === 'light';

  return (
    <div className={`lg:hidden fixed bottom-0 left-0 right-0 ${isLight ? 'bg-white/90 border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]' : 'bg-slate-950/90 border-slate-800/50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]'} backdrop-blur-xl border-t h-[5rem] flex items-center justify-around px-2 z-[100] safe-bottom transition-colors duration-300`}>
      <NavLink to="/dashboard" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-indigo-600 scale-110' : isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300'}`}>
        {({ isActive }) => (
          <>
            <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-indigo-500/10 shadow-inner' : ''}`}><Home size={22} /></div>
            <span className="text-[8px] font-black uppercase tracking-widest">Home</span>
          </>
        )}
      </NavLink>
      <NavLink to="/roadmap" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-indigo-600 scale-110' : isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300'}`}>
        {({ isActive }) => (
          <>
            <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-indigo-500/10 shadow-inner' : ''}`}><Map size={22} /></div>
            <span className="text-[8px] font-black uppercase tracking-widest">Roadmap</span>
          </>
        )}
      </NavLink>
      <NavLink to="/courses" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-indigo-600 scale-110' : isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300'}`}>
        {({ isActive }) => (
          <>
            <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-indigo-500/10 shadow-inner' : ''}`}><BookOpen size={22} /></div>
            <span className="text-[8px] font-black uppercase tracking-widest">Courses</span>
          </>
        )}
      </NavLink>
      <NavLink to="/jobs" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-indigo-600 scale-110' : isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300'}`}>
        {({ isActive }) => (
          <>
            <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-indigo-500/10 shadow-inner' : ''}`}><Briefcase size={22} /></div>
            <span className="text-[8px] font-black uppercase tracking-widest">Jobs</span>
          </>
        )}
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-indigo-600 scale-110' : isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300'}`}>
        {({ isActive }) => (
          <>
            <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-indigo-500/10 shadow-inner' : ''}`}><UserCircle size={22} /></div>
            <span className="text-[8px] font-black uppercase tracking-widest">Profile</span>
          </>
        )}
      </NavLink>
    </div>
  );
};

const AppLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isLight = theme === 'light';

  useEffect(() => {
    const setHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    window.addEventListener('resize', setHeight);
    setHeight();
    return () => window.removeEventListener('resize', setHeight);
  }, []);

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${isLight ? 'bg-slate-50' : 'bg-slate-950'}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className={`font-black uppercase tracking-widest text-xs ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>study2skills Engine...</p>
      </div>
    </div>
  );
  
  const isPublicPage = location.pathname === '/' || location.pathname === '/auth';
  const showSidebar = user !== null && !isPublicPage;

  return (
    <div className={`flex min-h-screen flex-col overflow-x-hidden transition-colors duration-500 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      <div className="flex flex-1 relative">
        {showSidebar && <Sidebar isOpen={isSidebarOpen} toggle={() => setSidebarOpen(!isSidebarOpen)} />}
        
        <div className={`flex-1 flex flex-col w-full transition-all duration-500 ${showSidebar ? 'lg:ml-72' : ''}`}>
          {showSidebar && (
            <header className={`h-20 border-b flex items-center justify-between px-6 lg:hidden sticky top-0 backdrop-blur-md z-40 ${isLight ? 'bg-white/80 border-slate-200' : 'bg-slate-950/80 border-slate-800'}`}>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSidebarOpen(true)} 
                  className={`p-3 -ml-2 rounded-2xl transition-all border ${isLight ? 'text-slate-500 active:bg-slate-200 bg-slate-100 border-slate-200' : 'text-slate-400 active:bg-slate-800 bg-slate-900/50 border-slate-800'}`}
                >
                  <Menu size={24} />
                </button>
                <span className={`font-black tracking-tighter uppercase text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>study2skills</span>
              </div>
              <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-600/30 border border-indigo-400/20 text-white">S</div>
            </header>
          )}

          <main className={`flex-1 w-full max-w-[100vw] overflow-x-hidden ${isPublicPage ? '' : 'p-4 md:p-8 lg:p-12 pb-28 lg:pb-12 mx-auto'}`}>
            <div className={`${isPublicPage ? '' : 'max-w-screen-2xl mx-auto w-full'}`}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
                <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
                <Route path="/roadmap" element={user ? <Roadmap /> : <Navigate to="/auth" />} />
                <Route path="/resume" element={user ? <Resume /> : <Navigate to="/auth" />} />
                <Route path="/interview" element={user ? <Interview /> : <Navigate to="/auth" />} />
                <Route path="/insights" element={user ? <Insights /> : <Navigate to="/auth" />} />
                <Route path="/mentor" element={user ? <Assistant /> : <Navigate to="/auth" />} />
                <Route path="/courses" element={user ? <Courses /> : <Navigate to="/auth" />} />
                <Route path="/jobs" element={user ? <Jobs /> : <Navigate to="/auth" />} />
                <Route path="/leaderboard" element={user ? <Leaderboard /> : <Navigate to="/auth" />} />
                <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" />} />
                <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
      {!isPublicPage && (
        <>
          <MobileNav />
          <Footer className="hidden lg:block" />
        </>
      )}
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <ThemeProvider>
      <Router>
        <AppLayout />
      </Router>
    </ThemeProvider>
  </AuthProvider>
);

export default App;

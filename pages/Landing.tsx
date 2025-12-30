
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Zap, Shield, Target, LayoutDashboard, Sparkles, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { loginGuest, user } = useAuth();

  const handleDemoClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      loginGuest();
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation - Always clean on Landing */}
      <nav className="border-b border-slate-800/50 sticky top-0 bg-slate-950/60 backdrop-blur-xl z-50 h-20 flex items-center px-6 md:px-12 justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-600/20">s2s</div>
          <span className="text-2xl font-black tracking-tighter">study2skills</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/leaderboard')} className="hidden md:block text-sm font-bold text-slate-400 hover:text-white transition">Leaderboard</button>
          {user ? (
            <button onClick={() => navigate('/dashboard')} className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3 rounded-full font-black text-sm flex items-center gap-2 transition shadow-xl shadow-indigo-600/20 active:scale-95">
              <LayoutDashboard size={18}/> Dashboard
            </button>
          ) : (
            <button onClick={() => navigate('/auth')} className="bg-white text-slate-950 hover:bg-slate-200 px-8 py-3 rounded-full font-black text-sm transition active:scale-95">Sign In</button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-40 text-center max-w-5xl mx-auto px-6 overflow-hidden">
        {/* Abstract Background Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-10 animate-fade-in">
          <Sparkles size={14}/> The Future of Career Tech is Here
        </div>

        <h1 className="text-6xl md:text-8xl font-black mb-10 tracking-tighter leading-[0.9] bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
          Architecting Elite <br/>
          <span className="text-indigo-500">Engineering Careers</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-400 mb-16 leading-relaxed max-w-3xl mx-auto font-medium">
          The all-in-one AI platform for engineering students. Personalized roadmaps, resume optimization, and automated market matching.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6 items-center">
          {user ? (
             <button onClick={() => navigate('/dashboard')} className="w-full sm:w-auto bg-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black text-xl hover:bg-indigo-700 flex items-center justify-center gap-3 transition-all shadow-2xl shadow-indigo-600/30 group">
              Enter Command Center <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </button>
          ) : (
            <button onClick={() => navigate('/auth')} className="w-full sm:w-auto bg-white text-slate-950 px-12 py-5 rounded-[2rem] font-black text-xl hover:bg-slate-200 flex items-center justify-center gap-3 transition-all shadow-2xl group">
              Start Journey <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </button>
          )}
          <button onClick={handleDemoClick} className="w-full sm:w-auto bg-slate-900 border border-slate-800 px-12 py-5 rounded-[2rem] font-black text-xl hover:bg-slate-800 transition flex items-center justify-center gap-3">
            <Globe size={20} className="text-indigo-400"/> {user ? 'View Platform Demo' : 'Explore Guest Mode'}
          </button>
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-32 bg-slate-900/30 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-16">
          {[
            { icon: <Target className="text-indigo-400" size={40}/>, title: "Precision Roadmaps", desc: "AI-generated curriculum mapped across 8 semesters to master any domain." },
            { icon: <Zap className="text-emerald-400" size={40}/>, title: "Auto-Pilot Applications", desc: "Discover and apply to internships with resumes tailored by Gemini AI." },
            { icon: <Shield className="text-amber-400" size={40}/>, title: "Skill Verification", desc: "Earn verified badges through interactive AI assessments and quizzes." },
          ].map((f, i) => (
            <div key={i} className="space-y-6 group">
              <div className="w-20 h-20 bg-slate-950 rounded-3xl flex items-center justify-center border border-slate-800 group-hover:border-indigo-500/50 transition-all duration-500 shadow-xl group-hover:shadow-indigo-600/10">
                {f.icon}
              </div>
              <h3 className="text-3xl font-black tracking-tight">{f.title}</h3>
              <p className="text-slate-400 text-lg leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-32 px-6 max-w-5xl mx-auto w-full">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-black tracking-tighter mb-4">The study2skills Edge</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Standard Portals vs. Our Intelligence Engine</p>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50">
                <th className="p-8 text-sm font-black uppercase tracking-widest text-slate-500">Core Feature</th>
                <th className="p-8 text-sm font-black uppercase tracking-widest text-slate-500">Traditional Method</th>
                <th className="p-8 text-sm font-black uppercase tracking-widest text-indigo-400">study2skills AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {[
                { f: "Roadmap Refresh", t: "Static / Outdated", s: "Real-time AI Synthesis" },
                { f: "Resume Scoring", t: "Basic ATS Checks", s: "Deep Semantic Context" },
                { f: "Career Mentorship", t: "Limited Availability", s: "24/7 Proactive AI Mentor" },
                { f: "Job Tailoring", t: "Manual Copy-Paste", s: "Automated Tailoring Engine" },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-800/20 transition group">
                  <td className="p-8 font-black text-white">{row.f}</td>
                  <td className="p-8 text-slate-500 font-medium">{row.t}</td>
                  <td className="p-8 text-indigo-400 font-black flex items-center">
                    <CheckCircle size={18} className="mr-3 text-emerald-500" /> {row.s}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-20 border-t border-slate-800/50 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center gap-8">
            <div className="flex items-center space-x-3 opacity-50 grayscale hover:grayscale-0 transition cursor-default">
              <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center font-black">s2s</div>
              <span className="text-xl font-black tracking-tighter text-white">study2skills</span>
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">
              &copy; 2024 Architected for the Next Generation of Global Engineers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

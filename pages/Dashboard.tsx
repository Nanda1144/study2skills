
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, BookOpen, Clock, Target, Zap, HelpCircle, ChevronDown, ChevronUp, Globe, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const isGuest = user?.role === 'guest';
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const skillData = [
    { name: 'React', level: 65, color: '#6366f1' },
    { name: 'Node.js', level: 40, color: '#10b981' },
    { name: 'Python', level: 85, color: '#f59e0b' },
    { name: 'Cloud', level: 30, color: '#8b5cf6' },
  ];

  const faqs = [
    { q: "How do I earn XP?", a: "Log your study sessions or complete course verification quizzes to earn XP and level up." },
    { q: "Can I change my domain?", a: "Yes, you can update your target domain in your Profile. Clicking 'Follow Path' in Roadmaps will also sync your profile focus." }
  ];

  const logStudySession = () => {
    if (!user || isGuest) return alert("Sign in to track progress!");
    const newXP = user.gamification.xp + 50;
    const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
    updateUser({
      ...user,
      gamification: { ...user.gamification, xp: newXP, level: newLevel, streakDays: user.gamification.streakDays + 1 }
    });
  };

  return (
    <div className="space-y-6 md:space-y-10 w-full max-w-7xl mx-auto pb-20 animate-fade-in px-2 md:px-0">
      {/* Hero Banner - Flexible Height */}
      <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-50 md:opacity-100">
           <button onClick={() => navigate('/')} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white flex items-center gap-2 transition active:scale-90">
             <Globe size={12}/> <span className="hidden sm:inline">Back to Vision</span>
           </button>
        </div>
        
        <div className="text-center md:text-left space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-widest mb-2">
            <Sparkles size={12}/> Engineering Status: Active
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">Welcome back, <br className="hidden md:block"/>{user?.name.split(' ')[0]}!</h2>
          <p className="text-slate-400 text-sm md:text-lg font-medium">Architecting your career in <span className="text-indigo-400 font-black">{user?.domain}</span>.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center space-x-4 shadow-xl flex-1 md:flex-none">
            <div className="p-3 bg-amber-500/10 rounded-xl"><Zap className="text-amber-500" size={24} /></div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Active Streak</p>
              <p className="text-2xl font-black text-white">{user?.gamification.streakDays || 0} Days</p>
            </div>
          </div>
          <button onClick={logStudySession} className="bg-indigo-600 hover:bg-indigo-700 w-full md:w-auto px-8 py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-500/30 transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
            <Clock size={20} /> Log Study
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6 md:space-y-10">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 md:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black flex items-center gap-3"><Target className="text-indigo-400" size={22} /> Skill Analysis</h3>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">Verified Metrics</span>
            </div>
            {/* AUTO-ADJUST CHART CONTAINER */}
            <div className="h-64 md:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={11} fontWeight={800} tickLine={false} axisLine={false} dy={10} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '16px', fontWeight: 'bold' }} 
                  />
                  <Bar dataKey="level" radius={[12, 12, 0, 0]} barSize={40}>
                    {skillData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 md:p-8 shadow-xl">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3"><HelpCircle className="text-indigo-400" size={22} /> Platform Support</h3>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300">
                  <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className={`w-full flex justify-between items-center p-5 text-left transition-colors ${openFaq === idx ? 'bg-slate-800' : 'hover:bg-slate-800/50'}`}>
                    <span className="font-bold text-slate-200 text-sm">{faq.q}</span>
                    <div className={`transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`}><ChevronDown size={18} /></div>
                  </button>
                  <div className={`transition-all duration-300 ease-in-out ${openFaq === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                    <div className="p-5 bg-slate-950 text-slate-400 text-sm border-t border-slate-800 leading-relaxed font-medium">{faq.a}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status Sidebar */}
        <div className="lg:col-span-4 space-y-6 md:space-y-10">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
            <h3 className="text-xl font-black mb-8 flex items-center gap-3"><Award className="text-emerald-400" size={22} /> Trophy Case</h3>
            <div className="grid grid-cols-4 gap-4">
              {user?.gamification.badges.length ? user.gamification.badges.map(b => (
                <div key={b.id} className="aspect-square bg-slate-950 rounded-2xl flex items-center justify-center text-2xl border border-slate-800 shadow-inner group hover:border-indigo-500 transition-colors">
                  <span className="group-hover:scale-110 transition-transform">{b.icon}</span>
                </div>
              )) : (
                [1,2,3,4].map(i => <div key={i} className="aspect-square bg-slate-950 border border-dashed border-slate-800 rounded-2xl flex items-center justify-center opacity-20"><Award size={24}/></div>)
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-xl">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3"><BookOpen className="text-amber-400" size={22} /> Active Mission</h3>
            <div className="p-6 bg-indigo-600/5 border border-indigo-500/20 rounded-2xl space-y-5">
              <div className="flex justify-between items-start">
                <p className="font-black text-white uppercase tracking-widest text-xs">Verified Learner</p>
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] bg-indigo-600/10 px-2 py-1 rounded">Stage 1</span>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">Complete 1 AI Knowledge Test in Courses to unlock full market grounding.</p>
              <div className="space-y-2">
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                  <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-full w-1/4 transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                </div>
                <div className="flex justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest">
                  <span>Progress 25%</span>
                  <span>150 XP Reward</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getLeaderboardData } from '../services/storage';
import { UserProfile, Milestone } from '../types';
import { Trophy, Medal, Star, Flame, Target, Award, CheckCircle2 } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [students, setStudents] = useState<UserProfile[]>([]);

  const defaultMilestones: Milestone[] = [
    { id: 'm1', label: 'Resume Analyzer Sync', target: 1, current: 0, reward: 500, completed: false },
    { id: 'm2', label: 'Roadmap Generation', target: 1, current: 0, reward: 250, completed: false },
    { id: 'm3', label: 'Mock Interview (Pass)', target: 1, current: 0, reward: 1000, completed: false },
    { id: 'm4', label: 'Level 5 Achievement', target: 5, current: user?.gamification.level || 1, reward: 2000, completed: (user?.gamification.level || 1) >= 5 },
  ];

  const defaultStudents: UserProfile[] = [
    { id: 'd1', name: 'Naveen Kumar', university: 'MIT Chennai', year: '4th Year', domain: 'AI Research', email: 'nav@example.com', contactMethod: 'email', skills: [], achievements: [], bio: '', role: 'student', status: 'active', gamification: { xp: 12500, level: 8, badges: [], streakDays: 24, studyHoursTotal: 120 } },
    { id: 'd2', name: 'Ishita Singh', university: 'DTU Delhi', year: '3rd Year', domain: 'Full Stack', email: 'ish@example.com', contactMethod: 'email', skills: [], achievements: [], bio: '', role: 'student', status: 'active', gamification: { xp: 9800, level: 7, badges: [], streakDays: 12, studyHoursTotal: 85 } },
    { id: 'd3', name: 'Rahul Reddy', university: 'BITS Pilani', year: '4th Year', domain: 'Cybersecurity', email: 'rah@example.com', contactMethod: 'email', skills: [], achievements: [], bio: '', role: 'student', status: 'active', gamification: { xp: 8400, level: 6, badges: [], streakDays: 8, studyHoursTotal: 60 } },
  ];

  // FIX: Created an async function within useEffect to resolve the Promise from getLeaderboardData
  useEffect(() => {
    const fetchLeaderboard = async () => {
      const realData = await getLeaderboardData();
      // Combine real users with default top players for "attraction"
      const combined = [...realData, ...defaultStudents].sort((a, b) => (b.gamification?.xp || 0) - (a.gamification?.xp || 0));
      setStudents(combined);
    };
    fetchLeaderboard();
  }, []);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" size={28} />;
    if (index === 1) return <Medal className="text-slate-300" size={24} />;
    if (index === 2) return <Medal className="text-amber-600" size={24} />;
    return <span className="font-black text-slate-600 w-8 text-center">{index + 1}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24 px-4">
      <div className="text-center">
        <h2 className="text-5xl font-black mb-4 flex items-center justify-center gap-4">
          <Star className="text-amber-400 fill-amber-400" size={40} /> Global Rankings
        </h2>
        <p className="text-slate-400 text-lg">Top engineers on study2skills. Complete targets to rise.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-12 p-6 bg-slate-950 border-b border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-6 ml-6">Candidate</div>
            <div className="col-span-3 text-center">Focus</div>
            <div className="col-span-2 text-center">XP Points</div>
          </div>
          <div className="divide-y divide-slate-800">
            {students.map((s, i) => {
              const isMe = s.id === user?.id;
              return (
                <div key={s.id} className={`grid grid-cols-12 p-6 items-center transition ${isMe ? 'bg-indigo-600/10 border-l-4 border-indigo-600' : 'hover:bg-slate-800/10'}`}>
                  <div className="col-span-1 flex justify-center">{getRankIcon(i)}</div>
                  <div className="col-span-6 ml-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-indigo-400 text-xl border border-slate-700">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className={`font-black text-lg ${isMe ? 'text-indigo-400' : 'text-white'}`}>{s.name} {isMe && '⭐'}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Level {s.gamification.level}</p>
                    </div>
                  </div>
                  <div className="col-span-3 text-center font-bold text-sm text-slate-400">{s.domain}</div>
                  <div className="col-span-2 text-center">
                    <span className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 font-black text-indigo-400 flex items-center justify-center w-fit mx-auto gap-2">
                      <Flame size={14} className="text-orange-500" /> {s.gamification.xp.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl -z-10"></div>
            <h3 className="text-xl font-black mb-8 flex items-center gap-3"><Target className="text-indigo-500"/> Targets & Rewards</h3>
            <div className="space-y-6">
              {defaultMilestones.map(m => (
                <div key={m.id} className="space-y-3 p-5 bg-slate-950 border border-slate-800 rounded-2xl group transition hover:border-indigo-500/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-white group-hover:text-indigo-400 transition">{m.label}</h4>
                      <p className="text-[10px] font-black text-slate-600 uppercase mt-1">Reward: +{m.reward} XP</p>
                    </div>
                    {m.completed ? <CheckCircle2 className="text-emerald-500" size={20}/> : <Award className="text-slate-800" size={20}/>}
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${m.completed ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ width: m.completed ? '100%' : '10%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

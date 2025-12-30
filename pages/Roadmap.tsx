
import React, { useState, useEffect } from 'react';
import { generateRoadmap } from '../services/geminiService';
import { RoadmapData, RoadmapItem } from '../types';
import { Loader2, Layers, Book, Sparkles, ChevronRight, CheckCircle, History, Clock, Bookmark, Globe, Target, Edit2, Check, Calendar, Zap, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { saveUserData, getUserData, getRoadmapHistory, saveRoadmapToHistory } from '../services/storage';

const Roadmap: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [domain, setDomain] = useState(user?.domain || '');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RoadmapData | null>(null);
  const [history, setHistory] = useState<RoadmapData[]>([]);
  const [selectedSems, setSelectedSems] = useState<number[]>([1,2,3,4,5,6,7,8]);
  const [generationMode, setGenerationMode] = useState<'Standard' | 'Elite'>('Standard');

  useEffect(() => {
    const fetchHistory = async () => {
      const saved = await getUserData('roadmap');
      if (saved) setData(saved);
      const h = await getRoadmapHistory();
      setHistory(h);
    };
    fetchHistory();
  }, []);

  const toggleSem = (s: number) => {
    setSelectedSems(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s].sort());
  };

  const handleGenerate = async (targetDomain?: string) => {
    const d = targetDomain || domain;
    if (!d.trim()) return;
    if (selectedSems.length === 0) return alert("Select at least one semester!");

    setLoading(true);
    // Logic Fix: Allowed Guest to test generation to fix "Analyzer not working" perception
    const result = await generateRoadmap(d, selectedSems);
    if (result) {
      setData(result);
      if (user?.role !== 'guest') {
        await saveUserData('roadmap', result);
        await saveRoadmapToHistory(result);
        const h = await getRoadmapHistory();
        setHistory(h);
      }
    } else {
      alert("AI Bridge timed out. Please check your API Key or try again.");
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 md:space-y-12 pb-24 px-2 md:px-4 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="w-full md:w-auto">
          <h2 className="text-3xl md:text-5xl font-black mb-2 flex items-center gap-3">
            <Target className="text-indigo-500" size={32} /> Roadmap Builder
          </h2>
          <p className="text-slate-400 text-sm md:text-lg">Personalized AI path for <span className="text-white font-black">{user?.year || 'Aspiring'}</span> students.</p>
        </div>
        {data && user?.role !== 'guest' && (
           <button onClick={() => alert('Roadmap Synced to Profile!')} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 px-8 py-4 rounded-2xl font-black text-sm transition flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-95">
            <CheckCircle size={20} /> Follow This Path
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-8 md:gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[80px] -z-10"></div>
            
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1">Engineering Domain</label>
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={20}/>
                  <input type="text" value={domain} onChange={e => setDomain(e.target.value)} placeholder="e.g. Artificial Intelligence, Full Stack Development..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-14 pr-8 py-5 text-lg font-bold text-white focus:outline-none focus:border-indigo-500 transition shadow-inner" />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                   <div className="flex items-center gap-3">
                      <Zap size={18} className={generationMode === 'Elite' ? 'text-amber-400' : 'text-slate-600'}/>
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-widest">Generation Mode</p>
                        <p className="text-[10px] text-slate-500">Elite uses deeper AI reasoning tokens.</p>
                      </div>
                   </div>
                   <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                      {(['Standard', 'Elite'] as const).map(m => (
                        <button key={m} onClick={() => setGenerationMode(m)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${generationMode === m ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>{m}</button>
                      ))}
                   </div>
                </div>

                <button 
                  onClick={() => handleGenerate()} 
                  disabled={loading} 
                  className={`w-full group bg-indigo-600 hover:bg-indigo-500 text-white px-6 md:px-8 py-4 md:py-6 rounded-2xl md:rounded-3xl font-black text-lg md:text-xl flex items-center justify-center gap-4 transition-all duration-300 shadow-[0_20px_40px_rgba(79,70,229,0.25)] active:scale-95 ${loading ? 'opacity-80 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={24} /> 
                      <span className="animate-pulse text-sm">ARCHITECTING NEURAL PATH...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={24} className="group-hover:rotate-12 transition-transform"/> 
                      Generate {generationMode} Roadmap
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1"><Calendar size={12}/> Select Semesters</label>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-3">
                {[1,2,3,4,5,6,7,8].map(s => (
                  <button key={s} onClick={() => toggleSem(s)} className={`h-12 md:h-14 rounded-xl font-black text-lg border transition-all ${selectedSems.includes(s) ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg scale-105' : 'bg-slate-950 border-slate-800 text-slate-600 active:scale-90'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {data && !loading && (
            <div className="space-y-8 animate-fade-in">
              {data.roadmap?.map((sem, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-4 md:gap-8 group">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-950 border-2 border-indigo-500 rounded-2xl md:rounded-3xl flex items-center justify-center font-black text-indigo-400 text-xl md:text-2xl flex-shrink-0 shadow-xl transition group-hover:bg-indigo-600 group-hover:text-white">
                    {sem.semester}
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 md:p-10 flex-1 transition hover:border-indigo-500/30 shadow-2xl relative">
                    <div className="flex justify-between items-start mb-6">
                      <h4 className="text-xl md:text-3xl font-black text-white tracking-tight">{sem.focus}</h4>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2"><Layers size={14}/> Core Stack</p>
                        <div className="flex flex-wrap gap-2">
                          {sem.skills?.map((s, i) => <span key={i} className="text-[10px] font-bold bg-slate-950 border border-slate-800 text-slate-400 px-3 py-1.5 rounded-lg">{s}</span>)}
                        </div>
                      </div>
                      <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 shadow-inner">
                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Bookmark size={14}/> Key Milestone</p>
                        <p className="text-xs text-slate-300 font-medium leading-relaxed">{sem.projectIdeas?.[0] || sem.projects?.[0] || 'Domain proficiency validation through cluster projects.'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl sticky top-24">
            <h3 className="font-black flex items-center gap-3 mb-6 text-sm uppercase tracking-widest"><History size={18} className="text-indigo-400"/> Vault History</h3>
            <div className="space-y-3">
              {history.length > 0 ? history.slice(0, 5).map((h, i) => (
                <button key={i} onClick={() => setData(h)} className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-left hover:border-indigo-500/50 transition group flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-white truncate group-hover:text-indigo-400 transition">{h.domain}</p>
                    <p className="text-[9px] text-slate-600 font-black uppercase mt-0.5">{h.roadmap.length} Steps</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-800 group-hover:text-indigo-500 transition flex-shrink-0"/>
                </button>
              )) : <p className="text-slate-600 text-[10px] text-center py-8 italic font-bold">No history available.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;


import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Loader2, Sparkles, Search, Zap, History, ExternalLink, X, Globe, Eye, FileText, Layout, CheckCircle, Bookmark, BookmarkCheck, ListChecks, Heart, Info } from 'lucide-react';
import { generateJobApplication, discoverJobs } from '../services/geminiService';
import { JobAutomation, JobHistoryItem } from '../types';
import { getJobHistory, addJobHistory, saveUserData, getUserData } from '../services/storage';

const Jobs: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'market' | 'saved'>('market');
  const [jobs, setJobs] = useState<JobAutomation[]>([]);
  const [savedJobs, setSavedJobs] = useState<JobAutomation[]>([]);
  const [history, setHistory] = useState<JobHistoryItem[]>([]);
  const [running, setRunning] = useState(false);
  const [activeStage, setActiveStage] = useState<string>('');
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [viewingJob, setViewingJob] = useState<JobAutomation | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [h, s] = await Promise.all([
        getJobHistory(),
        getUserData('saved_jobs')
      ]);
      setHistory(h || []);
      setSavedJobs(s || []);
      if (user?.domain && jobs.length === 0) handleScan();
    };
    fetchData();
  }, [user?.domain]);

  const handleScan = async () => {
    if (!user) return;
    setDiscoveryLoading(true);
    const results = await discoverJobs(user.domain, user.skills);
    setJobs(results.map((r: any) => ({ ...r, status: 'Scanning' })));
    setDiscoveryLoading(false);
  };

  const handleSaveJob = async (job: JobAutomation) => {
    const isSaved = savedJobs.some(s => s.id === job.id);
    let newSaved;
    if (isSaved) {
      newSaved = savedJobs.filter(s => s.id !== job.id);
    } else {
      newSaved = [...savedJobs, job];
    }
    setSavedJobs(newSaved);
    await saveUserData('saved_jobs', newSaved);
  };

  const runAutomation = async () => {
    if (!user || jobs.length === 0) return;
    setRunning(true);
    const targetJobs = activeTab === 'market' ? jobs : savedJobs;
    for (const job of targetJobs) {
      if (job.status === 'Applied') continue;
      
      setActiveStage(`Analyzing ${job.role} requirements...`);
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'Tailoring Resume' } : j));
      
      const ai = await generateJobApplication(job.role, job.company, user);
      await new Promise(r => setTimeout(r, 1000)); 

      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'Applied', coverLetter: ai.coverLetter, tailoredSummary: ai.tailoredSummary } : j));
      
      const historyItem: JobHistoryItem = { 
        id: Date.now().toString(), 
        company: job.company, 
        role: job.role, 
        date: new Date().toLocaleDateString(), 
        status: 'Applied' 
      };
      await addJobHistory(historyItem);
    }
    setRunning(false);
    setActiveStage('');
    const h = await getJobHistory();
    setHistory(h);
  };

  const currentJobs = activeTab === 'market' ? jobs : savedJobs;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-5xl font-black mb-2 flex items-center gap-4"><Briefcase className="text-indigo-400" size={40} /> Jobs Hub</h2>
          <p className="text-slate-400 font-medium">Auto-pilot engine scanning for <span className="text-indigo-400 font-black">{user?.domain}</span> roles.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleScan} disabled={discoveryLoading} className="bg-slate-900 border border-slate-800 px-6 py-4 rounded-2xl font-black hover:bg-slate-800 transition flex items-center gap-2">
            {discoveryLoading ? <Loader2 className="animate-spin" size={18}/> : <Globe size={18}/>} Sync Market
          </button>
          <button onClick={runAutomation} disabled={running || currentJobs.length === 0} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-10 py-5 rounded-3xl font-black text-lg transition flex items-center shadow-xl shadow-indigo-600/20 active:scale-95">
            {running ? <Loader2 className="animate-spin mr-3" /> : <Zap className="mr-3" size={20} />} Auto-Pilot
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setActiveTab('market')} className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition flex items-center gap-2 ${activeTab === 'market' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-900 text-slate-500 border border-slate-800'}`}>
          <Globe size={14}/> Market Scan
        </button>
        <button onClick={() => setActiveTab('saved')} className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition flex items-center gap-2 ${activeTab === 'saved' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-900 text-slate-500 border border-slate-800'}`}>
          <Bookmark size={14}/> Saved Leads ({savedJobs.length})
        </button>
      </div>

      {activeStage && (
        <div className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-2xl flex items-center gap-4 text-sm font-black animate-pulse text-indigo-400">
          <Sparkles size={18} /> {activeStage}
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          {discoveryLoading ? (
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-32 text-center flex flex-col items-center gap-8">
               <div className="relative">
                 <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin"></div>
                 <Search className="absolute inset-0 m-auto text-indigo-500" size={28} />
               </div>
               <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-xs">Live Search Scrutiny...</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-8 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <span className="font-black text-slate-500 uppercase tracking-widest text-[10px]">{activeTab === 'market' ? 'Market Pipeline' : 'Saved for Later'}</span>
                <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Active</span>
              </div>
              <div className="divide-y divide-slate-800/50">
                {currentJobs.map(job => (
                  <div key={job.id} className="p-8 flex flex-col md:flex-row items-center justify-between gap-8 hover:bg-slate-800/20 transition group">
                    <div className="flex items-center gap-6 flex-1">
                      <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center font-black text-indigo-400 text-3xl border border-slate-700">{job.company[0]}</div>
                      <div>
                        <h4 className="font-black text-xl text-white">{job.role}</h4>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{job.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center mr-4"><p className="text-[10px] text-slate-500 font-black uppercase mb-1">Match</p><p className="font-black text-emerald-400 text-2xl">{Math.round(job.matchScore)}%</p></div>
                      <div className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase border transition ${job.status === 'Applied' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                        {job.status}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleSaveJob(job)} className={`p-4 rounded-2xl transition border ${savedJobs.some(s => s.id === job.id) ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-indigo-400'}`}>
                          {savedJobs.some(s => s.id === job.id) ? <BookmarkCheck size={20}/> : <Bookmark size={20}/>}
                        </button>
                        <button onClick={() => setViewingJob(job)} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-500 hover:text-white transition hover:border-indigo-500/50"><Eye size={20}/></button>
                      </div>
                    </div>
                  </div>
                ))}
                {currentJobs.length === 0 && <div className="p-32 text-center text-slate-600 font-bold italic">No {activeTab === 'market' ? 'leads' : 'saved jobs'} found.</div>}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl h-fit">
            <h3 className="font-black flex items-center gap-4 mb-8 text-xl"><History className="text-indigo-400" size={24}/> Activity Log</h3>
            <div className="space-y-4">
              {history.map(h => (
                <div key={h.id} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500/50"></div>
                  <p className="font-black text-white text-sm truncate">{h.role}</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{h.company} • {h.date}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/5 px-2 py-1 rounded-md">{h.status}</span>
                    <button className="text-[10px] font-black text-slate-600 hover:text-white transition uppercase">Trace</button>
                  </div>
                </div>
              ))}
              {history.length === 0 && <p className="text-center py-20 text-slate-700 italic font-bold">Waiting for deployment...</p>}
            </div>
          </div>
        </div>
      </div>

      {viewingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6 backdrop-blur-xl animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-4xl p-12 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setViewingJob(null)} className="absolute top-10 right-10 text-slate-500 hover:text-white transition bg-slate-950 p-3 rounded-2xl border border-slate-800"><X size={24}/></button>
            <div className="flex items-center gap-8 mb-10 pb-10 border-b border-slate-800">
               <div className="w-24 h-24 bg-indigo-600/20 rounded-[2rem] flex items-center justify-center font-black text-indigo-400 text-5xl border border-indigo-500/20">{viewingJob.company[0]}</div>
               <div className="flex-1">
                  <h3 className="text-4xl font-black text-white leading-tight">{viewingJob.role}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-indigo-400 font-black flex items-center gap-3 uppercase tracking-[0.2em] text-xs">{viewingJob.company}</p>
                    <button onClick={() => handleSaveJob(viewingJob)} className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition ${savedJobs.some(s => s.id === viewingJob.id) ? 'text-indigo-400' : 'text-slate-500 hover:text-white'}`}>
                      {savedJobs.some(s => s.id === viewingJob.id) ? <BookmarkCheck size={16}/> : <Bookmark size={16}/>}
                      {savedJobs.some(s => s.id === viewingJob.id) ? 'Saved' : 'Save Job'}
                    </button>
                  </div>
               </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-10">
                {/* Description */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-3"><Info size={18}/> Role Overview</h4>
                  <p className="text-slate-300 leading-relaxed font-medium bg-slate-950 p-8 rounded-3xl border border-slate-800 shadow-inner">
                    {viewingJob.description || "Synthesizing deep role context..."}
                  </p>
                </div>

                {/* Requirements */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-3"><ListChecks size={18}/> Technical Requirements</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {(viewingJob.requirements || viewingJob.requiredSkills || []).map((req, i) => (
                      <div key={i} className="flex gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 group hover:border-emerald-500/30 transition">
                        <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5"/>
                        <span className="text-sm text-slate-400 font-bold">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-amber-400 uppercase tracking-[0.3em] flex items-center gap-3"><Heart size={18}/> Perks & Benefits</h4>
                  <div className="flex flex-wrap gap-3">
                    {(viewingJob.benefits || ['Competitive Salary', 'Flexible Hours', 'Stock Options', 'Health Insurance']).map((benefit, i) => (
                      <span key={i} className="px-5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-black text-slate-400 flex items-center gap-2">
                        <Sparkles size={14} className="text-amber-500"/> {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Application Details Sidebar */}
              <div className="space-y-8">
                 <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 text-center space-y-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Alignment Score</p>
                    <div className="text-6xl font-black text-emerald-400">{Math.round(viewingJob.matchScore)}%</div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${viewingJob.matchScore}%` }}></div>
                    </div>
                 </div>

                 {viewingJob.status === 'Applied' && (
                   <div className="space-y-6">
                      <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-3xl space-y-4">
                         <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2"><FileText size={14}/> Generated Cover Letter</h4>
                         <p className="text-slate-400 text-[10px] italic leading-relaxed line-clamp-6">{viewingJob.coverLetter}</p>
                         <button className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase underline">Read Full Letter</button>
                      </div>
                   </div>
                 )}

                 <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl space-y-6">
                    <button onClick={runAutomation} className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2">
                      <Zap size={16}/> Auto-Tailor & Apply
                    </button>
                    <a href={viewingJob.url || '#'} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest transition">
                      Visit Listing <ExternalLink size={16}/>
                    </a>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;

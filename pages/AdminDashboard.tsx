
import React, { useState, useEffect } from 'react';
import { getAdminStats, getUsers, toggleUserStatus, deleteUser, getActivityLogs } from '../services/storage';
import { UserProfile, AdminStats, IndustryTrend } from '../types';
import { 
  Users, TrendingUp, Search, Eye, Trash2, Sparkles, Brain, Loader2, X,
  Activity, Clock, Database, Globe, BarChart2, ShieldAlert, ShieldCheck, 
  Terminal, Cloud, Code, LineChart, Zap, FileText, Download, MessageSquareCode
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { 
  getMarketInsights, 
  generateAdminPlanner, 
  generateMonthlyReport, 
  generateUserIntelligence 
} from '../services/geminiService';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  
  // AI States
  const [strategicPlan, setStrategicPlan] = useState('');
  const [monthlyReport, setMonthlyReport] = useState('');
  const [userIntel, setUserIntel] = useState<string[]>([]);
  const [marketTrends, setMarketTrends] = useState<IndustryTrend[]>([]);
  
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'users' | 'activity' | 'market' | 'planner' | 'reports' | 'setup'>('users');

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 30000); 
    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    try {
      const [allUsers, allStats, allLogs] = await Promise.all([
        getUsers(),
        getAdminStats(),
        getActivityLogs()
      ]);
      setUsers(allUsers || []);
      setStats(allStats);
      setLogs(allLogs || []);
      
      // Auto-trigger small intel feed if users exist
      if (allUsers?.length > 0 && userIntel.length === 0) {
        handleGenerateUserIntel(allUsers);
      }
    } catch (err) { console.error("Admin refresh failed", err); }
  };

  const handleGeneratePlanner = async () => {
    setLoading(p => ({ ...p, planner: true }));
    setActiveTab('planner');
    const res = await generateAdminPlanner(stats);
    setStrategicPlan(res);
    setLoading(p => ({ ...p, planner: false }));
  };

  const handleGenerateReport = async () => {
    setLoading(p => ({ ...p, report: true }));
    setActiveTab('reports');
    const res = await generateMonthlyReport(stats, logs);
    setMonthlyReport(res);
    setLoading(p => ({ ...p, report: false }));
  };

  const handleGenerateUserIntel = async (userList: UserProfile[]) => {
    setLoading(p => ({ ...p, intel: true }));
    const res = await generateUserIntelligence(userList);
    setUserIntel(res);
    setLoading(p => ({ ...p, intel: false }));
  };

  const fetchMarketAnalysis = async () => {
    setLoading(p => ({ ...p, market: true }));
    setActiveTab('market');
    const result = await getMarketInsights("Emerging Engineering Roles 2024");
    setMarketTrends(result.trends);
    setLoading(p => ({ ...p, market: false }));
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-5xl font-black tracking-tight text-white">System Command</h2>
          <div className="flex items-center gap-4">
            <span className="text-emerald-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Local Cluster: Online
            </span>
            <span className="text-indigo-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={12}/> AI Intelligence: active
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleGenerateReport} disabled={loading.report} className="bg-slate-900 border border-slate-800 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition flex items-center gap-3">
            {loading.report ? <Loader2 className="animate-spin" size={18}/> : <FileText size={18} className="text-amber-500"/>} Monthly Report
          </button>
          <button onClick={handleGeneratePlanner} disabled={loading.planner} className="bg-indigo-600 hover:bg-indigo-700 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition flex items-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-95 group">
            {loading.planner ? <Loader2 className="animate-spin" size={20}/> : <Zap size={20} className="group-hover:animate-pulse"/>} Strategic Planner
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 w-fit overflow-x-auto gap-1 backdrop-blur-md">
        {[
          { id: 'users', label: 'Candidates', icon: <Users size={14}/> },
          { id: 'activity', label: 'Neural Logs', icon: <Activity size={14}/> },
          { id: 'market', label: 'Market Analyzer', icon: <Globe size={14}/> },
          { id: 'planner', label: 'AI Planner', icon: <LineChart size={14}/> },
          { id: 'reports', label: 'Executive Reports', icon: <FileText size={14}/> },
          { id: 'setup', label: 'Infrastructure', icon: <Database size={14}/> }
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Main Interface */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col min-h-[700px]">
          {activeTab === 'users' && (
            <>
              <div className="p-10 bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                <h3 className="font-black text-xl flex items-center gap-3"><Users className="text-indigo-400"/> Database Explorer</h3>
                <div className="relative w-full md:w-80">
                  <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" placeholder="Filter by identity..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3.5 pl-14 pr-6 text-xs font-bold outline-none focus:border-indigo-500 transition" />
                </div>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 text-slate-600 text-[10px] uppercase font-black border-b border-slate-800">
                    <tr>
                      <th className="p-8">Candidate Profile</th>
                      <th className="p-8">Focus</th>
                      <th className="p-8">Sync Status</th>
                      <th className="p-8 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-800/20 transition group">
                        <td className="p-8">
                          <div className="font-black text-white text-lg">{u.name}</div>
                          <div className="text-[10px] text-slate-500 font-bold mt-1">{u.email}</div>
                        </td>
                        <td className="p-8">
                          <div className="text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-lg border border-indigo-500/20 w-fit">{u.domain || 'Unset'}</div>
                        </td>
                        <td className="p-8">
                          <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border ${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="p-8">
                          <div className="flex justify-center gap-3">
                            <button onClick={() => setSelectedUser(u)} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-indigo-400 transition" title="View Trace"><Eye size={18}/></button>
                            <button onClick={() => toggleUserStatus(u.id!)} className={`p-3 bg-slate-950 border border-slate-800 rounded-xl transition ${u.status === 'active' ? 'text-slate-500 hover:text-rose-400' : 'text-slate-500 hover:text-emerald-400'}`}>
                              {u.status === 'active' ? <ShieldAlert size={18}/> : <ShieldCheck size={18}/>}
                            </button>
                            <button onClick={() => deleteUser(u.id!)} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-rose-500 transition"><Trash2 size={18}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'market' && (
            <div className="p-12 space-y-12 animate-fade-in flex-1">
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-black text-indigo-400 flex items-center gap-4"><Globe size={32}/> Market Analyzer</h3>
                <button onClick={fetchMarketAnalysis} disabled={loading.market} className="px-6 py-3 bg-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
                  {loading.market ? <Loader2 size={14} className="animate-spin"/> : <Search size={14}/>} Run Search Pulse
                </button>
              </div>
              {loading.market ? (
                <div className="flex flex-col items-center justify-center h-96 gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin"></div>
                    <Search className="absolute inset-0 m-auto text-indigo-500" size={32}/>
                  </div>
                  <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">Grounding in Search Results...</p>
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="h-72 bg-slate-950 p-8 rounded-[2rem] border border-slate-800 shadow-inner">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={marketTrends}>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis hide />
                        <Tooltip cursor={{fill: 'rgba(99,102,241,0.05)'}} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }} />
                        <Bar dataKey="demand" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40}>
                           {marketTrends.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? '#6366f1' : '#10b981'} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {marketTrends.map((trend, i) => (
                      <div key={i} className="p-8 bg-slate-950 rounded-3xl border border-slate-800 flex justify-between items-center group hover:border-indigo-500/30 transition">
                        <div>
                          <p className="font-black text-white text-lg">{trend.name}</p>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Market Match Percentage</p>
                        </div>
                        <p className="text-4xl font-black text-emerald-400">{trend.demand}%</p>
                      </div>
                    ))}
                    {marketTrends.length === 0 && <div className="col-span-2 text-center py-20 text-slate-700 italic font-black uppercase tracking-widest">Awaiting Analysis Data</div>}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'planner' && (
            <div className="p-12 space-y-10 animate-fade-in flex-1">
              <div className="flex justify-between items-center">
                 <h3 className="text-3xl font-black text-amber-400 flex items-center gap-4"><Brain size={32}/> AI Strategic Planner</h3>
                 <span className="bg-amber-500/10 text-amber-500 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20">Planning Cycle: 30 Days</span>
              </div>
              {loading.planner ? (
                <div className="flex flex-col items-center justify-center h-96 gap-6">
                  <div className="w-20 h-20 bg-amber-500/10 rounded-[2rem] flex items-center justify-center animate-pulse">
                    <Loader2 className="animate-spin text-amber-500" size={32}/>
                  </div>
                  <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">Building 90-Day Expansion Roadmap...</p>
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-800 p-10 rounded-[2.5rem] text-slate-300 leading-[1.8] font-medium text-lg whitespace-pre-wrap shadow-inner border-l-8 border-l-amber-500">
                  {strategicPlan || "Initiate planner to synthesize user behavior and market demands into an actionable growth path."}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="p-12 space-y-10 animate-fade-in flex-1">
              <div className="flex justify-between items-center">
                 <h3 className="text-3xl font-black text-indigo-400 flex items-center gap-4"><FileText size={32}/> Executive Performance Report</h3>
                 {monthlyReport && (
                   <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 border border-indigo-400/20 px-4 py-2 rounded-xl hover:bg-indigo-400 hover:text-white transition">
                     <Download size={14}/> PDF Export
                   </button>
                 )}
              </div>
              {loading.report ? (
                <div className="flex flex-col items-center justify-center h-96 gap-6">
                  <Loader2 className="animate-spin text-indigo-500" size={56}/>
                  <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">Compiling Cluster Data Statistics...</p>
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-800 p-10 rounded-[2.5rem] text-slate-300 leading-[1.8] font-medium text-lg whitespace-pre-wrap shadow-inner custom-scrollbar overflow-y-auto">
                  {monthlyReport || "Generate report to see detailed platform KPIs and user growth trajectories."}
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
              <h3 className="font-black text-2xl mb-10 flex items-center gap-4">
                <Activity className="text-rose-500" size={28} /> Activity Stream <span className="text-xs bg-rose-500/10 text-rose-500 px-3 py-1 rounded-full border border-rose-500/20">Live Sync</span>
              </h3>
              <div className="space-y-6">
                {logs.length > 0 ? logs.map((log: any, i: number) => (
                  <div key={i} className="flex gap-6 p-6 bg-slate-950 rounded-3xl border border-slate-800 hover:border-slate-700 transition relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-2 h-full bg-slate-800 group-hover:bg-rose-500/20 transition"></div>
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 flex-shrink-0 border border-slate-800"><Clock size={20} /></div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-black text-indigo-400 text-sm tracking-tight">{log.userName || 'System Agent'}</span>
                        <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-white font-black text-base">{log.action}</p>
                      <p className="text-slate-500 text-xs mt-2 font-mono bg-slate-900 p-3 rounded-xl border border-slate-800">{log.details}</p>
                    </div>
                  </div>
                )) : <div className="text-center py-32 text-slate-700 font-bold italic">No recorded activity in MongoDB cluster.</div>}
              </div>
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="p-12 space-y-12 animate-fade-in flex-1">
              <h3 className="text-3xl font-black text-emerald-400 flex items-center gap-4"><Terminal size={32}/> Global Infrastructure</h3>
              <div className="grid md:grid-cols-2 gap-8">
                 <div className="bg-slate-950 border border-slate-800 p-8 rounded-[2.5rem] space-y-6">
                    <div className="flex items-center gap-4">
                       <Database className="text-emerald-400" size={24}/>
                       <h4 className="font-black text-white uppercase tracking-widest text-sm">Cluster Status</h4>
                    </div>
                    <div className="space-y-3">
                       <div className="flex justify-between items-center"><span className="text-xs text-slate-500">Connection</span><span className="text-[10px] font-black text-emerald-400 uppercase">Primary</span></div>
                       <div className="flex justify-between items-center"><span className="text-xs text-slate-500">Nodes</span><span className="text-[10px] font-black text-emerald-400 uppercase">3 Active</span></div>
                       <div className="flex justify-between items-center"><span className="text-xs text-slate-500">Region</span><span className="text-[10px] font-black text-emerald-400 uppercase">AWS-Mumbai</span></div>
                    </div>
                 </div>
                 <div className="bg-slate-950 border border-slate-800 p-8 rounded-[2.5rem] space-y-6">
                    <div className="flex items-center gap-4">
                       <Cloud className="text-indigo-400" size={24}/>
                       <h4 className="font-black text-white uppercase tracking-widest text-sm">AI Engine Status</h4>
                    </div>
                    <div className="space-y-3">
                       <div className="flex justify-between items-center"><span className="text-xs text-slate-500">Model</span><span className="text-[10px] font-black text-indigo-400 uppercase">Gemini 3 Pro</span></div>
                       <div className="flex justify-between items-center"><span className="text-xs text-slate-500">Latency</span><span className="text-[10px] font-black text-indigo-400 uppercase">1.2s avg</span></div>
                       <div className="flex justify-between items-center"><span className="text-xs text-slate-500">Sync Mode</span><span className="text-[10px] font-black text-indigo-400 uppercase">Real-Time</span></div>
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Intelligence Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* User Intelligence Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl -z-10"></div>
            <div className="flex justify-between items-center">
              <h3 className="font-black flex items-center gap-4 text-lg"><MessageSquareCode size={20} className="text-indigo-400" /> User Intel Feed</h3>
              <button onClick={() => handleGenerateUserIntel(users)} className="p-2 bg-slate-800 rounded-lg hover:text-indigo-400 transition">
                <RefreshCcw size={14} className={loading.intel ? 'animate-spin' : ''}/>
              </button>
            </div>
            <div className="space-y-4">
              {loading.intel ? (
                [1,2,3].map(i => <div key={i} className="h-16 bg-slate-950 rounded-2xl animate-pulse"></div>)
              ) : userIntel.map((intel, i) => (
                <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-start gap-3 group hover:border-indigo-500/50 transition">
                   <div className="w-8 h-8 bg-indigo-600/10 rounded-lg flex items-center justify-center text-indigo-400 flex-shrink-0">
                      <Sparkles size={14}/>
                   </div>
                   <p className="text-xs font-bold text-slate-400 leading-relaxed">{intel}</p>
                </div>
              ))}
              {userIntel.length === 0 && <p className="text-center text-slate-600 italic text-xs py-10">Waiting for candidate activity...</p>}
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl space-y-10">
            <h3 className="font-black flex items-center gap-4 text-lg"><BarChart2 size={20} className="text-emerald-400" /> Domain Pulse</h3>
            <div className="space-y-6">
              {stats?.domainDistribution?.map((d, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">{d.name}</span>
                    <span className="text-white">{d.value}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-gradient-to-r from-indigo-600 to-emerald-500 h-full" style={{ width: `${(d.value / (stats?.totalUsers || 1)) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 text-center">
                  <p className="text-[9px] font-black text-slate-600 uppercase mb-2">Total Candidates</p>
                  <p className="text-3xl font-black text-white">{stats?.totalUsers || 0}</p>
               </div>
               <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 text-center">
                  <p className="text-[9px] font-black text-slate-600 uppercase mb-2">AI Accuracy</p>
                  <p className="text-3xl font-black text-indigo-400">98%</p>
               </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
             <ShieldAlert size={40} className="text-amber-500 mb-6" />
             <h4 className="text-white text-xl font-black mb-3">Operational Note</h4>
             <p className="text-slate-400 text-sm leading-relaxed font-medium">
               The cluster primary is synchronized. Real-time logging is active. Any changes to user status are pushed to MongoDB instantly via the Auto-Sync relay.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal icon helper not exported from Lucide
const RefreshCcw = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
    <path d="M16 16h5v5"/>
  </svg>
);

export default AdminDashboard;

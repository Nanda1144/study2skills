
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { getMarketInsights } from '../services/geminiService';
import { IndustryTrend } from '../types';
import { Loader2, TrendingUp, Briefcase, ExternalLink, Globe, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Insights: React.FC = () => {
  const { user } = useAuth();
  const [domain, setDomain] = useState(user?.domain || 'Full Stack Development');
  const [data, setData] = useState<IndustryTrend[]>([]);
  const [sources, setSources] = useState<{ title: string; uri: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const result = await getMarketInsights(domain);
    setData(Array.isArray(result.trends) ? result.trends : []);
    setSources(result.sources || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold mb-2 flex items-center">
            <TrendingUp className="mr-2 text-indigo-400" /> Market Insights
          </h2>
          <p className="text-slate-400">Real-time AI scanning of tech trends via Google Search.</p>
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" value={domain} onChange={e => setDomain(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500" placeholder="Analyze domain..." />
          </div>
          <button onClick={fetchData} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-xl font-bold transition">
            {loading ? <Loader2 className="animate-spin" /> : 'Search'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-[400px] flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 border border-slate-800 rounded-3xl">
          <Loader2 className="animate-spin text-indigo-500 mb-6" size={48} />
          <p className="font-medium">Aggregating real-time industry data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-8 flex items-center">
                <TrendingUp size={20} className="mr-2 text-indigo-400" /> Skill Demand Score
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={100} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                    <Bar dataKey="demand" radius={[0, 4, 4, 0]} barSize={20}>
                      {data.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? '#6366f1' : '#10b981'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-8 flex items-center">
                <Briefcase size={20} className="mr-2 text-emerald-400" /> Growth Trends
              </h3>
              <div className="space-y-6">
                {data.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-slate-300 font-semibold">{item.name}</span>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${Math.min(item.growth * 3, 100)}%` }}></div>
                      </div>
                      <span className="text-emerald-400 font-mono font-bold">+{item.growth}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {sources.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <Globe size={18} className="mr-2 text-blue-400" /> Grounding Sources
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sources.map((s, i) => (
                  <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="p-4 bg-slate-950 border border-slate-800 rounded-2xl hover:border-indigo-500/50 transition flex items-center justify-between group">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold truncate text-slate-300 group-hover:text-white">{s.title}</p>
                      <p className="text-xs text-slate-500 truncate">{s.uri}</p>
                    </div>
                    <ExternalLink size={14} className="ml-4 text-slate-600 group-hover:text-indigo-400 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Insights;

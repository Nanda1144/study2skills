
import React, { useState, useEffect, useRef } from 'react';
import { analyzeResume, generatePortfolio } from '../services/geminiService';
import { ResumeAnalysis, ResumeVersion, PortfolioData } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, Loader2, Sparkles, History, Upload, PenTool, 
  Code, Eye, Monitor, Tag, CheckCircle2, Wand2, X, TrendingUp,
  Download, Save, Check, FileCode, Layout, FileUp, Palette, Mail
} from 'lucide-react';
import { saveResumeVersion, getResumeVersions, saveUserData, getUserData, logActivity } from '../services/storage';
import { sendPortfolioCode } from '../services/emailService';

const Resume: React.FC = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'analyze' | 'history' | 'portfolio'>('analyze');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [versionName, setVersionName] = useState('');
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);

  // Customization state
  const [selectedTemplate, setSelectedTemplate] = useState('Glassmorphism');
  const [selectedColor, setSelectedColor] = useState('Indigo');

  const templates = ['Minimalist', 'Glassmorphism', 'Bento Box', 'Cyberpunk', 'Classic Professional'];
  const colors = ['Indigo', 'Emerald', 'Rose', 'Amber', 'Slate', 'Violet'];

  useEffect(() => {
    const fetchData = async () => {
      const [v, p] = await Promise.all([getResumeVersions(), getUserData('user_portfolio')]);
      setVersions(v || []);
      setPortfolio(p);
    };
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!versionName.trim()) return alert("Label this scan version first.");
    setLoading(true);
    try {
      let result: ResumeAnalysis | null = null;
      if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const base64 = (reader.result as string).split(',')[1];
          result = await analyzeResume(base64, true, file.type);
          if (result) finishAnalysis(result, "Document Scan");
        };
      } else {
        result = await analyzeResume(text);
        if (result) finishAnalysis(result, text);
      }
    } catch (e) { setLoading(false); }
  };

  const finishAnalysis = async (result: ResumeAnalysis, content: string) => {
    setAnalysis(result);
    await saveResumeVersion(content, versionName, result);
    const updated = await getResumeVersions();
    setVersions(updated);
    setLoading(false);
  };

  const handleGeneratePortfolio = async () => {
    if (!user) return;
    setPortfolioLoading(true);
    setActiveTab('portfolio');
    
    const portfolioContext = `
      Current Resume/Experience Data: ${text || (file ? `Document ${file.name}` : "See Profile")}
      Top Skills: ${user.skills.join(', ')}
      Key Achievements: ${(user.achievements || []).join(', ')}
      Bio Summary: ${user.bio}
    `;
    
    const result = await generatePortfolio(user, portfolioContext, selectedTemplate, selectedColor);
    setPortfolio(result);
    setPortfolioLoading(false);
    setSaveSuccess(false);
  };

  const handleEmailPortfolio = async () => {
    if (!portfolio || !user) return;
    setIsEmailing(true);
    try {
      await sendPortfolioCode(user.email, user.name, portfolio.html, portfolio.css);
      alert(`Code bundle sent to ${user.email}!`);
      await logActivity('Portfolio Emailed', `Code cluster sent to ${user.email}`);
    } catch (e) {
      alert("Failed to send code bundle.");
    } finally {
      setIsEmailing(false);
    }
  };

  const handleSavePortfolio = async () => {
    if (!portfolio || !user) return;
    setIsSaving(true);
    try {
      await saveUserData('user_portfolio', portfolio);
      await logActivity('Portfolio Saved', `AI portfolio stored in MongoDB for ${user.domain}`);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      alert("Platform error: Failed to save portfolio cluster.");
    } finally {
      setIsSaving(false);
    }
  };

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const blob = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const downloadHTML = () => {
    if (!portfolio) return;
    const fullHTML = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <style>${portfolio.css}</style>\n</head>\n<body>\n${portfolio.html}\n</body>\n</html>`;
    downloadFile(fullHTML, "index.html", "text/html");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4">
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'analyze', label: 'Scan', icon: <Sparkles size={14}/> },
          { id: 'portfolio', label: 'AI Portfolio', icon: <Code size={14}/> },
          { id: 'history', label: 'Records', icon: <History size={14}/> }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} 
            className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition flex items-center gap-2 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-900 text-slate-500 border border-slate-800'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'analyze' && (
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-3xl p-10 text-center relative hover:border-indigo-500 transition group flex flex-col items-center justify-center gap-6">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              <div className="flex flex-col items-center">
                <Upload className="mb-4 text-slate-600 group-hover:text-indigo-500 transition" size={48} />
                <p className="font-black text-slate-300">{file ? file.name : "Ready for Analysis"}</p>
              </div>
              <button onClick={triggerFileSelect} className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white font-black text-xs uppercase tracking-widest transition shadow-xl">
                <FileUp size={18}/> {file ? "Replace File" : "Select CV File"}
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
               <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Version Label</label>
                 <input type="text" value={versionName} onChange={e => setVersionName(e.target.value)} placeholder="e.g. 'Standard V1.0'" className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-sm font-bold text-white focus:border-indigo-500 transition" />
               </div>
               <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Raw Resume Text</label>
                 <textarea value={text} onChange={e => setText(e.target.value)} rows={6} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-sm text-slate-300 font-mono" placeholder="Paste data if file upload is unavailable..." />
               </div>
               <button onClick={handleAnalyze} disabled={loading || (!file && !text)} className="w-full bg-indigo-600 hover:bg-indigo-700 py-5 rounded-2xl font-black text-lg transition flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20">
                {loading ? <Loader2 className="animate-spin" /> : <><Sparkles size={20}/> Execute Scan</>}
               </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 flex flex-col min-h-[500px]">
            {analysis ? (
              <div className="space-y-8 animate-fade-in flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center bg-slate-950 p-6 rounded-[2rem] border border-slate-800 shadow-inner">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">ATS Reliability</p>
                    <div className="text-5xl font-black text-indigo-400">{analysis.score}</div>
                  </div>
                  <button onClick={() => { setActiveTab('portfolio'); handleGeneratePortfolio(); }} className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white transition shadow-lg shadow-emerald-600/20">Architect Portfolio</button>
                </div>
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-3"><CheckCircle2 size={16}/> Dominant Assets</h5>
                  <div className="flex flex-wrap gap-2">
                    {analysis.strengths.map((s, i) => <span key={i} className="px-4 py-2 bg-emerald-500/10 text-emerald-400 text-[10px] rounded-xl border border-emerald-500/20 font-bold">{s}</span>)}
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-3"><Wand2 size={16}/> AI Recommendations</h5>
                  {analysis.sectionSuggestions?.map((s, i) => (
                    <div key={i} className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                      <p className="text-[10px] font-black text-amber-500 uppercase mb-2">{s.section}</p>
                      <p className="text-white text-xs leading-relaxed">{s.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-700 opacity-20">
                <FileText size={64} strokeWidth={1}/>
                <p className="font-black uppercase tracking-widest mt-4">Awaiting Data...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-8">
                <div>
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Layout size={14}/> Template</h4>
                  <div className="space-y-2">
                    {templates.map(t => (
                      <button key={t} onClick={() => setSelectedTemplate(t)} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition ${selectedTemplate === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Palette size={14}/> Accent Color</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {colors.map(c => (
                      <button key={c} onClick={() => setSelectedColor(c)} className={`p-2 rounded-xl text-[10px] font-black uppercase transition border ${selectedColor === c ? 'border-white text-white' : 'border-slate-800 text-slate-500 hover:border-slate-700'}`}>{c}</button>
                    ))}
                  </div>
                </div>
                <button onClick={handleGeneratePortfolio} disabled={portfolioLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20">
                  {portfolioLoading ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16}/>} Generate Portfolio
                </button>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-8 rounded-[2rem] border border-slate-800 gap-6">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-lg shadow-indigo-600/30"><Monitor size={28}/></div>
                    <div>
                      <h3 className="text-2xl font-black">Portfolio Cluster</h3>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{selectedTemplate} • {selectedColor}</p>
                    </div>
                 </div>
                 <div className="flex flex-wrap gap-3">
                    {portfolio && (
                      <>
                        <button onClick={handleEmailPortfolio} disabled={isEmailing} className="flex items-center gap-2 px-6 py-3 bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition">
                          {isEmailing ? <Loader2 className="animate-spin" size={14}/> : <Mail size={14}/>} Email Code
                        </button>
                        <button onClick={handleSavePortfolio} disabled={isSaving} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition border ${saveSuccess ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'}`}>
                          {isSaving ? <Loader2 className="animate-spin" size={14}/> : saveSuccess ? <Check size={14}/> : <Save size={14}/>} 
                          {saveSuccess ? 'Saved' : 'Save'}
                        </button>
                        <button onClick={downloadHTML} className="flex items-center gap-2 px-6 py-3 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition">
                          <Download size={14}/> HTML
                        </button>
                      </>
                    )}
                 </div>
              </div>
              
              {portfolio ? (
                <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden border-8 border-slate-900 shadow-2xl h-[700px] flex flex-col group">
                  <div className="bg-slate-950 p-4 flex justify-between items-center border-b border-slate-800">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    </div>
                  </div>
                  <iframe className="w-full flex-1 bg-white" srcDoc={`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${portfolio.css}</style></head><body>${portfolio.html}</body></html>`} title="Portfolio Preview" />
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-24 text-center">
                   {portfolioLoading ? (
                      <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin"></div>
                          <Code className="absolute inset-0 m-auto text-indigo-500" size={24} />
                        </div>
                        <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Synthesizing {selectedTemplate} Cluster...</p>
                      </div>
                   ) : (
                      <div className="space-y-6">
                        <Code size={64} className="mx-auto text-slate-800 mb-6"/>
                        <h4 className="text-2xl font-black text-slate-500 mb-2">No Portfolio Cluster Found</h4>
                        <p className="text-slate-600 max-w-xs mx-auto text-sm leading-relaxed">Customize and generate your developer showcase above.</p>
                      </div>
                   )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
          {versions.length > 0 ? versions.map(v => (
            <div key={v.id} className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] hover:border-indigo-500 transition group flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-xl font-black text-white group-hover:text-indigo-400 transition">{v.versionName}</h4>
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800"><TrendingUp size={16} className="text-indigo-500"/></div>
                </div>
                <div className="text-5xl font-black text-white mb-6 tracking-tighter">{v.analysis?.score || 0}</div>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 pt-6 border-t border-slate-800">
                <span className="flex items-center gap-2"><History size={12}/> {new Date(v.timestamp).toLocaleDateString()}</span>
                <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition">View Trace</span>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-32 text-center text-slate-700 opacity-30">
              <History size={48} className="mx-auto mb-4"/>
              <p className="font-black uppercase tracking-[0.3em] text-sm">Cluster Records Empty</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Resume;

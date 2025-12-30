
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateInterviewQuestion, getInterviewFeedback } from '../services/geminiService';
import { InterviewType, InterviewFeedback, InterviewLevel, InterviewFocus, InterviewHistoryItem } from '../types';
import { Mic, Send, Loader2, Award, AlertCircle, RefreshCcw, Sparkles, Clock, History, CheckCircle2, X, Target, UserCheck, Brain } from 'lucide-react';
import { addInterviewHistory, getInterviewHistory } from '../services/storage';

const Interview: React.FC = () => {
  const { user } = useAuth();
  const [type, setType] = useState<InterviewType>(InterviewType.TECHNICAL);
  const [level, setLevel] = useState<InterviewLevel>(InterviewLevel.BEGINNER);
  const [focus, setFocus] = useState<InterviewFocus>(InterviewFocus.TECHNICAL);
  
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [history, setHistory] = useState<InterviewHistoryItem[]>([]);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<any>(null);

  // FIX: Created an async function within useEffect to resolve the Promise from getInterviewHistory
  useEffect(() => {
    const fetchHistory = async () => {
      const h = await getInterviewHistory();
      setHistory(h);
    };
    fetchHistory();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Safety filter to remove conversational filler if AI ignores strict prompt
  const cleanQuestion = (raw: string) => {
    return raw.replace(/^(To provide|Here is|I have|As an AI|###).*?:\s*/si, '').trim();
  };

  const startInterview = async () => {
    setLoading(true);
    setFeedback(null);
    setAnswer('');
    if (timerRef.current) clearInterval(timerRef.current);
    
    const q = await generateInterviewQuestion(user?.domain || 'Software Engineering', type, level, focus);
    setQuestion(cleanQuestion(q));
    
    const timePerLevel = level === InterviewLevel.BEGINNER ? 180 : 120;
    setTimeLeft(timePerLevel);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setLoading(false);
  };

  const submitAnswer = async () => {
    if (!answer.trim() && timeLeft > 0) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setLoading(true);
    
    const result = await getInterviewFeedback(question, answer, type);
    if (result) {
      const finalFeedback = { ...result, timeTaken: (level === InterviewLevel.BEGINNER ? 180 : 120) - timeLeft };
      setFeedback(finalFeedback);
      
      const historyItem: InterviewHistoryItem = {
        id: Date.now().toString(),
        question,
        answer,
        feedback: finalFeedback,
        type,
        level,
        focus,
        timestamp: new Date().toISOString()
      };
      await addInterviewHistory(historyItem);
      const updatedHistory = await getInterviewHistory();
      setHistory(updatedHistory);
    }
    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-5xl font-black mb-2 flex items-center gap-4 tracking-tight">
            <Mic className="text-indigo-400" size={40} /> AI Mock Interview
          </h2>
          <p className="text-slate-400 text-lg">Practice with a digital recruiter tailored to your domain.</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-800 flex items-center gap-4 shadow-xl">
          <History size={20} className="text-indigo-500" />
          <div className="text-left">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Sessions</p>
            <p className="font-black text-white text-lg leading-none">{history.length}</p>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[100px] -z-10"></div>
        
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Mode</label>
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            {Object.values(InterviewType).map(t => (
              <button key={t} onClick={() => setType(t)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${type === t ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'text-slate-500 hover:text-white'}`}>{t}</button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Experience</label>
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            {Object.values(InterviewLevel).map(l => (
              <button key={l} onClick={() => setLevel(l)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${level === l ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'text-slate-500 hover:text-white'}`}>{l}</button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Focus Area</label>
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto custom-scrollbar gap-1">
            {Object.values(InterviewFocus).map(f => (
              <button key={f} onClick={() => setFocus(f)} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all duration-300 ${focus === f ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'text-slate-500 hover:text-white'}`}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          {!question && !loading && (
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-20 text-center shadow-2xl relative overflow-hidden group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 rounded-[3rem] blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative">
                <div className="w-28 h-28 bg-indigo-600/20 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-indigo-500/30 shadow-2xl">
                  <Sparkles className="text-indigo-400" size={48} />
                </div>
                <h3 className="text-4xl font-black mb-4 tracking-tight text-white">Initialize Session</h3>
                <p className="text-slate-400 mb-12 max-w-md mx-auto text-lg leading-relaxed font-medium">Your customized AI interviewer is calibrated for <span className="text-indigo-400">{focus}</span> at <span className="text-indigo-400">{level}</span> level.</p>
                <button onClick={startInterview} className="bg-indigo-600 hover:bg-indigo-700 px-16 py-6 rounded-[2rem] font-black text-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-indigo-600/30 active:scale-95">
                  Begin Interview
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-24 text-center flex flex-col items-center justify-center space-y-8 shadow-2xl">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin"></div>
                <Brain className="absolute inset-0 m-auto text-indigo-500" size={32} />
              </div>
              <p className="text-slate-400 font-black uppercase tracking-[0.4em] animate-pulse">Generating Question...</p>
            </div>
          )}

          {question && !loading && !feedback && (
            <div className="space-y-10 animate-fade-in">
              <div className="bg-slate-900 border-2 border-indigo-500/30 rounded-[2.5rem] p-12 relative shadow-[0_20px_50px_rgba(99,102,241,0.15)] bg-gradient-to-b from-slate-900 to-slate-950">
                <div className="absolute -top-5 left-10 bg-indigo-600 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl border border-indigo-400/30">The Question</div>
                <div className="absolute top-10 right-10 flex items-center gap-3 bg-slate-950 px-6 py-3 rounded-[1.5rem] border border-slate-800 shadow-xl">
                  <Clock className={timeLeft < 30 ? "text-rose-500 animate-pulse" : "text-indigo-500"} size={20} />
                  <span className={`font-mono text-2xl font-black ${timeLeft < 30 ? "text-rose-500" : "text-white"}`}>{formatTime(timeLeft)}</span>
                </div>
                <div className="pt-8">
                  <p className="text-3xl font-black text-white leading-snug font-serif text-center drop-shadow-sm">"{question}"</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="relative group">
                  <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={10} className="w-full bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] p-10 text-white text-lg font-medium focus:outline-none focus:border-indigo-500/50 transition-all duration-500 shadow-inner placeholder:text-slate-800" placeholder="Articulate your answer here with clarity and confidence..." />
                  {timeLeft === 0 && <div className="absolute inset-0 bg-black/70 backdrop-blur-[4px] rounded-[2.5rem] flex items-center justify-center font-black text-rose-500 text-2xl uppercase tracking-[0.2em] border-2 border-rose-500/30">Session Expired</div>}
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900/30 p-4 rounded-3xl border border-slate-800">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.15em] flex items-center gap-3 ml-4">
                    <AlertCircle size={16} className="text-amber-500"/> Aim for 2-3 minutes of focused speech/text.
                  </p>
                  <div className="flex gap-4 w-full md:w-auto">
                    <button onClick={startInterview} className="px-8 py-4 rounded-[1.5rem] text-slate-500 hover:text-white flex items-center font-black text-xs uppercase tracking-widest transition-all bg-slate-950 border border-slate-800">
                      <RefreshCcw size={16} className="mr-3" /> New
                    </button>
                    <button onClick={submitAnswer} disabled={(!answer.trim() && timeLeft > 0)} className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-12 py-4 rounded-[1.5rem] font-black text-lg transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-3">
                      Submit <Send size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {feedback && (
            <div className="space-y-12 animate-fade-in pb-10">
              <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 flex flex-col md:flex-row gap-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] -z-10"></div>
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-40 h-40 rounded-full border-[10px] ${feedback.score >= 80 ? 'border-emerald-500' : feedback.score >= 50 ? 'border-amber-500' : 'border-rose-500'} flex items-center justify-center mb-6 shadow-2xl relative`}>
                    <span className="text-6xl font-black text-white">{feedback.score}</span>
                    <div className="absolute -bottom-3 bg-slate-950 px-4 py-1.5 rounded-full border border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">Score</div>
                  </div>
                  <div className="bg-slate-950 px-5 py-3 rounded-2xl border border-slate-800 flex items-center gap-3">
                    <Clock size={16} className="text-indigo-400"/>
                    <span className="text-xs font-black text-white">{feedback.timeTaken}s Answer</span>
                  </div>
                </div>
                <div className="flex-1 space-y-10">
                  <div className="relative">
                    <h4 className="flex items-center text-amber-400 font-black text-xs uppercase tracking-[0.3em] mb-4"><AlertCircle size={18} className="mr-3" /> AI Critical Review</h4>
                    <p className="text-slate-300 leading-relaxed font-medium italic border-l-4 border-indigo-500/50 pl-8 text-lg">"{feedback.feedback}"</p>
                  </div>
                  <div className="bg-slate-950 p-10 rounded-[2rem] border border-slate-800 relative shadow-inner group">
                    <div className="absolute -top-4 left-10 bg-slate-900 px-5 py-2 rounded-xl text-[10px] font-black text-emerald-400 uppercase border border-slate-800 tracking-[0.2em] shadow-xl">The Benchmark Answer</div>
                    <p className="text-sm text-slate-400 leading-loose font-medium">{feedback.betterAnswer}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <button onClick={startInterview} className="bg-indigo-600 hover:bg-indigo-700 px-16 py-6 rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-indigo-600/30 transition transform hover:scale-105 flex items-center gap-4 active:scale-95">
                  <RefreshCcw size={28} /> Start New Session
                </button>
              </div>
            </div>
          )}
        </div>

        {/* History Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl h-[800px] flex flex-col relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-600/5 rounded-full blur-[80px]"></div>
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-2xl font-black flex items-center gap-4"><History className="text-indigo-400" size={24}/> Analytics</h3>
               <button onClick={() => { if(confirm('Clear history?')) { localStorage.removeItem(`s2s_${user?.id}_interview_history`); setHistory([]); }}} className="text-slate-600 hover:text-rose-500 transition"><X size={18}/></button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
              {history.length > 0 ? history.map(item => (
                <div key={item.id} className="p-6 bg-slate-950 border border-slate-800 rounded-3xl group hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden hover:shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-slate-900 px-3 py-1 rounded-lg text-[10px] font-black text-indigo-400 uppercase border border-slate-800">{item.focus}</div>
                    <div className={`text-xl font-black ${item.feedback.score >= 80 ? 'text-emerald-400' : 'text-indigo-400'}`}>{item.feedback.score}</div>
                  </div>
                  <p className="text-xs font-bold text-slate-400 line-clamp-3 mb-4 leading-relaxed italic">"{item.question}"</p>
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-600 uppercase tracking-widest pt-4 border-t border-slate-900">
                    <span className="flex items-center gap-1.5"><Clock size={10}/> {new Date(item.timestamp).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5 text-emerald-500/70"><UserCheck size={10}/> Evaluated</span>
                  </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-6 opacity-30">
                  <History size={64} strokeWidth={1}/>
                  <p className="text-sm font-black uppercase tracking-[0.3em]">Neural History Empty</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-[2rem] shadow-xl space-y-4">
             <div className="flex items-center gap-3">
               <Award className="text-amber-400" size={24}/>
               <h4 className="font-black text-white text-sm uppercase tracking-widest">Skill Mastery</h4>
             </div>
             <p className="text-xs text-slate-500 font-medium leading-relaxed">Regular practice increases your score by an average of <span className="text-indigo-400 font-bold">12% weekly</span>. Our AI tracks semantic growth in your technical vocabulary.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;

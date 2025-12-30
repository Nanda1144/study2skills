
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatWithMentor } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, User, Bot, Loader2, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';

const Assistant: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const stream = await chatWithMentor(history, input);
      
      let fullText = '';
      const modelMsgId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '', timestamp: new Date() }]);

      for await (const chunk of stream) {
        fullText += chunk.text;
        setMessages(prev => prev.map(m => m.id === modelMsgId ? { ...m, text: fullText } : m));
      }
    } catch (e) {
      setMessages(prev => [...prev, { id: 'error', role: 'model', text: 'Connection lost. Try again later.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (id: string, type: 'up' | 'down') => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, feedback: type } : m));
    alert("Thanks for your feedback! This helps the AI learn.");
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-10rem)] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20"><Bot size={20}/></div>
          <div><h2 className="font-bold">Career Mentor AI</h2><p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Active • Ready to help</p></div>
        </div>
        <Sparkles size={20} className="text-amber-400 animate-pulse"/>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-900/50">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
            <Bot size={64} className="opacity-20" />
            <p className="max-w-xs text-center text-sm">Ask me about roadmap priorities, interview tips, or domain specializations!</p>
          </div>
        )}
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${m.role === 'user' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700'}`}>
                {m.role === 'user' ? <User size={16}/> : <Bot size={16}/>}
              </div>
              <div className="space-y-2">
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-950 text-slate-300 border border-slate-800 rounded-tl-none'}`}>
                  {m.text}
                </div>
                {m.role === 'model' && m.text && (
                  <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => handleFeedback(m.id, 'up')} className={`p-1 rounded hover:bg-slate-800 ${m.feedback === 'up' ? 'text-indigo-400' : 'text-slate-600'}`}><ThumbsUp size={14}/></button>
                    <button onClick={() => handleFeedback(m.id, 'down')} className={`p-1 rounded hover:bg-slate-800 ${m.feedback === 'down' ? 'text-rose-400' : 'text-slate-600'}`}><ThumbsDown size={14}/></button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-slate-950 p-4 rounded-2xl border border-slate-800"><Loader2 className="animate-spin text-indigo-500" size={18}/></div></div>}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSend} className="p-6 bg-slate-950 border-t border-slate-800 flex gap-4">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Type your career question..." className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-indigo-500" />
        <button type="submit" disabled={!input.trim() || loading} className="bg-indigo-600 hover:bg-indigo-700 p-4 rounded-2xl text-white transition disabled:opacity-50"><Send size={20}/></button>
      </form>
    </div>
  );
};

export default Assistant;

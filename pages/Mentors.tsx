
import React, { useState } from 'react';
import { Mentor } from '../types';
import { Search, Users, ExternalLink, MessageSquare, Briefcase } from 'lucide-react';

const Mentors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const mentors: Mentor[] = [
    { id: '1', name: 'Dr. Sarah Chen', role: 'Staff Engineer', company: 'Google', expertise: ['Distributed Systems', 'Go', 'Cloud'], imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { id: '2', name: 'James Wilson', role: 'Senior Product Manager', company: 'Atlassian', expertise: ['Product Strategy', 'UI/UX', 'Agile'], imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James' },
    { id: '3', name: 'Priya Sharma', role: 'Lead Data Scientist', company: 'NVIDIA', expertise: ['PyTorch', 'Computer Vision', 'MLOps'], imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' },
    { id: '4', name: 'Marcus Rodriguez', role: 'Security Architect', company: 'Cloudflare', expertise: ['Network Security', 'Rust', 'Web3'], imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
  ];

  const filteredMentors = mentors.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.expertise.some(e => e.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold mb-2 flex items-center">
            <Users className="mr-2 text-indigo-400" /> Industry Mentors
          </h2>
          <p className="text-slate-400">Connect with experts from top-tier engineering companies.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search name, role, skills..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-indigo-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredMentors.map(m => (
          <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:border-indigo-500/30 transition shadow-xl group">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-slate-800 rounded-2xl overflow-hidden border border-slate-700">
                <img src={m.imageUrl} alt={m.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition">{m.name}</h3>
                <p className="text-slate-400 text-sm flex items-center mt-1">
                  <Briefcase size={12} className="mr-1" /> {m.role} @ {m.company}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-8">
              {m.expertise.map(e => (
                <span key={e} className="text-[10px] font-bold uppercase bg-slate-950 border border-slate-800 px-3 py-1 rounded-full text-indigo-400">{e}</span>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => alert("Request sent! Mentors typically respond within 48 hours.")} className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl font-bold text-sm transition">Request Mentorship</button>
              <button className="p-3 bg-slate-800 text-slate-400 rounded-xl hover:text-white"><MessageSquare size={18}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mentors;

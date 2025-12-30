
import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircle, Mail, GraduationCap, MapPin, Edit3, Save, Camera, Sparkles, Loader2, X, Briefcase, Plus, Trash2, Award, CheckCircle2 } from 'lucide-react';
import { editProfileImage } from '../services/geminiService';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isBioEditing, setIsBioEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');
  
  // Profile Details Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editUni, setEditUni] = useState(user?.university || '');
  const [editYear, setEditYear] = useState(user?.year || '');
  const [editDomain, setEditDomain] = useState(user?.domain || '');

  // AI Photo State
  const [imagePrompt, setImagePrompt] = useState('');
  const [editingImage, setEditingImage] = useState(false);

  // New Skills/Achievements State
  const [newSkill, setNewSkill] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  const handleSaveBio = () => {
    if (!user) return;
    updateUser({ ...user, bio });
    setIsBioEditing(false);
  };

  const handleSaveDetails = () => {
    if (!user) return;
    updateUser({
      ...user,
      name: editName,
      university: editUni,
      year: editYear,
      domain: editDomain
    });
    setShowEditModal(false);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newSkill.trim()) return;
    if (user.skills.includes(newSkill.trim())) return setNewSkill('');
    updateUser({ ...user, skills: [...user.skills, newSkill.trim()] });
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    if (!user) return;
    updateUser({ ...user, skills: user.skills.filter(s => s !== skill) });
  };

  const handleAddAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newAchievement.trim()) return;
    updateUser({ ...user, achievements: [...(user.achievements || []), newAchievement.trim()] });
    setNewAchievement('');
  };

  const handleRemoveAchievement = (achievement: string) => {
    if (!user) return;
    updateUser({ ...user, achievements: (user.achievements || []).filter(a => a !== achievement) });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      updateUser({ ...user, profileImage: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleImageEdit = async () => {
    if (!user?.profileImage || !imagePrompt) return;
    setEditingImage(true);
    const result = await editProfileImage(user.profileImage, imagePrompt);
    if (result) updateUser({ ...user, profileImage: result });
    setEditingImage(false);
    setImagePrompt('');
  };

  if (!user) return <div className="text-center py-20">Please sign in to view profile.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] -z-10"></div>
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="relative">
            <div className="w-32 h-32 bg-slate-800 rounded-3xl border-2 border-indigo-500/30 overflow-hidden flex items-center justify-center shadow-2xl">
              {user.profileImage ? (
                <img src={`data:image/png;base64,${user.profileImage}`} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <UserCircle size={64} className="text-slate-600" />
              )}
            </div>
            <input 
              type="file" 
              ref={imageInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
            <button 
              onClick={() => imageInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 bg-indigo-600 p-2 rounded-xl border-4 border-slate-900 hover:bg-indigo-500 transition shadow-xl"
            >
              <Camera size={16} />
            </button>
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 mb-4">
              <div>
                <h2 className="text-4xl font-black mb-1 text-white">{user.name}</h2>
                <p className="text-indigo-400 font-bold flex items-center gap-2">
                  <Briefcase size={16}/> {user.domain} Specialist
                </p>
              </div>
              <button onClick={() => setShowEditModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 rounded-xl hover:bg-indigo-600 hover:text-white transition font-bold text-xs uppercase tracking-widest">
                <Edit3 size={14}/> Edit Details
              </button>
            </div>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <div className="flex items-center text-slate-400 text-xs font-bold bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 shadow-sm">
                <GraduationCap size={14} className="mr-2 text-indigo-500" /> {user.university}
              </div>
              <div className="flex items-center text-slate-400 text-xs font-bold bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 shadow-sm">
                <MapPin size={14} className="mr-2 text-emerald-500" /> {user.year}
              </div>
              <div className="flex items-center text-slate-400 text-xs font-bold bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 shadow-sm">
                <Mail size={14} className="mr-2 text-amber-500" /> {user.email}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center"><Edit3 size={18} className="mr-2 text-indigo-400" /> Professional Bio</h3>
              <button onClick={() => isBioEditing ? handleSaveBio() : setIsBioEditing(true)} 
                className="text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                {isBioEditing ? <><Save size={14} /> Save</> : "Edit"}
              </button>
            </div>
            {isBioEditing ? (
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={6} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-white text-sm focus:outline-none focus:border-indigo-500 transition shadow-inner" placeholder="Tell companies about your passion..." />
            ) : (
              <p className="text-slate-400 leading-relaxed text-sm whitespace-pre-wrap">{user.bio || "No bio added yet. Add one to stand out!"}</p>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Sparkles size={18} className="text-indigo-400" /> Skills Inventory</h3>
              <form onSubmit={handleAddSkill} className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  value={newSkill} 
                  onChange={e => setNewSkill(e.target.value)} 
                  placeholder="Add a skill (e.g. React, Docker...)" 
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 p-3 rounded-xl transition shadow-lg shadow-indigo-600/20">
                  <Plus size={20} />
                </button>
              </form>
              <div className="flex flex-wrap gap-2">
                {user.skills.map(s => (
                  <div key={s} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-2 text-xs font-bold text-slate-300 group">
                    {s}
                    <button onClick={() => handleRemoveSkill(s)} className="text-slate-600 hover:text-rose-500 transition opacity-0 group-hover:opacity-100">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {user.skills.length === 0 && <p className="text-slate-600 text-xs italic">No skills added yet.</p>}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Award size={18} className="text-amber-400" /> Career Achievements</h3>
              <form onSubmit={handleAddAchievement} className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  value={newAchievement} 
                  onChange={e => setNewAchievement(e.target.value)} 
                  placeholder="Add an achievement (e.g. Winner of Hackathon...)" 
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                />
                <button type="submit" className="bg-amber-600 hover:bg-amber-700 p-3 rounded-xl transition shadow-lg shadow-amber-600/20">
                  <Plus size={20} />
                </button>
              </form>
              <div className="space-y-3">
                {(user.achievements || []).map(a => (
                  <div key={a} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <span className="text-sm font-bold text-slate-300">{a}</span>
                    </div>
                    <button onClick={() => handleRemoveAchievement(a)} className="text-slate-600 hover:text-rose-500 transition opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {(user.achievements || []).length === 0 && <p className="text-slate-600 text-xs italic">Share your wins with the world!</p>}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
            <h3 className="text-xl font-bold mb-6 flex items-center"><Sparkles size={18} className="mr-2 text-amber-400" /> AI Photo Studio</h3>
            <p className="text-xs text-slate-500 mb-6">Use AI to transform your profile picture into a professional engineer headshot.</p>
            <div className="flex gap-2">
              <input type="text" value={imagePrompt} onChange={e => setImagePrompt(e.target.value)} placeholder="e.g. 'Make it professional with a suit and office bg'" className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition" />
              <button onClick={handleImageEdit} disabled={editingImage || !user.profileImage} className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 px-6 py-3 rounded-xl font-bold transition flex items-center shadow-lg shadow-amber-600/20">
                {editingImage ? <Loader2 className="animate-spin" /> : 'Magic Edit'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl h-fit">
          <h3 className="text-xl font-bold mb-8">Trophy Case</h3>
          <div className="grid grid-cols-2 gap-4">
            {user.gamification.badges.length ? user.gamification.badges.map(b => (
              <div key={b.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center group hover:border-indigo-500/50 transition">
                <span className="text-3xl mb-2 block group-hover:scale-125 transition">{b.icon}</span>
                <p className="text-[10px] font-black text-white uppercase tracking-wider">{b.name}</p>
              </div>
            )) : <p className="text-slate-500 text-xs text-center col-span-2 py-10 italic">Complete course quizzes to earn trophies!</p>}
          </div>
        </div>
      </div>

      {/* Edit Details Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-10 shadow-2xl relative">
            <button onClick={() => setShowEditModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition"><X/></button>
            <h3 className="text-2xl font-bold mb-8">Update Details</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm outline-none focus:border-indigo-500 transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">University</label>
                <input type="text" value={editUni} onChange={e => setEditUni(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm outline-none focus:border-indigo-500 transition" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Current Year</label>
                  <select value={editYear} onChange={e => setEditYear(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm outline-none focus:border-indigo-500 transition">
                    {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Completed'].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Primary Domain</label>
                  <input type="text" value={editDomain} onChange={e => setEditDomain(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm outline-none focus:border-indigo-500 transition" />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowEditModal(false)} className="flex-1 py-4 bg-slate-950 border border-slate-800 rounded-2xl font-bold hover:bg-slate-800 transition">Cancel</button>
                <button onClick={handleSaveDetails} className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-4 rounded-2xl font-bold shadow-xl transition">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;


import React, { useState, useEffect } from 'react';
import { Course, RoadmapData, Quiz } from '../types';
import { PlayCircle, ExternalLink, Youtube, MonitorPlay, BookOpen, Map, X, PlusCircle, CheckCircle, Sparkles, Brain, Loader2, Search, Star, Clock, Layers } from 'lucide-react';
import { getUserData, saveUserData } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { generateCourseQuiz, discoverCourses } from '../services/geminiService';

const Courses: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [filter, setFilter] = useState<'All' | 'Free' | 'Paid'>('All');
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  const [discoveredCourses, setDiscoveredCourses] = useState<Course[]>([]);
  const [searchTopic, setSearchTopic] = useState('');
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizDifficulty, setQuizDifficulty] = useState<'Easy' | 'Intermediate' | 'Hard'>('Intermediate');

  // Expanded static course list (30+ items)
  const staticCourses: Course[] = [
    { id: 'web1', title: 'React.js Full Course 2024', provider: 'Dave Gray', type: 'Free', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=RVFAyFWO4go', thumbnail: 'https://img.youtube.com/vi/RVFAyFWO4go/maxresdefault.jpg' },
    { id: 'web2', title: 'Node.js Backend Bootcamp', provider: 'Traversy Media', type: 'Free', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=fBNz5xF-Kx4', thumbnail: 'https://img.youtube.com/vi/fBNz5xF-Kx4/maxresdefault.jpg' },
    { id: 'ai1', title: 'Deep Learning Specialization', provider: 'Andrew Ng', type: 'Paid', platform: 'Coursera', url: 'https://www.coursera.org/specializations/deep-learning', thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/4e/d3b00062a411e18b6e63283f60f64c/deep-learning.jpg' },
    { id: 'ai2', title: 'Machine Learning for Beginners', provider: 'freeCodeCamp', type: 'Free', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=GwIo3gDZCVQ', thumbnail: 'https://img.youtube.com/vi/GwIo3gDZCVQ/maxresdefault.jpg' },
    { id: 'cyber1', title: 'Ethical Hacking Full Course', provider: 'Edureka', type: 'Free', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=3Kq1MIfTWCE', thumbnail: 'https://img.youtube.com/vi/3Kq1MIfTWCE/maxresdefault.jpg' },
    { id: 'cloud1', title: 'AWS Certified Cloud Practitioner', provider: 'Digital Cloud', type: 'Paid', platform: 'Udemy', url: '#', thumbnail: 'https://img-c.udemycdn.com/course/480x270/2196488_8fc4_10.jpg' },
    { id: 'dsa1', title: 'Data Structures & Algorithms in Java', provider: 'Kunal Kushwaha', type: 'Free', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=rZ41y631eyE', thumbnail: 'https://img.youtube.com/vi/rZ41y631eyE/maxresdefault.jpg' },
    { id: 'dsa2', title: 'Mastering Linked Lists', provider: 'myCodeSchool', type: 'Free', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=V7mG_C11078', thumbnail: 'https://img.youtube.com/vi/V7mG_C11078/maxresdefault.jpg' },
    { id: 'sql1', title: 'SQL Tutorial for Beginners', provider: 'Programming with Mosh', type: 'Free', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=7S_tz1z_5bA', thumbnail: 'https://img.youtube.com/vi/7S_tz1z_5bA/maxresdefault.jpg' },
    { id: 'devops1', title: 'Docker Crash Course', provider: 'Nana Janashia', type: 'Free', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=3c-iBn7E9dU', thumbnail: 'https://img.youtube.com/vi/3c-iBn7E9dU/maxresdefault.jpg' },
    { id: 'devops2', title: 'Kubernetes Mastery', provider: 'Bret Fisher', type: 'Paid', platform: 'Udemy', url: '#', thumbnail: 'https://img-c.udemycdn.com/course/480x270/1172342_1d5a_6.jpg' },
    { id: 'mobile1', title: 'Flutter & Dart - The Complete Guide', provider: 'Maximilian Schwarzmüller', type: 'Paid', platform: 'Udemy', url: '#', thumbnail: 'https://img-c.udemycdn.com/course/480x270/1704460_405a_9.jpg' },
    { id: 'mobile2', title: 'React Native Crash Course 2024', provider: 'JavaScript Mastery', type: 'Free', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=0-S5a0eXPoc', thumbnail: 'https://img.youtube.com/vi/0-S5a0eXPoc/maxresdefault.jpg' },
    { id: 'lang1', title: 'C++ Full Course for Beginners', provider: 'Bro Code', type: 'Free', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=vLnPwxZdW4Y', thumbnail: 'https://img.youtube.com/vi/vLnPwxZdW4Y/maxresdefault.jpg' },
    { id: 'lang2', title: 'Rust Programming for Beginners', provider: 'Microsoft', type: 'Free', platform: 'Official Docs', url: 'https://learn.microsoft.com/en-us/training/paths/rust-first-steps/', thumbnail: 'https://learn.microsoft.com/en-us/training/achievements/rust-first-steps.svg' },
    { id: 'web3', title: 'Tailwind CSS Tutorial', provider: 'Net Ninja', type: 'Free', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=lCxcTsOHrjo', thumbnail: 'https://img.youtube.com/vi/lCxcTsOHrjo/maxresdefault.jpg' },
    { id: 'web4', title: 'Next.js 14 Masterclass', provider: 'Academind', type: 'Free', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=ZjAqacIC_3c', thumbnail: 'https://img.youtube.com/vi/ZjAqacIC_3c/maxresdefault.jpg' },
    { id: 'blockchain1', title: 'Blockchain Fundamentals', provider: 'Binance Academy', type: 'Free', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=SSo_EIwHSd4', thumbnail: 'https://img.youtube.com/vi/SSo_EIwHSd4/maxresdefault.jpg' },
    { id: 'blockchain2', title: 'Solidity & Ethereum Bootcamp', provider: 'Patrick Collins', type: 'Free', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=gyMwXuJrbFE', thumbnail: 'https://img.youtube.com/vi/gyMwXuJrbFE/maxresdefault.jpg' },
    { id: 'soft1', title: 'Effective Communication for Engineers', provider: 'LinkedIn Learning', type: 'Paid', platform: 'LinkedIn', url: '#', thumbnail: 'https://media.licdn.com/dms/image/C4D0DAQF5E3H5Z3W5w/learning-public-crop_288_512/0/1623192000000?e=1623192000000&v=beta&t=7S_tz1z_5bA' },
    { id: 'data1', title: 'Tableau for Data Visualization', provider: 'Ken Flerlage', type: 'Free', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=7Jl-RwkzqQ4', thumbnail: 'https://img.youtube.com/vi/7Jl-RwkzqQ4/maxresdefault.jpg' },
    { id: 'data2', title: 'PowerBI Masterclass', provider: 'Kevin Stratvert', type: 'Free', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=AGrl-H87pRU', thumbnail: 'https://img.youtube.com/vi/AGrl-H87pRU/maxresdefault.jpg' },
    { id: 'git1', title: 'Git & GitHub Crash Course', provider: 'Colt Steele', type: 'Free', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=nhNq2kIvi9s', thumbnail: 'https://img.youtube.com/vi/nhNq2kIvi9s/maxresdefault.jpg' },
    { id: 'design1', title: 'Figma UI/UX Design Essentials', provider: 'Bring Your Own Laptop', type: 'Paid', platform: 'Udemy', url: '#', thumbnail: 'https://img-c.udemycdn.com/course/480x270/2402120_8fc4_10.jpg' },
    { id: 'design2', title: 'Typography for Web Developers', provider: 'Flux Academy', type: 'Free', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=WvO-jJmY-V4', thumbnail: 'https://img.youtube.com/vi/WvO-jJmY-V4/maxresdefault.jpg' },
    { id: 'testing1', title: 'Cypress E2E Testing', provider: 'Cypress.io', type: 'Free', platform: 'Official Docs', url: 'https://docs.cypress.io', thumbnail: 'https://docs.cypress.io/img/logo.png' },
    { id: 'testing2', title: 'Unit Testing with Jest', provider: 'Leigh Halliday', type: 'Free', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=7r4X6j9KngA', thumbnail: 'https://img.youtube.com/vi/7r4X6j9KngA/maxresdefault.jpg' },
    { id: 'linux1', title: 'Linux Command Line for Beginners', provider: 'Linux Foundation', type: 'Free', platform: 'EdX', url: 'https://www.edx.org/course/introduction-to-linux', thumbnail: 'https://www.edx.org/sites/default/files/course/image/introduction-to-linux.jpg' },
    { id: 'math1', title: 'Linear Algebra for Machine Learning', provider: 'Imperial College London', type: 'Paid', platform: 'Coursera', url: '#', thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/4e/d3b00062a411e18b6e63283f60f64c/math.jpg' },
    { id: 'math2', title: 'Statistics for Data Science', provider: 'Great Learning', type: 'Free', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=Vfo5le26IhY', thumbnail: 'https://img.youtube.com/vi/Vfo5le26IhY/maxresdefault.jpg' },
    { id: 'mineral1', title: 'Mineral Exploration: From Basics to Advanced', provider: 'Udemy Professional', type: 'Paid', platform: 'Udemy', url: '#', thumbnail: 'https://img-c.udemycdn.com/course/480x270/4636412_f7f1_3.jpg' },
    { id: 'exploration1', title: 'The Age of Exploration Series', provider: 'National Geographic', type: 'Free', platform: 'YouTube', url: '#', thumbnail: 'https://img.youtube.com/vi/PdtS6L2WdM4/maxresdefault.jpg' },
    { id: 'earth1', title: 'Imagining Other Earths', provider: 'Princeton University', type: 'Free', platform: 'Coursera', url: '#', thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/97/967d7045b111e49463b3922f307e5f/ImaginingOtherEarths.png' },
    { id: 'python1', title: 'Python for Everyone', provider: 'University of Michigan', type: 'Free', platform: 'Coursera', url: '#', thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/08/33f77045b111e49463b3922f307e5f/PythonForEveryone.jpg' },
  ];

  // FIX: Load user data using async function in useEffect to correctly await storage calls
  useEffect(() => {
    const initCourses = async () => {
      const completed = await getUserData('completed_courses');
      setCompletedCourses(completed || []);
      if (user?.domain) handleDiscover(user.domain);
    };
    initCourses();
  }, [user?.domain]);

  const handleDiscover = async (topic: string) => {
    if (!topic.trim()) return;
    setDiscoveryLoading(true);
    const result = await discoverCourses(topic);
    setDiscoveredCourses(result);
    setDiscoveryLoading(false);
  };

  const handleStartQuiz = async (course: Course) => {
    setQuizLoading(true);
    const quiz = await generateCourseQuiz(course.title, quizDifficulty);
    if (quiz) {
      setActiveQuiz(quiz);
      setQuizAnswers([]);
    }
    setQuizLoading(false);
  };

  const handleQuizSubmit = () => {
    if (!activeQuiz || !user) return;
    let score = 0;
    activeQuiz.questions.forEach((q, i) => { if (quizAnswers[i] === q.correctAnswer) score++; });
    
    const xpBonus = score * 50;
    if (score >= Math.ceil(activeQuiz.questions.length * 0.7)) {
      alert(`Success! Scored ${score}/${activeQuiz.questions.length}. You earned ${xpBonus} XP!`);
      updateUser({ ...user, gamification: { ...user.gamification, xp: user.gamification.xp + xpBonus } });
      const completed = [...completedCourses, activeQuiz.courseId];
      setCompletedCourses(completed);
      saveUserData('completed_courses', completed);
    } else {
      alert(`Failed. Scored ${score}/${activeQuiz.questions.length}. Need 70% to pass. Try again!`);
    }
    setActiveQuiz(null);
  };

  const allCourses = [...staticCourses, ...discoveredCourses];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-4xl font-black mb-2 flex items-center gap-3">
            <BookOpen className="text-indigo-400" size={32}/> Engineering Academy
          </h2>
          <p className="text-slate-400">Master 30+ curated industrial paths and verify your knowledge.</p>
        </div>
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 shadow-lg">
          {['All', 'Free', 'Paid'].map(t => (
            <button key={t} onClick={() => setFilter(t as any)} className={`px-6 py-2 rounded-lg text-sm font-bold ${filter === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white transition'}`}>{t}</button>
          ))}
        </div>
      </div>

      {/* Discovery Tool */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/5 rounded-full blur-[120px] -z-10"></div>
        <div className="flex flex-col md:flex-row items-end gap-6">
          <div className="flex-1 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-3 text-indigo-400"><Sparkles size={20}/> Personalized Discovery</h3>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input type="text" value={searchTopic} onChange={e => setSearchTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleDiscover(searchTopic)} placeholder="Search specialized topics (e.g. Next.js, Kubernetes, ML Basics)..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 pl-14 pr-6 text-white focus:outline-none focus:border-indigo-500 transition shadow-inner placeholder:text-slate-700" />
            </div>
          </div>
          <div className="w-full md:w-80 space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Layers size={12}/> Quiz Difficulty</label>
            <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              {['Easy', 'Intermediate', 'Hard'].map(d => (
                <button key={d} onClick={() => setQuizDifficulty(d as any)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${quizDifficulty === d ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'text-slate-500 hover:text-white'}`}>{d}</button>
              ))}
            </div>
          </div>
          <button onClick={() => handleDiscover(searchTopic)} disabled={discoveryLoading || !searchTopic} className="bg-indigo-600 hover:bg-indigo-700 h-[68px] px-10 rounded-2xl font-black text-lg transition flex items-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-95">
            {discoveryLoading ? <Loader2 className="animate-spin"/> : <Search size={22}/>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allCourses.filter(c => filter === 'All' || c.type === filter).map(course => {
          const isDone = completedCourses.includes(course.id) || completedCourses.includes(course.title);
          return (
            <div key={course.id} className={`bg-slate-900 border rounded-[2rem] overflow-hidden shadow-xl transition-all duration-500 hover:scale-[1.02] hover:border-indigo-500/30 group ${isDone ? 'border-emerald-500/50' : 'border-slate-800'}`}>
              <div className="h-52 bg-slate-800 relative overflow-hidden flex items-center justify-center">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition duration-1000" />
                ) : (
                  <div className="text-slate-700 font-black text-6xl uppercase opacity-20">{course.platform[0]}</div>
                )}
                <div className={`absolute top-5 right-5 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${course.type === 'Free' ? 'bg-emerald-500/80 border-emerald-400/30' : 'bg-indigo-600/80 border-indigo-400/30'}`}>{course.type}</div>
                {course.platform === 'YouTube' && <div className="absolute inset-0 bg-black/10 flex items-center justify-center group-hover:bg-black/0 transition duration-500"><Youtube className="text-red-600 drop-shadow-2xl" size={56}/></div>}
              </div>
              <div className="p-8 space-y-5">
                <div className="flex justify-between items-start gap-4 h-16">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-white leading-tight mb-2 group-hover:text-indigo-400 transition line-clamp-2">{course.title}</h4>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{course.provider} • {course.platform}</p>
                  </div>
                  {isDone && <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/30 shadow-lg animate-bounce-short"><CheckCircle className="text-emerald-500" size={24}/></div>}
                </div>
                <div className="flex gap-3 pt-2">
                  <a href={course.url === '#' ? undefined : course.url} target="_blank" rel="noreferrer" className="flex-1 bg-slate-950 border border-slate-800 hover:bg-slate-800 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition text-center flex items-center justify-center gap-3">
                    <ExternalLink size={16}/> Start
                  </a>
                  <button onClick={() => handleStartQuiz(course)} className="bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white px-5 py-4 rounded-2xl transition-all duration-300 flex items-center gap-3 font-black text-xs group/quiz">
                    {quizLoading ? <Loader2 size={18} className="animate-spin"/> : <Brain size={18} className="group-hover/quiz:rotate-12 transition"/>} Test
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {activeQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-xl p-12 shadow-2xl space-y-10 animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar relative">
            <button onClick={() => setActiveQuiz(null)} className="absolute top-8 right-8 p-3 text-slate-500 hover:text-white transition bg-slate-950 rounded-2xl border border-slate-800"><X size={24}/></button>
            <div className="text-center">
              <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/30 shadow-2xl">
                <Brain className="text-indigo-400" size={40}/>
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight">Skill Verification</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3">{activeQuiz.difficulty} Level • {activeQuiz.courseId}</p>
            </div>
            <div className="space-y-10">
              {activeQuiz.questions.map((q, qIdx) => (
                <div key={qIdx} className="space-y-6">
                  <p className="text-lg font-bold text-white flex gap-4 leading-relaxed">
                    <span className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 text-indigo-400 font-black text-sm">{qIdx + 1}</span>
                    {q.question}
                  </p>
                  <div className="grid gap-3 ml-12">
                    {q.options.map((opt, optIdx) => (
                      <button key={optIdx} onClick={() => {
                        const newAnswers = [...quizAnswers];
                        newAnswers[qIdx] = optIdx;
                        setQuizAnswers(newAnswers);
                      }} className={`p-5 rounded-2xl text-left text-sm font-bold transition-all duration-300 border ${quizAnswers[qIdx] === optIdx ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl scale-[1.02]' : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 pt-6 sticky bottom-0 bg-slate-900/80 backdrop-blur-md pb-4 border-t border-slate-800">
              <button onClick={() => setActiveQuiz(null)} className="flex-1 py-5 bg-slate-950 border border-slate-800 rounded-[1.5rem] font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-800 transition">Discard</button>
              <button onClick={handleQuizSubmit} className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest text-white shadow-2xl shadow-emerald-600/20 transition active:scale-95">Final Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;

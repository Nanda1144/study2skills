
import React from 'react';
import { Mail, Github, Globe, Sparkles } from 'lucide-react';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  return (
    <footer className={`bg-slate-900 border-t border-slate-800 py-12 px-6 mt-auto ${className}`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center font-bold text-sm">S</div>
            <span className="text-lg font-bold text-white tracking-tight">study2skills</span>
          </div>
          <p className="text-slate-500 text-sm max-w-xs">
            Accelerating engineering careers through personalized AI guidance and automated skill matching.
          </p>
          <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            Powered by <Sparkles size={12} className="text-indigo-500" /> Google AI Studio & Gemini
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 text-sm">
          <div className="space-y-3">
            <h4 className="font-bold text-white">Platform</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#/roadmap" className="hover:text-indigo-400 transition">Roadmaps</a></li>
              <li><a href="#/courses" className="hover:text-indigo-400 transition">Courses</a></li>
              <li><a href="#/jobs" className="hover:text-indigo-400 transition">Auto-Apply</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-white">Support</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="mailto:study2skills@gmail.com" className="flex items-center hover:text-indigo-400 transition">
                  <Mail size={14} className="mr-2" /> study2skills@gmail.com
                </a>
              </li>
              <li className="flex items-center text-slate-500 italic">
                All Rights Reserved &copy; 2024
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
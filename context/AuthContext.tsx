
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';
import { getCurrentUser, loginUser, logoutUser, registerUser, updateUserProfile } from '../services/storage';

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password?: string) => Promise<void>;
  register: (profile: UserProfile, password?: string) => Promise<void>;
  loginGuest: () => void;
  logout: () => void;
  updateUser: (profile: UserProfile) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getCurrentUser();
    
    // Logic Fix: Only restore real users. 
    // If it's a guest or null, stay as null to force Landing page.
    if (storedUser && storedUser.role !== 'guest') {
      setUser(storedUser);
    } else if (storedUser && storedUser.role === 'guest') {
      // Clean up old guest artifacts
      logoutUser(); 
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (id: string, pass?: string) => {
    setLoading(true);
    try {
      const u = await loginUser(id, pass);
      setUser(u);
    } catch (err) {
      console.error(err);
      throw err;
    } finally { setLoading(false); }
  };

  const register = async (profile: UserProfile, pass?: string) => {
    setLoading(true);
    try {
      const u = await registerUser(profile, pass);
      localStorage.setItem('study2skills_session_db', JSON.stringify(u));
      setUser(u);
    } catch (err) {
      console.error(err);
      throw err;
    } finally { setLoading(false); }
  };

  const loginGuest = () => {
    const guest: UserProfile = {
      id: 'guest', name: 'Guest Explorer', email: 'guest@demo.com',
      contactMethod: 'email', university: 'Visitor', year: 'N/A', domain: 'Full Stack Development',
      skills: ['React', 'Node.js'], achievements: [], bio: 'Exploring platform as a guest.', role: 'guest', status: 'active',
      gamification: { xp: 100, level: 1, badges: [], streakDays: 1, studyHoursTotal: 0 }
    };
    // Guest is purely transient, no localStorage.setItem
    setUser(guest);
  };

  const logout = () => { 
    logoutUser(); 
    setUser(null); 
  };

  const updateUser = (p: UserProfile) => {
    if (p.role !== 'guest') updateUserProfile(p);
    setUser(p);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginGuest, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth outside provider");
  return c;
};

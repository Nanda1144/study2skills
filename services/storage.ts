
import { UserProfile, AdminStats, JobHistoryItem, ResumeVersion, RoadmapData, ResumeAnalysis, InterviewHistoryItem } from '../types';

const BASE_URL = 'http://localhost:5000/api';
const SESSION_KEY = 'study2skills_session_db';

// Internal state to track server availability
let isServerOnline = true;

/**
 * Robust fetch wrapper with Offline-First Fallback
 */
const apiFetch = async (path: string, options: RequestInit = {}) => {
  if (!isServerOnline && !path.includes('auth')) {
    // If we know the server is down, don't even try for background syncs
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout for fast failure

    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error('Network Sync Failure');
    isServerOnline = true;
    return response.json();
  } catch (e) {
    if (isServerOnline) {
      console.warn(`[RealTime-Sync] Backend Unreachable at ${path}. Switching to Local-Only mode.`);
      isServerOnline = false;
    }
    return null;
  }
};

export const getCurrentUser = (): UserProfile | null => {
  const s = localStorage.getItem(SESSION_KEY);
  return s ? JSON.parse(s) : null;
};

// --- AUTOMATED SYNC ENGINE ---

export const saveUserData = async (collection: string, data: any) => {
  const user = getCurrentUser();
  if (!user || user.role === 'guest') return;
  
  // Always save locally first (Persistence Layer)
  localStorage.setItem(`local_sync_${collection}_${user.id}`, JSON.stringify(data));
  
  // Attempt background sync to MongoDB
  return apiFetch(`/data/${user.id}/${collection}`, { 
    method: 'POST', 
    body: JSON.stringify({ data }) 
  });
};

export const getUserData = async (collection: string) => {
  const user = getCurrentUser();
  if (!user) return null;

  // Try API first
  const cloudData = await apiFetch(`/data/${user.id}/${collection}`);
  if (cloudData) return cloudData;

  // Fallback to local persistence if offline
  const localData = localStorage.getItem(`local_sync_${collection}_${user.id}`);
  return localData ? JSON.parse(localData) : null;
};

// --- ENTITY SYNC WRAPPERS ---

export const saveRoadmapToHistory = async (data: RoadmapData) => {
  await saveUserData('roadmap_history', data);
  await logActivity('Roadmap Synced', `New neural path generated for ${data.domain}`);
};

export const getRoadmapHistory = async (): Promise<RoadmapData[]> => {
  const history = await getUserData('roadmap_history');
  return history ? (Array.isArray(history) ? history : [history]) : [];
};

export const saveResumeVersion = async (content: string, name: string, analysis?: ResumeAnalysis) => {
  const user = getCurrentUser();
  if (!user) return;
  const versions = (await getUserData('resume_versions')) || [];
  const newVersion: ResumeVersion = {
    id: Date.now().toString(),
    content,
    versionName: name,
    timestamp: new Date().toISOString(),
    analysis
  };
  const updatedVersions = [newVersion, ...versions];
  await saveUserData('resume_versions', updatedVersions);
  await logActivity('Resume Scanned', `Scored ${analysis?.score}% matching ${analysis?.matchedDomain}`);
};

export const getResumeVersions = async (): Promise<ResumeVersion[]> => {
  return (await getUserData('resume_versions')) || [];
};

// --- AUTH & PROFILE SYNC ---

export const registerUser = async (profile: UserProfile, password?: string) => {
  const payload = { ...profile, passwordHash: password, id: Date.now().toString() };
  
  // Try remote register
  const user = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
  
  // If server is down, register locally to allow the app to be used
  const finalUser = user || payload;
  localStorage.setItem(SESSION_KEY, JSON.stringify(finalUser));
  await logActivity('User Registered', `Identity created: ${finalUser.email}`);
  
  return finalUser;
};

export const loginUser = async (email: string, password?: string) => {
  // Try remote login
  const user = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    await logActivity('Session Started', `Success login for ${email}`);
    return user;
  }

  // If server is down, check local storage for this specific user (Simulation)
  const localSession = getCurrentUser();
  if (localSession && localSession.email === email) {
    return localSession;
  }
  
  throw new Error('Login failed. Ensure backend is running or credentials match local session.');
};

export const logoutUser = () => {
  logActivity('Session Ended', 'Safe sign-out completed.');
  localStorage.removeItem(SESSION_KEY);
};

export const updateUserProfile = async (p: UserProfile) => {
  const updated = await apiFetch(`/users/${p.id}`, { method: 'PUT', body: JSON.stringify(p) });
  const final = updated || p;
  localStorage.setItem(SESSION_KEY, JSON.stringify(final));
  return final;
};

// --- ANALYTICS & MONITORING ---

export const getAdminStats = async (): Promise<AdminStats> => {
  const stats = await apiFetch('/admin/stats');
  return stats || {
    totalUsers: 1,
    activeUsers: 1,
    growth: 0,
    domainDistribution: [{ name: 'Development', value: 1 }]
  };
};

export const getUsers = () => apiFetch('/users');
export const getActivityLogs = () => apiFetch('/logs');

export const logActivity = (action: string, details: string) => {
  const user = getCurrentUser();
  if (!user || user.role === 'guest') return;
  return apiFetch('/logs', { 
    method: 'POST', 
    body: JSON.stringify({ 
      userId: user.id, 
      userName: user.name, 
      action, 
      details,
      timestamp: new Date().toISOString()
    }) 
  });
};

export const getJobHistory = async () => (await getUserData('job_history')) || [];
export const addJobHistory = async (item: JobHistoryItem) => {
  const history = await getJobHistory();
  await saveUserData('job_history', [item, ...history]);
};

export const getInterviewHistory = async () => (await getUserData('interview_history')) || [];
export const addInterviewHistory = async (item: InterviewHistoryItem) => {
  const history = await getInterviewHistory();
  await saveUserData('interview_history', [item, ...history]);
};

export const getLeaderboardData = async () => {
  const users = await getUsers();
  if (!users) return [];
  return users.sort((a: any, b: any) => (b.gamification?.xp || 0) - (a.gamification?.xp || 0));
};

export const deleteUser = async (id: string) => apiFetch(`/users/${id}`, { method: 'DELETE' });

export const toggleUserStatus = async (id: string) => {
  const users = await getUsers();
  const user = users?.find((u: UserProfile) => u.id === id);
  if (!user) return null;
  const updatedUser = { ...user, status: user.status === 'active' ? 'disabled' : 'active' };
  return updateUserProfile(updatedUser);
};

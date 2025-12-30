
export interface RoadmapItem {
  semester: number;
  focus: string;
  skills: string[];
  projects: string[];
  resources: string[];
  projectIdeas?: string[];
}

export interface RoadmapData {
  _id?: string; // MongoDB Document ID
  userId?: string;
  domain: string;
  roadmap: RoadmapItem[];
}

export interface ResumeVersion {
  id: string; // Used for local lookup
  _id?: string; // MongoDB Document ID
  content: string;
  timestamp: string;
  versionName: string;
  analysis?: ResumeAnalysis;
}

export interface ResumeAnalysis {
  score: number;
  matchedDomain: string;
  missingSkills: string[];
  strengths: string[];
  improvementPlan: string[];
  sectionSuggestions?: { section: string; current: string; suggestion: string }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  feedback?: 'up' | 'down';
}

export interface InterviewFeedback {
  score: number;
  feedback: string;
  betterAnswer: string;
  timeTaken?: number;
}

export enum InterviewType {
  TECHNICAL = 'Technical',
  BEHAVIORAL = 'Behavioral',
  SKEPTICAL_CTO = 'Skeptical CTO'
}

export enum InterviewLevel {
  BEGINNER = 'Beginner',
  EXPERIENCED = 'Experienced'
}

export enum InterviewFocus {
  PROJECTS = 'Projects',
  SKILLS = 'Skills',
  TECHNICAL = 'Technical',
  GENERAL = 'General',
  APTITUDE = 'Aptitude'
}

export interface InterviewHistoryItem {
  _id?: string;
  id: string;
  question: string;
  answer: string;
  feedback: InterviewFeedback;
  type: InterviewType;
  level: InterviewLevel;
  focus: InterviewFocus;
  timestamp: string;
}

export interface IndustryTrend {
  name: string;
  demand: number;
  growth: number;
}

export interface InsightsResponse {
  trends: IndustryTrend[];
  sources: { title: string; uri: string }[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  dateEarned: string;
}

export interface Milestone {
  id: string;
  label: string;
  target: number;
  current: number;
  reward: number;
  completed: boolean;
}

export interface UserGamification {
  xp: number;
  level: number;
  badges: Badge[];
  streakDays: number;
  studyHoursTotal: number;
  milestones?: Milestone[];
}

export interface UserProfile {
  id: string;
  _id?: string; // MongoDB Document ID
  name: string;
  email: string;
  password?: string;
  phone?: string;
  contactMethod: 'email' | 'phone';
  university: string;
  year: string;
  domain: string;
  age?: string;
  mobile?: string;
  yearOfPassing?: string;
  skills: string[];
  achievements: string[];
  bio: string;
  role: 'student' | 'admin' | 'guest';
  status: 'active' | 'disabled';
  gamification: UserGamification;
  profileImage?: string;
}

export interface JobHistoryItem {
  id: string;
  _id?: string;
  company: string;
  role: string;
  date: string;
  status: 'Applied' | 'Interviewing' | 'Rejected' | 'Accepted';
}

export interface JobAutomation {
  id: string;
  role: string;
  company: string;
  status: 'Scanning' | 'Tailoring Resume' | 'Generating Cover Letter' | 'Emailing' | 'Applied';
  matchScore: number;
  coverLetter?: string;
  tailoredSummary?: string;
  requiredSkills?: string[];
  description?: string;
  requirements?: string[];
  benefits?: string[];
  url?: string;
}

export interface PortfolioData {
  html: string;
  css: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  growth: number;
  domainDistribution: { name: string; value: number }[];
}

export interface Quiz {
  courseId: string;
  difficulty: 'Easy' | 'Intermediate' | 'Hard';
  questions: { question: string; options: string[]; correctAnswer: number }[];
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  type: 'Free' | 'Paid';
  platform: string;
  url: string;
  thumbnail?: string;
  domain?: string;
}

export interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  expertise: string[];
  imageUrl: string;
}

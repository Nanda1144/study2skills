
import { GoogleGenAI, Type } from "@google/genai";
import { RoadmapData, ResumeAnalysis, InterviewFeedback, InsightsResponse, UserProfile, Quiz, PortfolioData, Course, AdminStats, IndustryTrend } from "../types";
import { saveRoadmapToHistory, saveUserData } from "./storage";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Enhanced Roadmap Generation with Schema
 */
export const generateRoadmap = async (domain: string, semesters: number[] = [1,2,3,4,5,6,7,8]): Promise<RoadmapData | null> => {
  const ai = getAI();
  const prompt = `Create an elite engineering career roadmap for a student specialized in: "${domain}". Focus on semesters: ${semesters.join(', ')}. Provide core skills, project ideas, and resources for each milestone.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            domain: { type: Type.STRING },
            roadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  semester: { type: Type.INTEGER },
                  focus: { type: Type.STRING },
                  skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  projects: { type: Type.ARRAY, items: { type: Type.STRING } },
                  projectIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
                  resources: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["semester", "focus", "skills", "projects"]
              }
            }
          },
          required: ["domain", "roadmap"]
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text) as RoadmapData;
      await saveRoadmapToHistory(data);
      return data;
    }
    return null;
  } catch (error) {
    console.error("Roadmap Generation Error:", error);
    return null; 
  }
};

/**
 * Enhanced Job Discovery with Search Grounding & Schema
 */
export const discoverJobs = async (domain: string, skills: string[]): Promise<any[]> => {
  const ai = getAI();
  const prompt = `Search for 5 ACTIVE job openings for ${domain} engineering positions suitable for students or freshers. Skills: ${skills.join(', ')}. Use recent web data.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              role: { type: Type.STRING },
              company: { type: Type.STRING },
              matchScore: { type: Type.NUMBER },
              url: { type: Type.STRING },
              description: { type: Type.STRING },
              requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
              benefits: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["role", "company", "matchScore"]
          }
        }
      }
    });

    if (response.text) {
      const results = JSON.parse(response.text);
      // Ensure IDs are unique for the frontend
      return results.map((job: any) => ({
        ...job,
        id: job.id || Math.random().toString(36).substr(2, 9),
        status: 'Scanning'
      }));
    }
    return [];
  } catch (e) { 
    console.error("Job Discovery Error:", e);
    return []; 
  }
};

/**
 * Automated Application Content Generation
 */
export const generateJobApplication = async (role: string, company: string, profile: UserProfile) => {
  const ai = getAI();
  const prompt = `Act as a recruitment assistant. Write a tailored cover letter and a 3-sentence role-specific summary for a candidate applying to ${role} at ${company}. Candidate Name: ${profile.name}. Domain: ${profile.domain}.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coverLetter: { type: Type.STRING },
            tailoredSummary: { type: Type.STRING }
          },
          required: ["coverLetter", "tailoredSummary"]
        }
      }
    });
    return response.text ? JSON.parse(response.text) : { coverLetter: "Application drafted.", tailoredSummary: "Qualified engineer." };
  } catch (e) {
    return { coverLetter: "Error drafting letter.", tailoredSummary: "Profile synthesis failed." };
  }
};

/**
 * AI analysis of resume text or file input
 */
export const analyzeResume = async (input: string, isFile: boolean = false, mimeType: string = ''): Promise<ResumeAnalysis | null> => {
  const ai = getAI();
  const systemPrompt = `Analyze this resume against the domain of engineering. Calculate an ATS score and identify strengths/missing skills. Return JSON.`;
  try {
    const contents = isFile 
      ? { parts: [{ inlineData: { mimeType, data: input } }, { text: systemPrompt }] }
      : { parts: [{ text: `${systemPrompt}\n\nResume Text:\n${input}` }] };
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            matchedDomain: { type: Type.STRING },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvementPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
            sectionSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  section: { type: Type.STRING },
                  current: { type: Type.STRING },
                  suggestion: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    return response.text ? (JSON.parse(response.text) as ResumeAnalysis) : null;
  } catch (error) { return null; }
};

/**
 * Interactive chat with a specialized career mentor
 */
export const chatWithMentor = async (history: any[], message: string) => {
  const ai = getAI();
  const chat = ai.chats.create({ model: "gemini-3-flash-preview", history });
  return chat.sendMessageStream({ message });
};

/**
 * Generate personal portfolio source code using AI
 */
export const generatePortfolio = async (profile: UserProfile, resumeContent: string, template: string = 'Glassmorphism', color: string = 'Indigo'): Promise<PortfolioData> => {
  const ai = getAI();
  const prompt = `Generate a high-end personal portfolio in ${template} style with ${color} accent. Candidate: ${profile.name}. Bio: ${profile.bio}. Return HTML/CSS in JSON.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          html: { type: Type.STRING },
          css: { type: Type.STRING }
        }
      }
    }
  });
  return response.text ? JSON.parse(response.text) : { html: "", css: "" };
};

/**
 * Get real-time market insights grounded in search data
 */
export const getMarketInsights = async (domain: string): Promise<InsightsResponse> => {
  const ai = getAI();
  const prompt = `Deep market analysis for ${domain}. Find trending skills, demand %, and growth %. Ground in Search.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { 
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trends: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  demand: { type: Type.NUMBER },
                  growth: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    });
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => c.web && { title: c.web.title, uri: c.web.uri }).filter(Boolean) || [];
    const parsed = response.text ? JSON.parse(response.text) : { trends: [] };
    return { trends: parsed.trends, sources };
  } catch (error) { return { trends: [], sources: [] }; }
};

/**
 * Evaluation and feedback for mock interview answers
 */
export const getInterviewFeedback = async (question: string, answer: string, type: string): Promise<InterviewFeedback | null> => {
  const ai = getAI();
  const prompt = `Evaluate Answer: ${answer} to Question: ${question}. Return JSON with score, feedback, betterAnswer.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.INTEGER },
          feedback: { type: Type.STRING },
          betterAnswer: { type: Type.STRING }
        }
      }
    }
  });
  return response.text ? JSON.parse(response.text) : null;
};

/**
 * Generate a specialized interview question for the candidate
 */
export const generateInterviewQuestion = async (domain: string, type: string, level: string, focus: string) => {
  const ai = getAI();
  const prompt = `Generate ONE tough ${type} interview question for ${domain} role at ${level} level. Focus: ${focus}. Return ONLY the question.`;
  const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: prompt });
  return response.text || "Describe a complex technical challenge you solved.";
};

/**
 * Discover relevant learning courses for a topic
 */
export const discoverCourses = async (topic: string): Promise<Course[]> => {
  const ai = getAI();
  const prompt = `Find 10 courses for ${topic}. Return JSON list.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return response.text ? JSON.parse(response.text) : [];
};

/**
 * Generate a validation quiz for a course
 */
export const generateCourseQuiz = async (courseTitle: string, difficulty: string): Promise<Quiz | null> => {
  const ai = getAI();
  const prompt = `Generate a 5 question quiz for ${courseTitle}. Return JSON.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return response.text ? JSON.parse(response.text) : null;
};

/**
 * Edit profile images using AI generation
 */
export const editProfileImage = async (base64: string, prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ inlineData: { data: base64, mimeType: 'image/png' } }, { text: prompt }] }
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return part.inlineData.data;
  }
  return null;
};

/**
 * Generate strategic growth plan for administrative use
 */
export const generateAdminPlanner = async (stats: AdminStats | null): Promise<string> => {
  const ai = getAI();
  const prompt = `Act as a senior platform strategist. Based on these admin stats: ${JSON.stringify(stats)}, generate a detailed 90-day strategic growth plan for the study2skills engineering career platform. Focus on user engagement, domain expansion, and feature prioritization.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
    });
    return response.text || "Strategic plan generation failed.";
  } catch (error) {
    return "Error generating strategic plan.";
  }
};

/**
 * Generate monthly executive performance report
 */
export const generateMonthlyReport = async (stats: AdminStats | null, logs: any[]): Promise<string> => {
  const ai = getAI();
  const prompt = `Generate an executive monthly performance report. Stats: ${JSON.stringify(stats)}. Recent Activity Logs: ${JSON.stringify(logs.slice(0, 20))}. Analyze growth, platform stability, and user success metrics. Format as a professional report.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
    });
    return response.text || "Monthly report generation failed.";
  } catch (error) {
    return "Error generating monthly report.";
  }
};

/**
 * Extract intelligence insights about the user base
 */
export const generateUserIntelligence = async (users: UserProfile[]): Promise<string[]> => {
  const ai = getAI();
  const prompt = `Analyze this list of engineering candidates: ${JSON.stringify(users.map(u => ({ name: u.name, domain: u.domain, skills: u.skills, xp: u.gamification.xp })))}. 
  Provide 3-5 concise, high-value intelligence insights about their collective skills, interests, and potential for recruiters. Return as a JSON array of strings.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return response.text ? JSON.parse(response.text) : ["No intelligence gathered yet."];
  } catch (error) {
    return ["Error generating user intelligence."];
  }
};

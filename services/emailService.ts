
// EmailJS Configuration - Prioritize Environment Variables
const SERVICE_ID = process.env.EMAIL_SERVICE_ID || 'service_hz6vn3i'; 
const TEMPLATE_ID = process.env.EMAIL_TEMPLATE_ID || 'template_en1vr8t';
// Key Logic: Prioritize .env, then check if placeholder is used
const PUBLIC_KEY = process.env.EMAIL_PUBLIC_KEY || 'YOUR_EMAILJS_PUBLIC_KEY'; 

/**
 * Core Email Relay Function
 */
export const sendEmail = async (to: string, subject: string, body: string, templateParams: any = {}) => {
  const isKeyPlaceholder = !PUBLIC_KEY || PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY' || (PUBLIC_KEY as string).trim() === '';

  if (isKeyPlaceholder) {
    console.warn("[Email-Cluster] Simulation Mode Active.");
    alert(`[EMAIL SIMULATION MODE]\nA message would be sent to: ${to}\n\nSubject: ${subject}\n\n${body}`);
    return true; 
  }

  const payload = {
    service_id: SERVICE_ID,
    template_id: TEMPLATE_ID,
    user_id: PUBLIC_KEY,
    template_params: {
      to_email: to,
      subject: subject,
      message: body, 
      ...templateParams 
    }
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return response.ok;
  } catch (e) {
    console.error("[Email-Cluster] Error:", e);
    return false;
  }
};

/**
 * 1. OTP Verification Structure
 */
export const sendOTP = async (email: string, otp: string) => {
  const body = `Hello Future Engineer,\n\nYour security code is: ${otp}\n\nThis code expires in 10 minutes. If you did not request this, please ignore this email.\n\n— study2skills Security`;
  return sendEmail(email, `[study2skills] Security Code: ${otp}`, body, { otp_code: otp });
};

/**
 * 2. Resume Analysis Structure
 */
export const sendResumeAnalysis = async (email: string, analysis: any, domain: string, name: string) => {
  const strengths = (analysis.strengths || []).map((s: string) => `• ${s}`).join('\n');
  const plan = (analysis.improvementPlan || []).map((p: string) => `• ${p}`).join('\n');
  
  const body = `Resume Synthesis Complete\n--------------------------------------------------\nMatch Score: ${analysis.score}%\nTarget Role: ${domain}\n\nStrengths Identified:\n${strengths}\n\nImprovement Plan:\n${plan}\n\nRecommended: Update your profile projects to match hiring trends.`;
  
  return sendEmail(email, `Resume Scan Result: ${analysis.score}% Match`, body);
};

/**
 * 3. Portfolio Code Structure
 */
export const sendPortfolioCode = async (email: string, name: string, html: string, css: string) => {
  const body = `Portfolio Bundle for ${name}\n--------------------------------------------------\nYour AI portfolio code is ready.\n\n[index.html]\n${html}\n\n[styles.css]\n${css}\n\nInstructions: Save these as separate files to deploy locally.`;
  
  return sendEmail(email, `AI Portfolio Cluster: Source Code Bundle`, body);
};

/**
 * 4. Job Match Alert Structure
 */
export const sendJobAlert = async (email: string, job: any, name: string) => {
  const body = `New Opportunity Match\n--------------------------------------------------\nRole: ${job.role}\nCompany: ${job.company}\nAI Match Score: ${Math.round(job.matchScore)}%\n\nWhy this fits: ${job.description || 'Highly aligned skills detected.'}\n\nView Listing: ${job.url || 'study2skills Dashboard'}`;
  
  return sendEmail(email, `New Job Match: ${job.role} @ ${job.company}`, body);
};

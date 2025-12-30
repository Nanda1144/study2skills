study2skills | AI Engineering Career Accelerator

study2skills is a world-class, AI-driven career acceleration platform specifically architected for engineering students. It bridges the gap between academic learning and industrial placement using the Gemini 3 Pro intelligence engine.

🚀 Vision
To provide every engineering student with a personal AI Architect that generates curriculum roadmaps, optimizes professional identities (Resumes/Portfolios), and automates the job application lifecycle through real-time market grounding.
🛠 Tech Stack
Frontend & UI/UX
React 19 & TypeScript: Type-safe, high-performance component architecture.
Tailwind CSS: Modern, high-fidelity "Glassmorphism" and "Cyberpunk" aesthetics.
Lucide React: Precision iconography.
Recharts: Real-time data visualization for skill metrics and market trends.
Backend & Persistence
Node.js & Express: Lightweight, scalable API bridge.
MongoDB Cluster: Real-time data synchronization for user roadmaps, job history, and analytics.
Offline-First Storage: LocalStorage persistence with an automated background sync engine.
AI Intelligence (Google Gemini API)
Gemini 3 Pro Preview: High-reasoning tasks (Roadmap generation, Resume analysis).
Gemini 3 Flash Preview: Low-latency interactions (Career Mentor Chat, Course Discovery).
Gemini 2.5 Flash Image: Professional AI Photo Editing.
Google Search Grounding: Real-time job discovery and market trend analysis.
💎 Core Features
1. Elite Roadmap Generator
AI-synthesized learning paths mapped across 8 semesters. Unlike static guides, these roadmaps are generated dynamically based on the specific engineering domain (e.g., AI Research, DevOps, Full-Stack).
2. Resume AI & ATS Analyzer
Semantic analysis of resumes against industrial benchmarks. It provides a match score, identifies missing skills, and offers section-by-section suggestions to beat modern ATS filters.
3. Automated Jobs Hub
An "Auto-Pilot" application engine.
Discovery: Scans the web for active roles using Google Search grounding.
Tailoring: Automatically generates custom cover letters and summaries for every specific role.
Tracking: Logs every application in a centralized MongoDB-backed history.
4. AI Portfolio Cluster
Generates production-ready HTML/CSS code for personal portfolios. Students can choose from multiple design templates (Glassmorphism, Minimalist, Bento) and receive a code bundle via email.
5. Mock Interview Suite
Voice and text-based simulation with three distinct personas:
Technical Interviewer: Focuses on core stack.
Behavioral Coach: Focuses on soft skills.
Skeptical CTO: High-pressure technical grilling.
6. Admin Command Center
An executive dashboard for platform oversight:
AI Growth Planner: 90-day strategic plans generated based on platform stats.
User Intelligence: AI-extracted insights from the student collective.
Operational Logs: Live stream of system-wide neural activity.
📧 Multi-Template Email System
The platform utilizes EmailJS for professional communications. To ensure high engagement, we use specialized templates for different triggers:
Template Type	Key Dynamic Fields	Usage
OTP Security	{{otp_code}}, {{expiry}}	Identity verification during signup.
Resume Report	{{match_score}}, {{strengths_list}}	Sending deep analysis results to users.
Portfolio Bundle	{{html_code}}, {{css_code}}	Delivering source code for local deployment.
Job Alert	{{job_role}}, {{company_name}}	Notifying users of high-match opportunities.
⚙️ Environment Configuration
Create a .env file in the project root to enable full AI and Email functionality:
code
Env
# Google Gemini API Key
API_KEY=your_gemini_api_key_here

# Backend Configuration (Optional for Local Mode)
PORT=5000
MONGODB_URI=mongodb+srv://...

# EmailJS Configuration
EMAIL_SERVICE_ID=service_xxxxxxx
EMAIL_PUBLIC_KEY=user_xxxxxxxxxxxxxx

# Specialized Template IDs
EMAIL_OTP_TEMPLATE_ID=template_otp_id
EMAIL_RESUME_TEMPLATE_ID=template_resume_id
EMAIL_PORTFOLIO_TEMPLATE_ID=template_port_id
EMAIL_JOB_TEMPLATE_ID=template_job_id
📁 Directory Structure
code
Text
├── components/          # Shared UI Components (Sidebar, Footer)
├── context/             # React Context (Auth, Theme)
├── pages/               # Functional Modules (Dashboard, Jobs, Resume, etc.)
├── services/            # Logic Layer
│   ├── geminiService.ts # AI Orchestration (Pro/Flash/Image)
│   ├── emailService.ts  # Multi-Template Relay
│   └── storage.ts       # MongoDB & LocalSync Logic
├── types.ts             # Global TypeScript Interfaces
├── App.tsx              # Routing & Layout Root
├── index.html           # Meta tags & Import Maps
└── metadata.json        # Permissions (Camera/Mic)
🛠 Installation & Setup
Clone the Repository:
code
Bash
git clone https://github.com/your-repo/study2skills.git
cd study2skills
Install Dependencies:
code
Bash
npm install
Start the Backend (MongoDB Bridge):
code
Bash
node server.js
Start the Frontend:
code
Bash
npm run dev
🛡 Security & Ethics
Guest Mode: Allows exploration without data persistence.
LocalSync: Personal data is stored on the user's device first.
AI Grounding: Every insight provided by Gemini is grounded in recent web data to prevent hallucinations.

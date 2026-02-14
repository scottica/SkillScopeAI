# SkillScope AI

## 📌 Overview
SkillScope AI is an advanced, AI-powered tool designed to provide personalized and actionable role-specific skill gap analyses. By comparing a user's resume against a targeted job description, it delivers a comprehensive fit assessment, identifies critical skill gaps, and generates a concrete upskilling plan to help candidates land their desired roles. 

This project was built in collaboration with a 3-member team, focusing on system design, database integration, and cloud deployment. It has been presented to the UBC Cloud Innovation Centre (CIC) and AWS staff.

## ✨ Key Features
* **Intelligent Fit Assessment:** Generates an overall fit score (0-100) and a verdict (strong, moderate, or weak fit) based on rigorous resume analysis, providing a clear rationale for the score.
* **Granular Gap Analysis:** Accurately identifies missing core skills, shallow skills, experience gaps, and credential gaps without fabricating facts.
* **Evidence Mapping:** Cross-references job requirements with explicit resume evidence, assigning a confidence rating (low, medium, or high) to each match.
* **Actionable Recommendations:** Outputs a structured JSON payload containing:
    * A personalized upskilling plan with recommended resource types and timelines.
    * Suggestions for portfolio projects with defined acceptance criteria.
    * Concrete, metric-driven resume tweaks.
    * Tailored cover letter points and interview preparation strategies.
* **Scalable Chunking Architecture:** Automatically chunks large resume texts to ensure robust processing within LLM token limits.

## ⚙️ Technical Implementation & Stack
* **Language:** TypeScript, Node.js
* **AI/LLM:** AWS Bedrock (`anthropic.claude-3-5-sonnet-20240620-v1:0`)
* **Cloud Infrastructure:** AWS (CloudFront, Lambda, RDS)
* **API Integration:** Utilizes the `@aws-sdk/client-bedrock-runtime` (`ConverseCommand`) to interface with Claude 3.5 Sonnet, strictly enforcing a JSON schema output for seamless programmatic consumption.

### Core Modules
* `chat.ts`: The core analysis engine. It handles text chunking, constructs the rigorous `ANALYSIS_PROMPT` with strict JSON schema enforcement, and communicates with the AWS Bedrock Runtime Client.
* `main.ts`: The execution script that feeds job titles, job descriptions, and parsed resume text into the analysis engine, handling the asynchronous response and error logging.

## 🚀 Usage Example
The core function `analyzeResumeGap()` takes an options object and returns a strongly-typed `GapAnalysis` JSON object.

```typescript
import { analyzeResumeGap } from './chat.js';

const analysis = await analyzeResumeGap({
  jobTitle: 'Senior Backend Engineer',
  jobDescription: 'Must-haves: TypeScript/Node.js, AWS serverless...',
  resumeText: 'Detail-oriented computer science graduate...',
  region: 'us-west-2'
});

console.log(analysis.fit_assessment.overall_fit_score);

/* eslint-disable @typescript-eslint/no-explicit-any */
// chat.ts
import 'dotenv/config';
import {
  BedrockRuntimeClient,
  ConverseCommand,
  type ConverseRequest
} from '@aws-sdk/client-bedrock-runtime';

export type GapAnalysis = {
  candidate_summary: {
    name: string | null;
    years_experience: number | null;
    headline_strengths: string[];
  };
  fit_assessment: {
    overall_fit_score: number;
    verdict: 'strong fit' | 'moderate fit' | 'weak fit';
    rationale: string;
  };
  gaps: {
    missing_core_skills: string[];
    shallow_skills: string[];
    experience_gaps: string[];
    credential_gaps: string[];
  };
  evidence_map: Array<{
    requirement: string;
    resume_evidence: string | null;
    confidence: 'low' | 'medium' | 'high';
  }>;
  recommendations: {
    upskilling_plan: Array<{ skill: string; why: string; resource_type: string; time_in_weeks: number }>;
    portfolio_projects: Array<{ title: string; objective: string; acceptance_criteria: string[] }>;
    resume_tweaks: string[];
    cover_letter_points: string[];
    interview_prep: string[];
  };
};

export type AnalyzeOptions = {
  jobTitle: string;
  jobDescription: string;
  resumeText: string;
  region?: string;         // 'us-west-2'
  modelId?: string;        // Claude 3.5 Sonnet
  maxTokens?: number;      // 1500
  temperature?: number;    // 0.2
};

const chunkText = (s: string, size = 12000) => {
  const chunks: string[] = [];
  for (let i = 0; i < s.length; i += size) chunks.push(s.slice(i, i + size));
  return chunks;
};

export async function analyzeResumeGap({
  jobTitle,
  jobDescription,
  resumeText,
  region = process.env.AWS_REGION || 'us-west-2',
  modelId = 'anthropic.claude-3-5-sonnet-20240620-v1:0',
  maxTokens = 1500,
  temperature = 0.2
}: AnalyzeOptions): Promise<GapAnalysis> {

  console.log("hi");
  console.log('AWS env vars at runtime:', {
  region: process.env.AWS_REGION,
  key: process.env.AWS_ACCESS_KEY_ID,
  secret: process.env.AWS_SECRET_ACCESS_KEY,
  token: process.env.AWS_SESSION_TOKEN
});

  const ANALYSIS_PROMPT = `
You are a rigorous resume analyst. Compare the ATTACHED RESUME TEXT against the desired job.
Output ONLY valid JSON (no backticks, no commentary). Follow the schema exactly.

SCHEMA (JSON):
{
  "candidate_summary": { "name": "string | null", "years_experience": "number | null", "headline_strengths": ["string"] },
  "fit_assessment": { "overall_fit_score": "number (0-100)", "verdict": "one of: 'strong fit' | 'moderate fit' | 'weak fit'", "rationale": "string" },
  "gaps": { "missing_core_skills": ["string"], "shallow_skills": ["string"], "experience_gaps": ["string"], "credential_gaps": ["string"] },
  "evidence_map": [{ "requirement": "string", "resume_evidence": "string | null", "confidence": "low|medium|high" }],
  "recommendations": {
    "upskilling_plan": [{"skill": "string", "why": "string", "resource_type": "course|doc|project", "time_in_weeks": 2}],
    "portfolio_projects": [{"title": "string", "objective": "string", "acceptance_criteria": ["string"]}],
    "resume_tweaks": ["string"],
    "cover_letter_points": ["string"],
    "interview_prep": ["string"]
  }
}

GUIDELINES:
- Base all claims strictly on the resume; do not invent facts.
- Mark weak/implicit evidence with confidence "low" and suggest how to strengthen it.
- Write resume_tweaks as concrete bullet-level edits with metrics.
Return ONLY the JSON object.
`.trim();

  const client = new BedrockRuntimeClient({ region });

  const content: { text: string }[] = [
    { text: ANALYSIS_PROMPT },
    { text: `DESIRED_JOB_TITLE:\n${jobTitle}\n\nDESIRED_JOB_DESCRIPTION:\n${jobDescription}` }
  ];
  const resumeChunks = chunkText(resumeText);
  content.push({ text: `RESUME (TEXT):` });
  for (const [i, ch] of resumeChunks.entries()) {
    content.push({ text: `--- RESUME CHUNK ${i + 1}/${resumeChunks.length} ---\n${ch}` });
  }

  const input: ConverseRequest = {
    modelId,
    messages: [{ role: 'user', content }],
    inferenceConfig: { maxTokens, temperature }
  };

  const res = await client.send(new ConverseCommand(input));
  const raw = res.output?.message?.content?.find((c: any) => c.text)?.text ?? '';

  try {
    return JSON.parse(raw) as GapAnalysis;
  } catch {
    const err = new Error('Model did not return valid JSON.') as Error & { raw?: string };
    err.raw = raw;
    throw err;
  }
}

const puppeteer = require("puppeteer");
const { z } = require("zod");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
// NOTE: Groq fully retired all Llama chat models (including llama-3.3-70b-versatile)
// on Aug 16, 2026. openai/gpt-oss-120b is Groq's official recommended replacement —
// same Groq account, same GROQ_API_KEY, same endpoint, no other code changes needed.
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

if (!process.env.GROQ_API_KEY) {
  console.warn(
    "\n⚠️  GROQ_API_KEY is missing from Backend/.env — every AI feature will fail.\n" +
      "   Get a free key (no card needed) from https://console.groq.com/keys\n"
  );
} else {
  const key = process.env.GROQ_API_KEY;
  console.log(`✅ GROQ_API_KEY loaded: ${key.slice(0, 6)}...${key.slice(-4)} (length: ${key.length})`);
}

/**
 * Calls Groq's OpenAI-compatible chat completions endpoint in JSON mode
 * and returns the raw parsed JSON object.
 */
async function callGroq(prompt) {
  if (!process.env.GROQ_API_KEY) {
    const err = new Error(
      "AI service not configured: GROQ_API_KEY is missing from Backend/.env. Get a free key from https://console.groq.com/keys"
    );
    err.status = 401;
    throw err;
  }

  let response;
  try {
    response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.6,
      }),
    });
  } catch (networkErr) {
    console.error("Groq network error:", networkErr.message);
    const err = new Error("Could not reach the Groq API. Check your internet connection and try again.");
    err.status = 502;
    throw err;
  }

  const data = await response.json();

  if (!response.ok) {
    console.error("Groq API error:", JSON.stringify(data));

    if (response.status === 401) {
      const err = new Error(
        "Groq API authentication failed: check that GROQ_API_KEY in Backend/.env is correct, then restart the server."
      );
      err.status = 401;
      throw err;
    }

    if (response.status === 429) {
      const err = new Error("Groq API rate limit reached. Please wait a moment and try again.");
      err.status = 429;
      throw err;
    }

    const err = new Error(data?.error?.message || "The AI service is temporarily unavailable. Please try again.");
    err.status = 502;
    throw err;
  }

  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    const err = new Error("The AI service returned an empty response. Please try again.");
    err.status = 502;
    throw err;
  }

  try {
    return JSON.parse(content);
  } catch (parseErr) {
    console.error("Failed to parse Groq JSON output:", content);
    const err = new Error("The AI returned malformed data. Please try again.");
    err.status = 502;
    throw err;
  }
}

/**
 * Calls Groq and validates the result against a zod schema. If the model's
 * JSON doesn't match the expected shape, retries once with a stricter
 * reminder before giving up.
 */
async function callGroqWithSchema(prompt, zodSchema, attempt = 1) {
  const raw = await callGroq(prompt);
  const result = zodSchema.safeParse(raw);

  if (result.success) return result.data;

  if (attempt < 2) {
    console.warn("Groq output failed schema validation, retrying once:", result.error.message);
    return callGroqWithSchema(
      `${prompt}\n\nIMPORTANT: your previous response did not match the required JSON shape exactly. Follow the exact field names and types given above precisely this time.`,
      zodSchema,
      attempt + 1
    );
  }

  console.error("Groq output failed schema validation twice:", result.error.message, raw);
  const err = new Error("The AI returned data in an unexpected format. Please try again.");
  err.status = 502;
  throw err;
}

/* =========================================================================
 * 1. INTERVIEW QUESTIONS
 * ========================================================================= */

const questionsZodSchema = z.object({
  title: z.string(),
  questions: z
    .array(
      z.object({
        category: z.enum(["technical", "behavioral"]),
        question: z.string(),
        intention: z.string(),
      })
    )
    .min(1),
});

async function generateInterviewQuestions({ resume, selfDescription, jobDescription }) {
  if (!jobDescription) {
    throw new Error("Job description is required to generate interview questions.");
  }

  const prompt = `
You are a senior technical interviewer hiring for the role described below. Based on the
candidate's resume, self-description, and the job description, generate a mock interview
question set specific to THIS candidate and THIS job — not generic questions.

CANDIDATE RESUME:
"""
${resume || "Not provided"}
"""

CANDIDATE SELF-DESCRIPTION:
"""
${selfDescription || "Not provided"}
"""

TARGET JOB DESCRIPTION:
"""
${jobDescription}
"""

Instructions:
1. Infer the exact job title from the job description and use it as "title".
2. Generate exactly 5 "technical" questions that probe the specific technologies, tools, and
   skills mentioned in the job description and/or resume (name the actual tech, don't be generic).
3. Generate exactly 4 "behavioral" questions appropriate for this role's seniority.
4. For every question include "intention" — one short sentence on what the interviewer is
   trying to assess.

Return ONLY a valid JSON object, no markdown code fences, no extra commentary, in EXACTLY this shape:
{
  "title": "string",
  "questions": [
    { "category": "technical", "question": "string", "intention": "string" },
    { "category": "behavioral", "question": "string", "intention": "string" }
  ]
}
`.trim();

  return callGroqWithSchema(prompt, questionsZodSchema);
}

/* =========================================================================
 * 2. INTERVIEW FEEDBACK (after the user answers)
 * ========================================================================= */

const feedbackZodSchema = z.object({
  overallScore: z.number().min(0).max(100),
  overallPerformance: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
  questionFeedback: z.array(
    z.object({
      questionId: z.string(),
      question: z.string(),
      answer: z.string(),
      feedback: z.string(),
      score: z.number().min(0).max(10),
    })
  ),
});

async function generateInterviewFeedback({ questions, answers, resume, jobDescription }) {
  if (!questions?.length) {
    throw new Error("No questions found for this interview.");
  }

  const answerMap = new Map(answers.map((a) => [a.questionId, a.answer]));

  const qaPairs = questions.map((q) => ({
    questionId: q.questionId,
    category: q.category,
    question: q.question,
    answer: (answerMap.get(q.questionId) || "").trim() || "(No answer provided)",
  }));

  const prompt = `
You are a senior technical interviewer evaluating a candidate's mock interview for the role
described in the job description below. Analyze each answer carefully and give honest,
specific, constructive feedback — do not be generic or overly generous.

CANDIDATE RESUME:
"""
${resume || "Not provided"}
"""

TARGET JOB DESCRIPTION:
"""
${jobDescription}
"""

QUESTIONS AND THE CANDIDATE'S ACTUAL ANSWERS:
${qaPairs
  .map(
    (q, i) => `
${i + 1}. [${q.category}] (id: ${q.questionId}) ${q.question}
Candidate's answer: ${q.answer}`
  )
  .join("\n")}

Instructions:
1. For EVERY question above, produce a "questionFeedback" entry using the exact same
   "questionId", the same "question" text and the same "answer" text, plus your "feedback"
   (specific, actionable, 2-4 sentences) and a "score" from 0-10.
   If the candidate left a question unanswered, score it low and say so honestly.
2. Compute an "overallScore" (0-100) reflecting real interview performance across all answers.
3. Write "overallPerformance": 2-3 sentences summarizing how the candidate did overall.
4. List 2-5 "strengths" actually demonstrated in the answers.
5. List 2-5 "weaknesses" actually demonstrated in the answers.
6. List 3-5 concrete "suggestions" for how to improve before the real interview.

Return ONLY a valid JSON object, no markdown code fences, no extra commentary, in EXACTLY this shape:
{
  "overallScore": 0,
  "overallPerformance": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "suggestions": ["string"],
  "questionFeedback": [
    { "questionId": "string", "question": "string", "answer": "string", "feedback": "string", "score": 0 }
  ]
}
`.trim();

  return callGroqWithSchema(prompt, feedbackZodSchema);
}

/* =========================================================================
 * 3. ATS RESUME ANALYSIS
 * ========================================================================= */

const atsZodSchema = z.object({
  title: z.string(),
  matchScore: z.number().min(0).max(100),
  matchingSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  matchingKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  experienceMatch: z.string(),
  jobDescriptionMatch: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
});

async function generateAtsAnalysis({ resume, jobDescription }) {
  if (!resume) {
    throw new Error("Resume text could not be extracted from the uploaded PDF.");
  }
  if (!jobDescription) {
    throw new Error("Job description is required for ATS analysis.");
  }

  const prompt = `
You are an ATS (Applicant Tracking System) resume screening engine combined with an expert
technical recruiter. Compare the resume below against the job description and produce a
rigorous, honest ATS analysis. Compute the match score yourself based on real overlap between
the resume and the job description — never default to a round number like 85.

RESUME TEXT (extracted from PDF):
"""
${resume}
"""

JOB DESCRIPTION:
"""
${jobDescription}
"""

Instructions:
1. Infer the job "title" from the job description.
2. Compute "matchScore" (0-100) based on skills overlap, experience level, and keyword match.
   Be realistic — a resume with major gaps should score low; a strong match should score high.
3. List "matchingSkills": skills/technologies required by the JD that ARE present in the resume.
4. List "missingSkills": skills/technologies required by the JD that are NOT present in the resume.
5. List "matchingKeywords": important keywords/phrases from the JD found in the resume.
6. List "missingKeywords": important keywords/phrases from the JD missing from the resume.
7. "experienceMatch": assess whether the candidate's experience level/years fits what the JD asks for.
8. "jobDescriptionMatch": overall assessment of alignment between resume and JD.
9. List 3-5 "strengths" of this resume for this specific role.
10. List 3-5 "weaknesses" of this resume for this specific role.
11. List 3-5 concrete, specific "suggestions" to improve the resume for this role (wording,
    missing sections, quantifying impact, keywords to add, etc).

Return ONLY a valid JSON object, no markdown code fences, no extra commentary, in EXACTLY this shape:
{
  "title": "string",
  "matchScore": 0,
  "matchingSkills": ["string"],
  "missingSkills": ["string"],
  "matchingKeywords": ["string"],
  "missingKeywords": ["string"],
  "experienceMatch": "string",
  "jobDescriptionMatch": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "suggestions": ["string"]
}
`.trim();

  return callGroqWithSchema(prompt, atsZodSchema);
}

/* =========================================================================
 * PDF GENERATION (unchanged — doesn't depend on the AI provider)
 * ========================================================================= */

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "16mm", bottom: "16mm", left: "14mm", right: "14mm" },
  });
  await browser.close();
  return pdfBuffer;
}

function escapeHtml(str = "") {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const baseStyles = `
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; margin: 0; }
  .header { background: #111827; color: #fff; padding: 28px 32px; }
  .header h1 { margin: 0 0 6px; font-size: 24px; }
  .header p { margin: 0; opacity: 0.85; font-size: 13px; }
  .score-badge { display: inline-block; background: #2563eb; color: #fff; padding: 6px 14px;
    border-radius: 999px; font-weight: bold; font-size: 14px; margin-top: 10px; }
  .content { padding: 24px 32px; }
  h2 { font-size: 16px; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px; margin-top: 26px; }
  ul { margin: 6px 0; padding-left: 20px; font-size: 13px; }
  .card { background: #f9fafb; border-left: 3px solid #2563eb; padding: 10px 14px; margin: 10px 0; border-radius: 4px; font-size: 12.5px; }
  .row { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px;
    background: #f9fafb; border-radius: 6px; margin-bottom: 6px; font-size: 12.5px; }
  .footer { text-align: center; font-size: 10px; color: #9ca3af; padding: 16px; }
`;

function renderInterviewFeedbackHtml(interviewReport) {
  const f = interviewReport.feedback || {};

  return `
  <html><head><meta charset="utf-8" /><style>${baseStyles}</style></head>
  <body>
    <div class="header">
      <h1>${escapeHtml(interviewReport.title || "Interview Report")}</h1>
      <p>AI Mock Interview Feedback</p>
      <div class="score-badge">Overall Score: ${f.overallScore ?? "N/A"}/100</div>
    </div>
    <div class="content">
      <h2>Performance Summary</h2>
      <p>${escapeHtml(f.overallPerformance || "")}</p>

      <h2>Strengths</h2>
      <ul>${(f.strengths || []).map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>

      <h2>Weaknesses</h2>
      <ul>${(f.weaknesses || []).map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>

      <h2>Suggestions</h2>
      <ul>${(f.suggestions || []).map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>

      <h2>Question-by-Question Feedback</h2>
      ${(f.questionFeedback || [])
        .map(
          (q, i) => `
        <div class="card">
          <p><strong>Q${i + 1}.</strong> ${escapeHtml(q.question)}</p>
          <p><em>Your answer:</em> ${escapeHtml(q.answer)}</p>
          <p><em>Feedback:</em> ${escapeHtml(q.feedback)} (Score: ${q.score}/10)</p>
        </div>`
        )
        .join("")}
    </div>
    <div class="footer">Generated on ${new Date().toLocaleDateString()} &middot; AI Mock Interview Platform</div>
  </body></html>
  `;
}

function renderAtsReportHtml(interviewReport) {
  const a = interviewReport.atsReport || {};

  return `
  <html><head><meta charset="utf-8" /><style>${baseStyles}</style></head>
  <body>
    <div class="header">
      <h1>${escapeHtml(interviewReport.title || "ATS Analysis")}</h1>
      <p>Resume vs Job Description &mdash; ATS Analysis</p>
      <div class="score-badge">ATS Match Score: ${a.matchScore ?? "N/A"}%</div>
    </div>
    <div class="content">
      <h2>Job Description Match</h2>
      <p>${escapeHtml(a.jobDescriptionMatch || "")}</p>

      <h2>Experience Match</h2>
      <p>${escapeHtml(a.experienceMatch || "")}</p>

      <h2>Matching Skills</h2>
      <ul>${(a.matchingSkills || []).map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>

      <h2>Missing Skills</h2>
      <ul>${(a.missingSkills || []).map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>

      <h2>Matching Keywords</h2>
      <ul>${(a.matchingKeywords || []).map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>

      <h2>Missing Keywords</h2>
      <ul>${(a.missingKeywords || []).map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>

      <h2>Resume Strengths</h2>
      <ul>${(a.strengths || []).map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>

      <h2>Resume Weaknesses</h2>
      <ul>${(a.weaknesses || []).map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>

      <h2>Suggestions</h2>
      <ul>${(a.suggestions || []).map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
    </div>
    <div class="footer">Generated on ${new Date().toLocaleDateString()} &middot; AI Mock Interview Platform</div>
  </body></html>
  `;
}

async function generateReportPdf(interviewReport) {
  const html =
    interviewReport.type === "ats"
      ? renderAtsReportHtml(interviewReport)
      : renderInterviewFeedbackHtml(interviewReport);

  return generatePdfFromHtml(html);
}

module.exports = {
  generateInterviewQuestions,
  generateInterviewFeedback,
  generateAtsAnalysis,
  generateReportPdf,
};
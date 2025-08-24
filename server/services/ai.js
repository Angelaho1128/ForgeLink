// server/services/ai.js
require("dotenv").config();

async function getModel() {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
}

// --- robust JSON parsing helper (keep if you already had it) ---
function parseJSONLax(text, fallbackKey) {
  try {
    return JSON.parse(text);
  } catch {}
  const fence = text.match(/```json\s*([\s\S]*?)```/i);
  if (fence) {
    try {
      return JSON.parse(fence[1]);
    } catch {}
  }
  const brace = text.match(/\{[\s\S]*\}$/m) || text.match(/\{[\s\S]*\}/m);
  if (brace) {
    try {
      return JSON.parse(brace[0]);
    } catch {}
  }
  const lines = text
    .split(/\r?\n/)
    .map((s) => s.replace(/^[\s>*•\-–]+/, "").trim())
    .filter(Boolean);
  return fallbackKey ? { [fallbackKey]: lines.slice(0, 10) } : {};
}

const genCfg = { responseMimeType: "application/json" };

// ---------------- NEW: classifyAction ----------------
const classifyAction = async (userPrompt = "") => {
  const model = await getModel();
  const prompt = `Classify the user's request into exactly one action:
- "email" for drafting a cold email
- "questions" for producing tailored questions to ask the person
- "message" for a short DM/intro note (non-email)
- "summary" for bullet talking points / highlights

Rules:
- Do NOT choose "email" unless the user clearly asks for an email.
- Return ONLY JSON: {"action":"email"|"questions"|"message"|"summary"}.

User prompt:
${userPrompt}`;

  const r = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: genCfg,
  });
  const out = parseJSONLax(r.response.text());
  let act = (out.action || "").toLowerCase();

  const allowed = ["email", "questions", "message", "summary"];
  if (!allowed.includes(act)) {
    // lightweight keyword fallback
    if (/\b(question|questions|ask|interview)\b/i.test(userPrompt))
      act = "questions";
    else if (
      /\bsummary|summarize|bullets|talking points|highlights\b/i.test(
        userPrompt
      )
    )
      act = "summary";
    else if (/\bmessage|dm|note|intro(duction)?\b/i.test(userPrompt))
      act = "message";
    else if (/\bemail|mail\b/i.test(userPrompt)) act = "email";
    else act = "summary";
  }
  return act;
};

// ---------------- existing extract/relate (keep yours) ----------------
const extractFacts = async (profileText) => {
  const model = await getModel();
  const prompt = `Extract 5–10 concise bullets (role, company, skills, notable projects) from the text below.
Return ONLY JSON in the shape: {"facts": string[]}
TEXT:
${profileText}`;
  const r = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: genCfg,
  });
  const out = parseJSONLax(r.response.text(), "facts");
  return Array.isArray(out.facts) ? out.facts : [];
};

const relate = async (you, facts) => {
  const model = await getModel();
  const prompt = `You: ${you?.headline || ""}; experiences: ${(
    you?.experiences || []
  ).join("; ")}
Target facts: ${(facts || []).join("; ")}
Return ONLY JSON: {"overlaps": string[], "angles": string[]}`;
  const r = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: genCfg,
  });
  const out = parseJSONLax(r.response.text());
  return {
    overlaps: Array.isArray(out.overlaps) ? out.overlaps : [],
    angles: Array.isArray(out.angles) ? out.angles : [],
  };
};

// ---------------- tightened generateAction ----------------
const generateAction = async ({
  action,
  you,
  targetName,
  overlaps,
  angles,
  tone = "warm",
  userPrompt = "",
  facts = [],
  sources = [],
  profileUrl = "",
  profileText = "",
}) => {
  const model = await getModel();
  const clip = (s, n = 2000) =>
    s && s.length > n ? s.slice(0, n) + "…" : s || "";
  const prompt = `You must strictly follow the action type. Never format like an email unless action="email".

Action: ${action}
Tone: ${tone}
Sender: ${you?.name || ""} — ${you?.headline || ""}
Target: ${targetName}
Overlaps: ${overlaps.join("; ")}
Angles: ${angles.join("; ")}
Facts: ${facts.join("; ")}
Best URL: ${profileUrl}
Sources: ${sources.join(" | ")}
Profile excerpt: ${clip(profileText)}
User prompt: ${userPrompt}

Output policy:
- If action="email": produce a professional cold email with greeting and a concise subject and a short sign-off.
- If action="questions": produce ONLY 3–6 tailored questions, no greeting, no subject, no sign-off.
- If action="message": produce a short, informal DM (3–6 sentences), no subject, no email formatting.
- If action="summary": produce 5–8 bullet talking points (no email formatting).

Return ONLY JSON:
{
  "subject": string,    // MUST be non-empty ONLY if action="email"; otherwise ""
  "body": string,       // Email body or DM or bullet summary text. MUST be "" when action="questions".
  "questions": string[] // ONLY when action="questions"; otherwise []
}`;

  const r = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: genCfg,
  });
  const out = parseJSONLax(r.response.text());

  // enforce policy server-side too
  const safe = { subject: "", body: "", questions: [] };
  const A = (action || "").toLowerCase();
  if (A === "email") {
    safe.subject = typeof out.subject === "string" ? out.subject : "";
    safe.body = typeof out.body === "string" ? out.body : "";
  } else if (A === "questions") {
    safe.questions = Array.isArray(out.questions) ? out.questions : [];
  } else if (A === "message" || A === "summary") {
    safe.body = typeof out.body === "string" ? out.body : "";
  } else {
    // fallback: treat unknown as summary
    safe.body = typeof out.body === "string" ? out.body : "";
  }
  return safe;
};

module.exports = { extractFacts, relate, generateAction, classifyAction };

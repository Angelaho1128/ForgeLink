require("dotenv").config();

async function getModel() {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
}

// --- robust JSON parsing helper ---
function parseJSONLax(text, fallbackKey) {
  // 1) straight JSON
  try {
    return JSON.parse(text);
  } catch {}

  // 2) fenced ```json ... ```
  const fence = text.match(/```json\s*([\s\S]*?)```/i);
  if (fence) {
    try {
      return JSON.parse(fence[1]);
    } catch {}
  }

  // 3) first {...} block
  const brace = text.match(/\{[\s\S]*\}$/m) || text.match(/\{[\s\S]*\}/m);
  if (brace) {
    try {
      return JSON.parse(brace[0]);
    } catch {}
  }

  // 4) fallback: turn bullet-ish lines into an array
  const lines = text
    .split(/\r?\n/)
    .map((s) => s.replace(/^[\s>*•\-–]+/, "").trim())
    .filter(Boolean);
  return fallbackKey ? { [fallbackKey]: lines.slice(0, 10) } : {};
}

const genCfg = { responseMimeType: "application/json" };
// If you’re on a newer SDK, you can add a schema too:
// const genCfg = {
//   responseMimeType: 'application/json',
//   responseSchema: { type: 'object', properties: { facts: { type: 'array', items: { type: 'string' } } }, required: ['facts'] }
// };

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
Target facts: ${facts.join("; ")}
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

const generateAction = async ({
  action,
  you,
  targetName,
  overlaps,
  angles,
  tone = "warm",
  userPrompt = "",
}) => {
  const model = await getModel();
  const prompt = `Action: ${action}
Tone: ${tone}
Sender: ${you?.name || ""} — ${you?.headline || ""}
Overlaps: ${overlaps.join("; ")}
Angles: ${angles.join("; ")}
Target: ${targetName}
User prompt (constraints/topics): ${userPrompt}
Return ONLY JSON:
{
  "subject": string,   // empty if not an email
  "body": string,      // main text
  "questions": string[] // 3–5 tailored questions if action = "questions"
}`;
  const r = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: genCfg,
  });
  const out = parseJSONLax(r.response.text());
  return {
    subject: typeof out.subject === "string" ? out.subject : "",
    body: typeof out.body === "string" ? out.body : "",
    questions: Array.isArray(out.questions) ? out.questions : [],
  };
};

module.exports = { extractFacts, relate, generateAction };

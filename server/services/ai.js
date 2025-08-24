require("dotenv").config();

async function getModel() {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
}

const extractFacts = async (profileText) => {
  const model = await getModel();
  const prompt = `Extract 5–10 concise bullets...\nTEXT:\n${profileText}`;
  const r = await model.generateContent(prompt);
  return JSON.parse(r.response.text()).facts;
};

const relate = async (you, facts) => {
  const model = await getModel();
  const prompt = `You: ${you.headline}; experiences: ${
    you.experiences?.join("; ") || ""
  }
Target facts: ${facts.join("; ")}
Return JSON: {"overlaps": string[], "angles": string[]}`;
  const r = await model.generateContent(prompt);
  return JSON.parse(r.response.text());
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
  const schema = `Return JSON:
{
  "subject": string,
  "body": string,
  "questions": string[]
}`;
  const prompt = `Action: ${action}
Tone: ${tone}
Sender: ${you.name} — ${you.headline}
Overlaps: ${overlaps.join("; ")}
Angles: ${angles.join("; ")}
Target: ${targetName}
User prompt (constraints/topics): ${userPrompt}
${schema}`;
  const r = await model.generateContent(prompt);
  return JSON.parse(r.response.text());
};

module.exports = { extractFacts, relate, generateAction };

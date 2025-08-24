import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getLinkedInSummary(url) {
  // In real implementation, you’d scrape/process LinkedIn data.
  // Here, we'll simulate by passing the URL into GPT.
  const prompt = `Summarize the professional profile from this LinkedIn URL: ${url}`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content;
}

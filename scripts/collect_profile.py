import sys, json, asyncio
from dotenv import load_dotenv
load_dotenv()

from browser_use import Agent
from browser_use.llm import ChatGoogle

def make_task(name: str, headline: str) -> str:
    return f"""
Goal: Find public web info about "{name}" ({headline}) WITHOUT visiting linkedin.com.
Prefer sources: personal website, company/team page, GitHub, Google Scholar/ORCID, conference bios, news/interviews.
Steps:
1) Search the web for the exact name + headline/company keywords. Avoid linkedin.com.
2) Open 2–4 promising non-LinkedIn results; extract:
   - Current role & company
   - Past roles/companies (top 2)
   - Skills/tech/topics
   - Notable projects/publications/talks
3) Assemble a single flat text blob (no markup) and list source URLs.
4) Return ONLY JSON:
{{
  "profileText": "<flat text up to ~800 words>",
  "sources": ["<url1>", "<url2>"],
  "bestUrl": "<canonical or personal page if found>",
  "confidence": 0.0
}}
"""

async def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error":"name required"})); return
    name = sys.argv[1]
    headline = sys.argv[2] if len(sys.argv) > 2 else ""

    llm = ChatGoogle(model="gemini-2.0-flash-exp")  # uses GOOGLE_API_KEY
    agent = Agent(task=make_task(name, headline), llm=llm)

    result = await agent.run()
    text = str(result)

    # Try to parse JSON if the agent followed instructions; else wrap
    try:
        payload = json.loads(text)
    except Exception:
        payload = {"profileText": text, "sources": [], "bestUrl": "", "confidence": 0.6}

    print(json.dumps(payload))

if __name__ == "__main__":
    asyncio.run(main())

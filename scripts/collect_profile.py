import asyncio, json, os, sys, urllib.parse
from dotenv import load_dotenv
from browser_use import Agent
from browser_use.llm import ChatGoogle

load_dotenv()

NAME = sys.argv[1] if len(sys.argv) > 1 else ""
HEADLINE = sys.argv[2] if len(sys.argv) > 2 else ""
QUERY = f"{NAME} {HEADLINE}".strip()
q = urllib.parse.quote_plus(QUERY)

SYSTEM_HINT = """
Start from a web search and gather information from multiple reliable public sources
(e.g., company sites, blogs, GitHub, reputable press, university pages).
Do not default to LinkedIn as the first source; only open it later if it adds real value.
Summarize concise, concrete facts (roles, companies, skills, notable work).
"""

async def main():
    # Start on a Google results page for the person (no LinkedIn block)
    initial_actions = [
        {"go_to_url": {"url": f"https://www.google.com/search?q={q}", "new_tab": True}}
    ]

    llm = ChatGoogle(model="gemini-2.0-flash-exp")  # uses GOOGLE_API_KEY

    agent = Agent(
        task=f"Find reliable public information about {NAME} ({HEADLINE}) and summarize key facts.",
        llm=llm,
        initial_actions=initial_actions,
        extend_system_message=SYSTEM_HINT,
        use_vision=True,
        save_conversation_path=None,
    )

    # Run the agent (no domain blocking; it may visit LinkedIn if it chooses later)
    history = await agent.run(max_steps=18)

    # Aggregate extracted content and visited URLs
    text_chunks = history.extracted_content() or []
    text = "\n".join([c for c in text_chunks if isinstance(c, str)])[:12000]

    urls = history.urls() or []
    # keep unique order; cap to a handful
    dedup_urls = list(dict.fromkeys(urls))[:8]

    out = {
        "profileText": (text or "").strip(),
        "sources": dedup_urls,
        "bestUrl": dedup_urls[0] if dedup_urls else "",
        "confidence": 0.75 if text else 0.25,
    }
    print(json.dumps(out))

if __name__ == "__main__":
    asyncio.run(main())
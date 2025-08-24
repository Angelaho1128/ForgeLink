// src/App.jsx
import { useState } from "react";

export default function App_test() {
  const [ownerUserId, setOwnerUserId] = useState(""); // paste a real User _id
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [prompt, setPrompt] = useState("I’d love to discuss your work on ...");
  const [target, setTarget] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function resolveTarget() {
    setLoading(true);
    setError("");
    setDraft(null);
    try {
      const res = await fetch("/api/targets/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerUserId, name, headline }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "resolve failed");
      setTarget(data.target);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function generateEmail() {
    if (!target?._id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/actions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerUserId,
          targetId: target._id,
          action: "email",
          tone: "warm",
          userPrompt: prompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "generate failed");
      setDraft(data.draft);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui" }}
    >
      <h1>ForgeLink</h1>

      <label htmlFor="owner">Owner User ID</label>
      <input
        id="owner"
        value={ownerUserId}
        onChange={(e) => setOwnerUserId(e.target.value)}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <label htmlFor="name">Target name</label>
      <input
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <label htmlFor="headline">Target headline</label>
      <input
        id="headline"
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <button
        disabled={loading || !name || !headline || !ownerUserId}
        onClick={resolveTarget}
      >
        Resolve target
      </button>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {target && (
        <>
          <h3>Facts</h3>
          <ul>
            {(target.facts || []).map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>

          <h4>Sources</h4>
          <ul>
            {(target.sources || []).map((u, i) => (
              <li key={i}>
                <a href={u} target="_blank" rel="noreferrer">
                  {u}
                </a>
              </li>
            ))}
          </ul>

          <label htmlFor="prompt">Prompt / topics</label>
          <textarea
            id="prompt"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{ width: "100%", marginBottom: 12 }}
          />

          <button disabled={loading} onClick={generateEmail}>
            Generate email
          </button>
        </>
      )}

      {draft && (
        <>
          <h3>Draft</h3>
          <p>
            <strong>Subject:</strong> {draft.subject}
          </p>
          <pre style={{ whiteSpace: "pre-wrap" }}>{draft.body}</pre>
          {draft.questions?.length > 0 && (
            <>
              <h4>Questions</h4>
              <ul>
                {draft.questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}

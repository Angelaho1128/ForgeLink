import { api } from "./api";

export const listTargets = () => api("/api/targets");
export const getTarget = (id) => api(`/api/targets/${id}`);
export const resolveTarget = ({ name, headline }) =>
  api("/api/targets/resolve", {
    method: "POST",
    body: JSON.stringify({ name, headline }),
  });
export const generateDraft = ({
  targetId,
  userPrompt,
  action = "email",
  tone = "warm",
}) =>
  api("/api/actions/generate", {
    method: "POST",
    body: JSON.stringify({ targetId, action, tone, userPrompt }),
  });
export const deleteTarget = (id) =>
  api(`/api/targets/${id}`, { method: "DELETE" });

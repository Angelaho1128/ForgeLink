import { apiFetch } from "./api";

export function listTargets(ownerUserId) {
  return apiFetch(
    `/api/targets?ownerUserId=${encodeURIComponent(ownerUserId)}`
  );
}
export function getTarget(id) {
  return apiFetch(`/api/targets/${id}`);
}
export function resolveTarget({ ownerUserId, name, headline }) {
  return apiFetch(`/api/targets/resolve`, {
    method: "POST",
    body: JSON.stringify({ ownerUserId, name, headline }),
  });
}
export function generateDraft({
  ownerUserId,
  targetId,
  userPrompt,
  action = "email",
  tone = "warm",
}) {
  return apiFetch(`/api/actions/generate`, {
    method: "POST",
    body: JSON.stringify({ ownerUserId, targetId, action, tone, userPrompt }),
  });
}

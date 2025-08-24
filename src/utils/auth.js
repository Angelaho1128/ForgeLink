import { apiFetch } from "./api";

export async function login(username, password) {
  const data = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  localStorage.setItem("token", data.token);
  localStorage.setItem("ownerUserId", data.user._id);
  localStorage.setItem("username", data.user.username);
  return data;
}

export async function signup({ username, password, name, headline }) {
  const data = await apiFetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ username, password, name, headline }),
  });
  localStorage.setItem("token", data.token);
  localStorage.setItem("ownerUserId", data.user._id);
  localStorage.setItem("username", data.user.username);
  return data;
}

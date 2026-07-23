const API = import.meta.env.VITE_API_URL || "";

export function getToken(): string | null {
  return localStorage.getItem("admin-token");
}

export function setToken(token: string) {
  localStorage.setItem("admin-token", token);
}

export function clearToken() {
  localStorage.removeItem("admin-token");
}

export function api(path: string, init?: RequestInit) {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(`${API}${path}`, {
    credentials: "include",
    ...init,
    headers,
  });
}

const SESSION_KEY = "recipe-book-auth";

export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const password = sessionStorage.getItem(SESSION_KEY);
  const headers = new Headers(options.headers);

  if (password && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${password}`);
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    sessionStorage.removeItem(SESSION_KEY);
    // Dispatch custom event so auth context can react
    window.dispatchEvent(new CustomEvent("auth-expired"));
  }

  return res;
}

/**
 * Admin API Client Helper
 * Attaches Authorization and x-admin-token headers to all admin fetch requests.
 */

export function getAdminToken(): string {
  if (typeof window === "undefined") return "stonks_admin_super_secret_2026";
  return (
    localStorage.getItem("stonks_admin_token") ||
    "stonks_admin_super_secret_2026"
  );
}

export function getAdminHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const token = getAdminToken();
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    "x-admin-token": token,
    ...customHeaders,
  };
}

export async function adminFetch(url: string, options: RequestInit = {}) {
  const headers = getAdminHeaders((options.headers as Record<string, string>) || {});
  return fetch(url, {
    ...options,
    headers,
    credentials: "same-origin",
  });
}

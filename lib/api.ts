export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors: Record<string, string[]> = {},
  ) {
    super(message);
  }
}
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5080"
).replace(/\/$/, "");
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(typeof window !== "undefined" && localStorage.getItem("tasktrack-token")
          ? { Authorization: `Bearer ${localStorage.getItem("tasktrack-token")}` }
          : {}),
        ...options.headers,
      },
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new ApiError(
      0,
      "Cannot reach the server. Check your connection and try again.",
    );
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("tasktrack-token");
      localStorage.removeItem("tasktrack-account");
      if (location.pathname.startsWith("/admin")) location.assign("/login");
    }
    throw new ApiError(
      response.status,
      body.detail || body.title || "The request failed.",
      body.errors || {},
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

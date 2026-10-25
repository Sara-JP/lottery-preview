// ── API Client Configuration ──────────────────────────────────────────────────
// Central place for backend configuration. No production URLs are hard-coded
// here or anywhere else in the app — everything reads from Vite env vars, so
// deployment config lives outside the component tree per environment.
//
// No real endpoints exist yet for this project (no backend docs / OpenAPI
// spec were supplied), so every domain service currently talks to the mock
// store in src/data/mockDb.ts instead of this client. USE_MOCK_DATA below is
// the single flag that would need to flip once a backend is available; each
// service is already written against a typed interface so swapping the
// implementation does not touch any page or hook.

/** Base URL for the real API, when one exists. Empty string until configured. */
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? ""

/**
 * True while no backend is configured. Every service module checks this (or
 * simply has no `else` branch yet) to decide whether to call the mock store
 * or `apiFetch` below. Flip by setting VITE_API_BASE_URL in the environment.
 */
export const USE_MOCK_DATA = API_BASE_URL.length === 0

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

/** Generic Persian-friendly message shown to users instead of raw technical errors. */
export const GENERIC_ERROR_MESSAGE = "خطایی رخ داد. لطفاً دوباره تلاش کنید."

export interface ApiRequestOptions
  extends RequestInit {
  /** Parsed as JSON and set as the request body. */
  json?: unknown
}

/**
 * Thin fetch wrapper for the future real backend. Not used while
 * USE_MOCK_DATA is true, but kept ready and typed so services can switch to
 * it call-by-call once endpoints exist, without inventing a shape here.
 */
export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { json, headers, ...rest } = options
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  })

  if (!response.ok) {
    throw new ApiError(GENERIC_ERROR_MESSAGE, response.status)
  }

  return (await response.json()) as T
}

/** Small artificial delay so mock-backed screens exercise real loading states. */
export function mockDelay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

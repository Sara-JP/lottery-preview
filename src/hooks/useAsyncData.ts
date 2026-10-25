// ── useAsyncData ───────────────────────────────────────────────────────────—
// A small, dependency-free hook that gives every data-driven screen a
// consistent loading / success / empty / error shape without pulling in a
// full server-state library. Deliberately NOT TanStack Query: this project has
// no complex cache-invalidation needs yet (no shared cross-request cache,
// no background refetching, a handful of screens) — adding it now would be
// a dependency for its own sake. Re-evaluate if the mock services are
// replaced by a real API with more complex caching needs.

import { useCallback, useEffect, useRef, useState } from "react"
import { ApiError, GENERIC_ERROR_MESSAGE } from "@/services/api"
import type { AsyncStatus } from "@/types/domain"

export interface AsyncDataResult<T> {
  data: T | null
  status: AsyncStatus
  error: string | null
  /** Re-runs the fetcher (e.g. after a mutation elsewhere). */
  refetch: () => void
}

function isEmpty(value: unknown): boolean {
  if (Array.isArray(value)) return value.length === 0
  return value === null || value === undefined
}

/**
 * Runs `fetcher` whenever `deps` change, exposing loading/success/empty/error.
 * `fetcher` should come from a service module — never call mockDb directly.
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList,
): AsyncDataResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [status, setStatus] = useState<AsyncStatus>("loading")
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  useEffect(() => {
    let cancelled = false
    setStatus("loading")
    setError(null)

    fetcherRef
      .current()
      .then((result) => {
        if (cancelled) return
        setData(result)
        setStatus(isEmpty(result) ? "empty" : "success")
      })
      .catch((err: unknown) => {
        if (cancelled) return
        // Still log the real error for developers/telemetry — it's just not
        // shown in the UI.
        console.error("useAsyncData fetch failed:", err)
        // Only ApiError carries a message that was deliberately written to be
        // shown to a user (see src/services/api.ts). Any other thrown value —
        // a bug, a mock-store exception, a raw network error — must never
        // have its technical text surfaced directly; show the generic
        // Persian message instead, per the brief's explicit requirement not
        // to expose raw backend errors to normal users.
        setError(err instanceof ApiError ? err.message : GENERIC_ERROR_MESSAGE)
        setStatus("error")
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken])

  const refetch = useCallback(() => setReloadToken((t) => t + 1), [])

  return { data, status, error, refetch }
}

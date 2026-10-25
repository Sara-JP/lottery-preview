import { useCallback, useState } from "react"
import type { ToastMessage, ToastType } from "@/components/common/Toast"

export interface UseToastResult {
  toast: ToastMessage | null
  showToast: (msg: string, type?: ToastType) => void
  clearToast: () => void
}

/** Centralizes the toast-state pattern repeated across every screen. */
export function useToast(): UseToastResult {
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const showToast = useCallback(
    (msg: string, type: ToastType = "success") => setToast({ msg, type }),
    [],
  )
  const clearToast = useCallback(() => setToast(null), [])
  return { toast, showToast, clearToast }
}

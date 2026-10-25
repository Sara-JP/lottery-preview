import { useEffect } from "react"

export type ToastType = "success" | "error" | "info"

export interface ToastMessage {
  msg: string
  type: ToastType
}

const COLORS: Record<ToastType, string> = {
  success: "border-success/30 bg-success/10 text-success",
  error: "border-danger/30 bg-danger/10 text-danger",
  info: "border-primary/30 bg-primary/10 text-primary",
}
const ICONS: Record<ToastType, string> = { success: "✓", error: "✕", info: "ℹ" }

export function Toast({
  message,
  type,
  onClose,
}: {
  message: string
  type: ToastType
  onClose: () => void
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl border card-shadow slide-in-up ${COLORS[type]}`}
    >
      <span className="text-lg font-bold" aria-hidden="true">
        {ICONS[type]}
      </span>
      <span className="text-sm font-medium">{message}</span>
    </div>
  )
}

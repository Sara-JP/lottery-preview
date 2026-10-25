import { useEffect, useRef } from "react"
import { Btn, type BtnVariant } from "@/components/common/Btn"
import { useFocusTrap } from "@/hooks/useFocusTrap"

export interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  variant?: Extract<BtnVariant, "primary" | "danger" | "gold">
}

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "تأیید",
  variant = "primary",
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  useFocusTrap(containerRef, open)

  useEffect(() => {
    if (!open) return
    confirmRef.current?.focus()
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
    >
      <div ref={containerRef} className="bg-card border border-border rounded-2xl p-8 max-w-md w-full mx-4 card-shadow-lg scale-in">
        <div className="text-center mb-6">
          <div className="text-3xl mb-3" aria-hidden="true">
            {variant === "danger" ? "⚠️" : "❓"}
          </div>
          <h3
            id="confirm-dialog-title"
            className="text-lg font-bold text-foreground mb-2"
          >
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {message}
          </p>
        </div>
        <div className="flex gap-3">
          <Btn
            ref={confirmRef}
            variant={variant}
            className="flex-1"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Btn>
          <Btn variant="secondary" className="flex-1" onClick={onCancel}>
            انصراف
          </Btn>
        </div>
      </div>
    </div>
  )
}

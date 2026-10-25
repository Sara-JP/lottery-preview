import { useEffect, useRef, useState } from "react"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { StatusBadge } from "@/components/common/StatusBadge"
import type { EligibilityStatus } from "@/types/domain"
import { eligibilityLabel } from "@/utils/format"

const OPTIONS: { value: EligibilityStatus; label: string }[] = [
  { value: "pending", label: "در انتظار بررسی" },
  { value: "eligible", label: "واجد شرایط" },
  { value: "ineligible", label: "فاقد شرایط" },
]

export function EligibilityControl({
  status,
  onConfirm,
}: {
  status: EligibilityStatus
  onConfirm: (newStatus: EligibilityStatus) => void
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<EligibilityStatus | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Close on Escape (returning focus to the trigger) and on any click outside —
  // a dropdown that can only be dismissed by picking something is both an a11y
  // gap for keyboard users and an annoyance for everyone else.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    const onPointer = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onPointer)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onPointer)
    }
  }, [open])
  const { label, cls } = eligibilityLabel(status)

  return (
    <>
      <ConfirmDialog
        open={pending !== null}
        title="تغییر وضعیت"
        message={`آیا از تغییر وضعیت این برنده به "${
          pending ? eligibilityLabel(pending).label : ""
        }" مطمئن هستید؟`}
        variant={pending === "ineligible" ? "danger" : "primary"}
        confirmLabel="بله، تغییر بده"
        onConfirm={() => {
          onConfirm(pending!)
          setPending(null)
        }}
        onCancel={() => setPending(null)}
      />
      <div className="relative" ref={containerRef}>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <StatusBadge label={label + " ▾"} cls={cls} />
        </button>
        {open && (
          <div
            role="listbox"
            className="absolute top-8 right-0 z-20 bg-card border border-border rounded-xl overflow-hidden card-shadow min-w-[180px] fade-in"
          >
            {OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={o.value === status}
                onClick={() => {
                  setOpen(false)
                  if (o.value !== status) setPending(o.value)
                }}
                className={`w-full text-right px-4 py-2.5 text-sm hover:bg-secondary transition-all flex items-center gap-2 ${
                  o.value === status
                    ? "text-primary font-semibold"
                    : "text-foreground"
                }`}
              >
                {o.value === status && <span aria-hidden="true">✓</span>}
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

import { useEffect, useRef, useState } from "react"
import { Btn } from "@/components/common/Btn"
import { useFocusTrap } from "@/hooks/useFocusTrap"

export interface NotesDrawerProps {
  open: boolean
  campaignName: string
  note: string
  noteUpdated?: string
  onSave: (v: string) => void
  onClose: () => void
}

export function NotesDrawer({
  open,
  campaignName,
  note,
  noteUpdated,
  onSave,
  onClose,
}: NotesDrawerProps) {
  const [val, setVal] = useState(note)
  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  useFocusTrap(containerRef, open)

  useEffect(() => setVal(note), [note, open])

  useEffect(() => {
    if (!open) return
    textareaRef.current?.focus()
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="یادداشت کمپین"
        className="ml-auto w-[480px] h-full bg-card border-r border-border flex flex-col slide-in-right card-shadow-lg"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h3 className="text-base font-bold text-foreground">
              یادداشت کمپین
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {campaignName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 p-6 flex flex-col gap-4">
          <textarea
            ref={textareaRef}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            rows={10}
            placeholder="یادداشت خود را بنویسید..."
            aria-label="یادداشت کمپین"
            className="w-full p-4 rounded-xl bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none transition-all"
          />
          {noteUpdated && (
            <p className="text-xs text-muted-foreground">
              آخرین ویرایش: {noteUpdated}
            </p>
          )}
        </div>
        <div className="px-6 py-5 border-t border-border flex gap-3">
          <Btn
            variant="primary"
            className="flex-1"
            onClick={() => {
              onSave(val)
              onClose()
            }}
          >
            ذخیره یادداشت
          </Btn>
          <Btn variant="secondary" onClick={onClose}>
            انصراف
          </Btn>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useRef } from "react"

export interface OverflowMenuItem {
  label: string
  icon?: string
  onClick: () => void
  danger?: boolean
}

export function OverflowMenu({
  items,
  onClose,
}: {
  items: OverflowMenuItem[]
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      role="menu"
      className="absolute left-0 top-8 z-30 bg-card border border-border rounded-xl overflow-hidden card-shadow-lg min-w-[180px] fade-in"
    >
      {items.map((item, i) => (
        <button
          key={i}
          type="button"
          role="menuitem"
          onClick={() => {
            item.onClick()
            onClose()
          }}
          className={`w-full text-right flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all hover:bg-secondary ${
            item.danger ? "text-danger" : "text-foreground"
          }`}
        >
          {item.icon && (
            <span className="text-base" aria-hidden="true">
              {item.icon}
            </span>
          )}
          {item.label}
        </button>
      ))}
    </div>
  )
}

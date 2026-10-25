import { useRef, useState } from "react"
import { Btn } from "@/components/common/Btn"

export interface ImageUploadZoneProps {
  value: string
  onChange: (v: string) => void
  label: string
  error?: string
}

export function ImageUploadZone({
  value,
  onChange,
  label,
  error,
}: ImageUploadZoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => onChange(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      {value ? (
        <div
          className="relative rounded-xl overflow-hidden border border-border"
          style={{ aspectRatio: "16/9" }}
        >
          <img
            src={value}
            alt="پیش‌نمایش"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 hover:opacity-100 transition-opacity">
            <Btn
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              جایگزینی
            </Btn>
            <Btn variant="danger" size="sm" onClick={() => onChange("")}>
              حذف
            </Btn>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            const f = e.dataTransfer.files[0]
            if (f) handleFile(f)
          }}
          onClick={() => inputRef.current?.click()}
          className={`rounded-xl border-2 border-dashed p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
            dragging
              ? "border-primary bg-primary/05"
              : error
                ? "border-danger"
                : "border-border hover:border-primary/40 hover:bg-secondary/40"
          }`}
        >
          <div className="text-4xl" aria-hidden="true">
            🖼
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-foreground mb-1">
              تصویر را اینجا بکشید
            </div>
            <div className="text-xs text-muted-foreground">یا</div>
            {/* The drop zone itself is a plain (non-interactive) drop target; this
                real button is the single keyboard-reachable control. Its click
                bubbles to the zone's onClick, which opens the file picker. */}
            <Btn variant="secondary" size="sm" className="mt-2">
              انتخاب فایل
            </Btn>
          </div>
          <p className="text-xs text-muted-foreground">
            PNG / JPG • ۱۹۲۰×۱۰۸۰ پیکسل • حداکثر ۵ مگابایت
          </p>
        </div>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label={label}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
          // Reset so picking the SAME file again (e.g. after removing it) still
          // fires a change event — browsers skip it when the value is unchanged.
          e.target.value = ""
        }}
      />
    </div>
  )
}

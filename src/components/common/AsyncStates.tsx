import { Btn } from "@/components/common/Btn"

export function LoadingState({
  label = "در حال بارگذاری...",
}: {
  label?: string
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <div
        className="w-8 h-8 rounded-full border-2 border-border border-t-primary animate-spin"
        aria-hidden="true"
      />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function EmptyState({
  title = "داده‌ای برای نمایش وجود ندارد",
  description,
  icon = "📭",
}: {
  title?: string
  description?: string
  icon?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
      <div className="text-4xl mb-2" aria-hidden="true">
        {icon}
      </div>
      <div className="text-sm font-semibold text-foreground">{title}</div>
      {description && (
        <p className="text-xs text-muted-foreground max-w-sm">{description}</p>
      )}
    </div>
  )
}

export function ErrorState({
  message = "خطایی رخ داد. لطفاً دوباره تلاش کنید.",
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-24 text-center"
      role="alert"
    >
      <div className="text-4xl" aria-hidden="true">
        ⚠️
      </div>
      <p className="text-sm text-danger max-w-sm">{message}</p>
      {onRetry && (
        <Btn variant="secondary" size="sm" onClick={onRetry}>
          تلاش دوباره
        </Btn>
      )}
    </div>
  )
}

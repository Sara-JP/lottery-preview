export interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon: string
  accent?: boolean
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  accent = false,
}: StatCardProps) {
  return (
    <div
      className={`rounded-2xl p-6 card-shadow flex flex-col gap-3 ${
        accent
          ? "bg-primary text-primary-foreground"
          : "bg-card border border-border"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl" aria-hidden="true">
          {icon}
        </span>
        {sub && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-lg ${
              accent ? "bg-black/10" : "bg-success/15 text-success"
            }`}
          >
            {sub}
          </span>
        )}
      </div>
      <div>
        <div
          className={`text-2xl font-bold tracking-tight ${
            accent ? "text-primary-foreground" : "text-foreground"
          }`}
        >
          {value}
        </div>
        <div
          className={`text-sm mt-1 ${
            accent ? "text-black/60" : "text-muted-foreground"
          }`}
        >
          {label}
        </div>
      </div>
    </div>
  )
}

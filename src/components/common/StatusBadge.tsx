import { campaignStatusLabel } from "@/utils/status"
import type { CampaignStatus } from "@/types/domain"

export function StatusBadge({ label, cls }: { label: string; cls: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${cls}`}
    >
      {label}
    </span>
  )
}

/** Renders Campaign Status using the single source of truth in utils/status.ts. */
export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const { label, cls } = campaignStatusLabel(status)
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cls}`}
    >
      {status === "active" && (
        <span className="w-1.5 h-1.5 rounded-full bg-success live-pulse" />
      )}
      {label}
    </span>
  )
}

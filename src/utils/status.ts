// ── Status Domain Logic (single source of truth) ─────────────────────────────
// Every screen that needs Campaign Status or Lottery Status MUST go through
// these functions instead of reading raw fields or recomputing status locally.
// This is what keeps Campaigns / Campaign Details / Lottery Operator / Winners /
// Dashboard from showing contradictory information.

import type {
  Campaign,
  CampaignStatus,
  LotteryExecution,
  LotteryStatus,
} from "@/types/domain"

/**
 * Whether a campaign's lottery has ACTUALLY been executed.
 *
 * This is the only rule that may answer "has this lottery run": a matching
 * entry in lottery execution history. It deliberately never looks at dates —
 * a lottery whose scheduled date has passed with no execution record is still
 * "not run".
 */
export function hasLotteryRun(
  campaignId: string,
  executions: LotteryExecution[],
): boolean {
  return executions.some((e) => e.campaignId === campaignId)
}

/**
 * Derives Lottery Status from campaign data + execution history.
 *
 * - 'completed'   → hasLotteryRun() is true (evidence-based, never date-based)
 * - 'not-started' → campaign hasn't reached its active window yet
 * - 'ready'       → campaign is in its active window, lottery not yet run
 */
export function getLotteryStatus(
  campaign: Campaign,
  executions: LotteryExecution[],
): LotteryStatus {
  if (hasLotteryRun(campaign.id, executions)) return "completed"
  if (campaign.status === "upcoming") return "not-started"
  return "ready"
}

export function lotteryStatusLabel(
  status: LotteryStatus,
): { label: string; cls: string } {
  if (status === "completed")
    return {
      label: "انجام شده",
      cls: "bg-success/15 text-success border-success/25",
    }
  if (status === "ready")
    return {
      label: "در حال برگزاری",
      cls: "bg-primary/15 text-primary border-primary/25",
    }
  return {
    label: "انجام نشده",
    cls: "bg-secondary text-secondary-foreground border-border",
  }
}

/**
 * Derives Campaign Status, keeping it consistent with lottery execution
 * evidence: a campaign whose lottery has demonstrably run can never be shown
 * as "upcoming" or "active" (mid-lottery) — from the lottery's perspective
 * it is at least "finished", even if the stored lifecycle field disagrees.
 *
 * AMBIGUITY NOTE (see STATUS LOGIC REPORT): the original data model keeps
 * `status` as an independently-set lifecycle field with no documented backend
 * rule for how it should react to lottery completion. Rather than inventing
 * date-driven business rules, this only tightens the one contradiction the
 * task explicitly called out (status/lottery disagreement) and otherwise
 * trusts the stored field.
 */
export function getCampaignStatus(
  campaign: Campaign,
  executions: LotteryExecution[],
): CampaignStatus {
  if (
    hasLotteryRun(campaign.id, executions) &&
    (campaign.status === "upcoming" || campaign.status === "active")
  ) {
    return "finished"
  }
  return campaign.status
}

export function campaignStatusLabel(
  status: CampaignStatus,
): { label: string; cls: string } {
  const map: Record<CampaignStatus, { label: string; cls: string }> = {
    active: {
      label: "فعال",
      cls: "bg-success/15 text-success border-success/25",
    },
    upcoming: {
      label: "آینده",
      cls: "bg-warning/15 text-warning border-warning/25",
    },
    finished: {
      label: "پایان‌یافته",
      cls: "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/20",
    },
    archived: {
      label: "آرشیو",
      cls: "bg-secondary text-secondary-foreground border-border",
    },
  }
  return map[status]
}

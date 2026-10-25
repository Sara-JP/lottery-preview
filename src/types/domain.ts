// ── Domain Types ──────────────────────────────────────────────────────────────
// Central type definitions for the Lottery / Campaign domain. Extracted from the
// original monolithic App.tsx so services, hooks and pages share one definition.

/**
 * Campaign lifecycle stage.
 *
 * NOTE ON STATUS SOURCE OF TRUTH:
 * This is stored/derived data (see utils/status.ts -> getCampaignStatus), not a
 * value pages should invent independently. `isActive` (below) is a *separate*
 * concept: an admin on/off switch, independent from lifecycle stage.
 */
export type CampaignStatus = "active" | "upcoming" | "finished" | "archived"

/**
 * Lottery execution status, derived from campaign data + lottery execution
 * history (see utils/status.ts -> getLotteryStatus). Never derived from the
 * lottery date alone.
 */
export type LotteryStatus = "not-started" | "ready" | "completed"

export type EligibilityStatus = "pending" | "eligible" | "ineligible"

export type ReserveStatus = "waiting" | "selected" | "replaced" | "eligible" | "ineligible"

export interface Campaign {
  id: string
  name: string
  /** Lifecycle stage. Combine with lottery execution history via getCampaignStatus(). */
  status: CampaignStatus
  /** Admin-controlled enable/disable switch — distinct from `status`. */
  isActive: boolean
  startDate: string
  endDate: string
  lotteryDate: string
  lotteryTime: string
  winners: number
  reserveWinners: number
  eligible: number
  codeLength: number
  description: string
  note?: string
  noteUpdated?: string
  banner?: string
}

export interface Participant {
  id: string
  mobile: string
  lotteryCode: string
  rechargeCount: number
  eligible: boolean
  createdAt: string
  campaignId: string
}

export interface Winner {
  id: string
  rank: number
  mobile: string
  lotteryCode: string
  prize: string
  prizeValue: string
  selectedAt: string
  campaignId: string
  eligibilityStatus: EligibilityStatus
}

export interface ReserveWinner {
  id: string
  rank: number
  mobile: string
  lotteryCode: string
  status: ReserveStatus
  replacedWinnerRank?: number
  activatedAt?: string
  campaignId: string
}

export interface ActivityEntry {
  id: string
  time: string
  message: string
  type: "info" | "success" | "warning" | "danger"
  campaignId: string
}

export interface LogEntry {
  id: string
  time: string
  operator: string
  action: string
  type: "info" | "success" | "warning" | "danger"
}

/**
 * A single recorded lottery execution. Presence of a record for a campaign is
 * the ONLY source of truth for "has this lottery actually run" — see
 * utils/status.ts -> hasLotteryRun(). This is modeled as history (append-only)
 * so a real backend can replace the mock store without changing call sites.
 */
export interface LotteryExecution {
  id: string
  campaignId: string
  executedAt: string
  winnerIds: string[]
  operator: string
}

/**
 * Placeholder for the eventual live-broadcast configuration. No dedicated
 * "configure broadcast" screen exists yet in the supplied design (only the
 * live broadcast screen + a preview mode) — see ENGINEERING REPORT for the
 * note on this gap. Kept minimal and typed so a config screen can be added
 * later without touching the broadcast screens' props.
 */
export interface BroadcastConfig {
  campaignId: string
  bannerUrl?: string
  showConfetti: boolean
}

// ── Async resource shape used by hooks/useAsyncData ───────────────────────────
export type AsyncStatus = "idle" | "loading" | "success" | "error" | "empty"

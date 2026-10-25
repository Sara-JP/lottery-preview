// ── Dashboard Service ──────────────────────────────────────────────────────—
// Aggregates data for the dashboard overview. Composed from the other
// services rather than reading mockDb directly, so it automatically benefits
// once those move to a real backend.

import { logEntries } from "@/data/mockDb"
import {
  getCampaignsWithStatus,
  type CampaignWithStatus,
} from "@/services/campaigns.service"
import { getWinners } from "@/services/winners.service"
import type { LogEntry, Winner } from "@/types/domain"

export interface DashboardData {
  campaigns: CampaignWithStatus[]
  recentWinners: Winner[]
  recentActivity: LogEntry[]
  /** The campaign to feature in the "live now" banner, if any is active. */
  featuredCampaign: CampaignWithStatus["campaign"] | null
}

export async function getDashboardData(): Promise<DashboardData> {
  const [campaigns, winners] = await Promise.all([
    getCampaignsWithStatus(),
    getWinners(),
  ])
  return {
    campaigns,
    recentWinners: winners.slice(0, 3),
    recentActivity: [...logEntries],
    featuredCampaign:
      campaigns.find((c) => c.campaignStatus === "active")?.campaign ?? null,
  }
}

// ── Campaigns Service ─────────────────────────────────────────────────────────
// UI-facing data access for campaigns. Pages/hooks call ONLY these functions —
// never src/data/mockDb.ts directly — so swapping to a real backend later is a
// change confined to this file.

import { campaigns } from "@/data/mockDb"
import { mockDelay } from "@/services/api"
import { getAllLotteryExecutions } from "@/services/lottery.service"
import type { Campaign, CampaignStatus, LotteryStatus } from "@/types/domain"
import { generateId } from "@/utils/format"
import { getCampaignStatus, getLotteryStatus } from "@/utils/status"

export interface CreateCampaignPayload {
  name: string
  banner: string
  numWinners: number
  numReserve: number
}

export async function getCampaigns(): Promise<Campaign[]> {
  await mockDelay()
  return [...campaigns]
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  await mockDelay()
  return campaigns.find((c) => c.id === id) ?? null
}

export interface CampaignWithStatus {
  campaign: Campaign
  campaignStatus: CampaignStatus
  lotteryStatus: LotteryStatus
}

/**
 * Campaigns joined with their derived Campaign/Lottery Status (see
 * utils/status.ts). This is THE call every list-style screen (Campaigns,
 * Dashboard) should use instead of reading `campaign.status` directly, so all
 * screens agree with each other.
 */
export async function getCampaignsWithStatus(): Promise<CampaignWithStatus[]> {
  const [allCampaigns, executions] = await Promise.all([
    getCampaigns(),
    getAllLotteryExecutions(),
  ])
  return allCampaigns.map((campaign) => ({
    campaign,
    campaignStatus: getCampaignStatus(campaign, executions),
    lotteryStatus: getLotteryStatus(campaign, executions),
  }))
}

/** Single-campaign version of getCampaignsWithStatus(), for detail-style screens. */
export async function getCampaignWithStatus(
  id: string,
): Promise<CampaignWithStatus | null> {
  const [campaign, executions] = await Promise.all([
    getCampaign(id),
    getAllLotteryExecutions(),
  ])
  if (!campaign) return null
  return {
    campaign,
    campaignStatus: getCampaignStatus(campaign, executions),
    lotteryStatus: getLotteryStatus(campaign, executions),
  }
}

/**
 * Creates a campaign. Structured as an async, backend-ready call: validation
 * happens in the page (Persian messages, required fields), this function only
 * persists an already-valid payload and returns the created record so the
 * caller can navigate to it.
 */
export async function createCampaign(
  payload: CreateCampaignPayload,
): Promise<Campaign> {
  await mockDelay(500)
  const newCampaign: Campaign = {
    id: generateId("c"),
    name: payload.name,
    status: "upcoming",
    isActive: true,
    startDate: "—",
    endDate: "—",
    lotteryDate: "—",
    lotteryTime: "—",
    winners: payload.numWinners,
    reserveWinners: payload.numReserve,
    eligible: 0,
    codeLength: 8,
    description: "",
    banner: payload.banner || undefined,
  }
  campaigns.push(newCampaign)
  return newCampaign
}

export async function setCampaignActive(
  id: string,
  isActive: boolean,
): Promise<Campaign> {
  await mockDelay(200)
  const campaign = campaigns.find((c) => c.id === id)
  if (!campaign) throw new Error("Campaign not found")
  campaign.isActive = isActive
  return campaign
}

export async function saveCampaignNote(
  id: string,
  note: string,
): Promise<Campaign> {
  await mockDelay(200)
  const campaign = campaigns.find((c) => c.id === id)
  if (!campaign) throw new Error("Campaign not found")
  campaign.note = note
  campaign.noteUpdated = new Date().toLocaleString("fa-IR")
  return campaign
}

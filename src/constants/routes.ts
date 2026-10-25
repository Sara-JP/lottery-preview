// ── Route Paths ────────────────────────────────────────────────────────────—
// Single source of truth for route strings. Pages must navigate/link through
// these helpers instead of hard-coding paths, so a path never drifts out of
// sync between <Route> definitions and the `navigate()` / <Link> call sites.

export const ROUTES = {
  dashboard: "/dashboard",
  campaigns: "/campaigns",
  createCampaign: "/campaigns/new",
  campaignDetail: "/campaigns/:campaignId",
  campaignParticipants: "/campaigns/:campaignId/participants",
  campaignWinners: "/campaigns/:campaignId/winners",
  campaignLottery: "/campaigns/:campaignId/lottery",
  campaignBroadcast: "/campaigns/:campaignId/broadcast",
  campaignBroadcastPreview: "/campaigns/:campaignId/broadcast/preview",
  // Global (unscoped) lists — reachable from the sidebar, matching the
  // original design's global Participants/Winners screens.
  participants: "/participants",
  winners: "/winners",
} as const

export function campaignDetailPath(campaignId: string): string {
  return `/campaigns/${campaignId}`
}

export function campaignParticipantsPath(campaignId: string): string {
  return `/campaigns/${campaignId}/participants`
}

export function campaignWinnersPath(campaignId: string): string {
  return `/campaigns/${campaignId}/winners`
}

export function campaignLotteryPath(campaignId: string): string {
  return `/campaigns/${campaignId}/lottery`
}

export function campaignBroadcastPath(campaignId: string): string {
  return `/campaigns/${campaignId}/broadcast`
}

export function campaignBroadcastPreviewPath(campaignId: string): string {
  return `/campaigns/${campaignId}/broadcast/preview`
}

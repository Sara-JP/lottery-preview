// ── Winners Service ────────────────────────────────────────────────────────—

import { activity, reserveWinners, winners } from "@/data/mockDb"
import { mockDelay } from "@/services/api"
import type {
  ActivityEntry,
  EligibilityStatus,
  ReserveWinner,
  Winner,
} from "@/types/domain"
import { eligibilityLabel, generateId, nowShortTime } from "@/utils/format"

export async function getWinners(campaignId?: string): Promise<Winner[]> {
  await mockDelay()
  return campaignId
    ? winners.filter((w) => w.campaignId === campaignId)
    : [...winners]
}

export async function getReserveWinners(
  campaignId?: string,
): Promise<ReserveWinner[]> {
  await mockDelay()
  return campaignId
    ? reserveWinners.filter((r) => r.campaignId === campaignId)
    : [...reserveWinners]
}

export async function getActivity(
  campaignId: string,
): Promise<ActivityEntry[]> {
  await mockDelay()
  return activity.filter((a) => a.campaignId === campaignId)
}

function pushActivity(
  campaignId: string,
  message: string,
  type: ActivityEntry["type"],
) {
  activity.unshift({
    id: generateId("a"),
    time: nowShortTime(),
    message,
    type,
    campaignId,
  })
}

export async function updateWinnerEligibility(
  winnerId: string,
  campaignId: string,
  rank: number,
  newStatus: EligibilityStatus,
): Promise<Winner> {
  await mockDelay(200)
  const winner = winners.find((w) => w.id === winnerId)
  if (!winner) throw new Error("Winner not found")
  winner.eligibilityStatus = newStatus
  const { label } = eligibilityLabel(newStatus)
  pushActivity(
    campaignId,
    `وضعیت برنده شماره ${rank} به "${label}" تغییر کرد.`,
    newStatus === "ineligible" ? "danger" : "success",
  )
  return winner
}

/**
 * Activates the next waiting reserve participant as a replacement for the
 * given winner rank. Never runs automatically — always triggered by an
 * explicit admin confirmation from the calling page.
 */
export async function activateNextReserve(
  campaignId: string,
  replacedWinnerRank: number,
): Promise<ReserveWinner | null> {
  await mockDelay(300)
  const next = reserveWinners.find(
    (r) => r.campaignId === campaignId && r.status === "waiting",
  )
  if (!next) return null
  next.status = "replaced"
  next.replacedWinnerRank = replacedWinnerRank
  next.activatedAt = new Date().toLocaleString("fa-IR")
  pushActivity(
    campaignId,
    `فرد رزرو شماره ${next.rank} به عنوان جایگزین برنده ${replacedWinnerRank} فعال شد.`,
    "success",
  )
  return next
}

export async function saveCampaignNoteActivity(
  campaignId: string,
): Promise<void> {
  await mockDelay(150)
  pushActivity(campaignId, "یادداشت کمپین توسط ادمین ویرایش شد.", "info")
}

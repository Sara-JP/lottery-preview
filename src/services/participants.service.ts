// ── Participants Service ──────────────────────────────────────────────────────

import { participants } from "@/data/mockDb"
import { mockDelay } from "@/services/api"
import type { Participant } from "@/types/domain"
import { generateId } from "@/utils/format"
import type { ParticipantImportRow } from "@/utils/excel"

/**
 * Returns participants, filtered by campaignId when one is given. Every
 * seeded participant currently belongs to campaign c1 — the only campaign
 * with an active, in-progress lottery in the mock data — so other campaigns'
 * scoped views correctly show empty rather than a fabricated list.
 */
export async function getParticipants(campaignId?: string): Promise<Participant[]> {
  await mockDelay()
  return campaignId ? participants.filter(p => p.campaignId === campaignId) : [...participants]
}

export interface ImportParticipantsResult {
  added: number
  duplicates: number
  skipped: number
}

/**
 * Adds parsed rows to the pool for a campaign, skipping mobile numbers
 * already present for that campaign. Generates a lottery code per new
 * participant the same way the rest of the mock data does (not a real
 * code-generation algorithm — no spec was supplied for one).
 */
export async function importParticipants(
  campaignId: string,
  rows: ParticipantImportRow[],
  skippedDuringParse: number,
): Promise<ImportParticipantsResult> {
  await mockDelay(400)
  let added = 0
  let duplicates = 0

  for (const row of rows) {
    const exists = participants.some(p => p.campaignId === campaignId && p.mobile === row.mobile)
    if (exists) {
      duplicates++
      continue
    }
    participants.push({
      id: generateId("p"),
      mobile: row.mobile,
      lotteryCode: String(Math.floor(10_000_000 + Math.random() * 89_999_999)),
      rechargeCount: row.rechargeCount,
      eligible: row.rechargeCount > 0,
      createdAt: new Date().toLocaleDateString("fa-IR"),
      campaignId,
    })
    added++
  }

  return { added, duplicates, skipped: skippedDuringParse }
}

export async function deleteParticipant(id: string): Promise<void> {
  await mockDelay(200)
  const idx = participants.findIndex(p => p.id === id)
  if (idx !== -1) participants.splice(idx, 1)
}

export interface UpdateParticipantPayload {
  rechargeCount: number
  eligible: boolean
}

export async function updateParticipant(id: string, payload: UpdateParticipantPayload): Promise<Participant> {
  await mockDelay(250)
  const participant = participants.find(p => p.id === id)
  if (!participant) throw new Error("Participant not found")
  participant.rechargeCount = payload.rechargeCount
  participant.eligible = payload.eligible
  return participant
}

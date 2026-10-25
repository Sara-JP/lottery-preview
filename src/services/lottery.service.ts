// ── Lottery Service ────────────────────────────────────────────────────────—
// Owns the Lottery Operator flow: matching a drawn code to a participant,
// confirming a winner, and — critically — recording lottery execution history,
// which is the single source of truth `hasLotteryRun` reads from
// (src/utils/status.ts). No screen may set "completed" any other way.

import {
  campaigns,
  logEntries,
  lotteryExecutions,
  participants,
  winners,
} from "@/data/mockDb"
import { mockDelay } from "@/services/api"
import type {
  LogEntry,
  LotteryExecution,
  Participant,
  Winner,
} from "@/types/domain"
import { generateId, nowLogTime } from "@/utils/format"

export async function getLogEntries(): Promise<LogEntry[]> {
  await mockDelay()
  return [...logEntries]
}

export async function getLotteryExecutions(
  campaignId: string,
): Promise<LotteryExecution[]> {
  await mockDelay()
  return lotteryExecutions.filter((e) => e.campaignId === campaignId)
}

/** Full execution history across all campaigns — used by list screens (Campaigns, Dashboard) that need to derive lottery status per row without one request per campaign. */
export async function getAllLotteryExecutions(): Promise<LotteryExecution[]> {
  await mockDelay()
  return [...lotteryExecutions]
}

function pushLog(
  operator: string,
  action: string,
  type: LogEntry["type"],
): LogEntry[] {
  logEntries.unshift({
    id: generateId("l"),
    time: nowLogTime(),
    operator,
    action,
    type,
  })
  return [...logEntries]
}

/**
 * Matches a drawn code against participants belonging to THIS campaign only.
 * Participants are now campaign-scoped (see Participant.campaignId), so a
 * code entered in campaign A's operator panel must not be able to crown a
 * participant who only ever entered campaign B.
 */
export async function findParticipantByCode(
  code: string,
  campaignId: string,
): Promise<Participant | null> {
  await mockDelay(150)
  return participants.find(p => p.lotteryCode === code && p.campaignId === campaignId) ?? null
}

export interface ConfirmWinnerInput {
  campaignId: string
  rank: number
  participant: Participant
  operator: string
}

/**
 * Confirms a drawn participant as a winner for the given rank. If this
 * completes the campaign's configured winner count, it ALSO records a lottery
 * execution — the only event that flips Lottery Status to "completed".
 */
export async function confirmWinner(
  input: ConfirmWinnerInput,
): Promise<{ winner: Winner; completed: boolean }> {
  await mockDelay(250)
  const { campaignId, rank, participant, operator } = input
  const newWinner: Winner = {
    id: generateId("w"),
    rank,
    mobile: participant.mobile,
    lotteryCode: participant.lotteryCode,
    prize: `جایزه رتبه ${rank}`,
    prizeValue: "—",
    selectedAt: new Date().toLocaleString("fa-IR"),
    campaignId,
    eligibilityStatus: "pending",
  }
  winners.push(newWinner)
  pushLog(
    operator,
    `برنده شماره ${rank} تأیید شد: ${participant.mobile}`,
    "success",
  )

  const campaign = campaigns.find((c) => c.id === campaignId)
  const campaignWinnerCount = winners.filter(
    (w) => w.campaignId === campaignId,
  ).length
  let completed = false

  if (campaign && campaignWinnerCount >= campaign.winners) {
    const alreadyExecuted = lotteryExecutions.some(
      (e) => e.campaignId === campaignId,
    )
    if (!alreadyExecuted) {
      lotteryExecutions.push({
        id: generateId("le"),
        campaignId,
        executedAt: new Date().toLocaleString("fa-IR"),
        winnerIds: winners
          .filter((w) => w.campaignId === campaignId)
          .map((w) => w.id),
        operator,
      })
      pushLog(
        operator,
        "قرعه‌کشی با موفقیت به پایان رسید و در تاریخچه ثبت شد",
        "success",
      )
      completed = true
    }
  }

  return { winner: newWinner, completed }
}

// These are synchronous (no artificial mockDelay): they back real-time operator
// keystrokes, where even a fake 300ms network-simulation lag would make the
// digit pad feel unresponsive. Each returns the fresh log list so the caller
// can update its UI immediately without a round trip.
export function logDigitEntered(
  operator: string,
  digit: string,
  position: number,
): LogEntry[] {
  return pushLog(operator, `رقم ${digit} وارد شد (موقعیت ${position})`, "info")
}

export function logDigitCleared(
  operator: string,
  position: number,
): LogEntry[] {
  return pushLog(operator, `رقم موقعیت ${position} پاک شد`, "info")
}

export function logAllCleared(operator: string): LogEntry[] {
  return pushLog(operator, "تمام ارقام پاک شدند", "warning")
}

export function logNoMatch(operator: string): LogEntry[] {
  return pushLog(operator, "هیچ شرکت‌کننده‌ای با این کد یافت نشد", "warning")
}

export function logMatchFound(operator: string, mobile: string): LogEntry[] {
  return pushLog(operator, `شرکت‌کننده یافت شد: ${mobile}`, "success")
}

export function logWinnerRejected(operator: string): LogEntry[] {
  return pushLog(operator, "برنده رد شد — شروع مجدد", "danger")
}

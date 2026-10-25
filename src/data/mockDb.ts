// ── Mock "Database" ───────────────────────────────────────────────────────────
// This module is the DEVELOPMENT-ONLY mock data source. It plays the role a
// real backend would play: the service layer (src/services/*) is the only
// thing allowed to read/write it directly. Pages must never import from here.
//
// It is a plain in-memory module-level store (mutated by services), NOT
// localStorage — per the project brief, browser storage must not be used to
// fake permanent persistence. State here lives only for the current tab
// session and resets on reload, same as any other in-memory mock.
//
// When a real backend exists, delete this file and the mock branch of each
// service in src/services/*, keeping the exported function signatures the
// same so pages and hooks require no changes.

import type {
  ActivityEntry,
  Campaign,
  LogEntry,
  LotteryExecution,
  Participant,
  ReserveWinner,
  Winner,
} from "@/types/domain"

export const campaigns: Campaign[] = [
  {
    id: "c1",
    name: "جشنواره شارژ طلایی",
    status: "active",
    isActive: true,
    startDate: "۱۴۰۳/۰۱/۰۱",
    endDate: "۱۴۰۳/۰۳/۳۱",
    lotteryDate: "۱۴۰۳/۰۴/۰۱",
    lotteryTime: "۲۱:۰۰",
    winners: 10,
    reserveWinners: 5,
    eligible: 284_320,
    codeLength: 8,
    description: "قرعه‌کشی ویژه بهار برای مشترکین فعال",
    note: "هماهنگی با تیم حقوقی برای تأیید برندگان انجام شود.",
    noteUpdated: "۱۴۰۳/۰۴/۰۱ ۱۳:۰۲",
    banner:
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=450&fit=crop&auto=format",
  },
  {
    id: "c2",
    name: "جشن سالگرد ام‌تی‌ان ایرانسل",
    status: "upcoming",
    isActive: true,
    startDate: "۱۴۰۳/۰۵/۰۱",
    endDate: "۱۴۰۳/۰۶/۳۱",
    lotteryDate: "۱۴۰۳/۰۷/۰۱",
    lotteryTime: "۲۰:۳۰",
    winners: 5,
    reserveWinners: 3,
    eligible: 0,
    codeLength: 10,
    description: "جشن هفدهمین سالگرد ایرانسل",
    banner:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=450&fit=crop&auto=format",
  },
  {
    id: "c3",
    name: "کمپین تابستانه ۱۴۰۲",
    status: "finished",
    isActive: false,
    startDate: "۱۴۰۲/۰۴/۰۱",
    endDate: "۱۴۰۲/۰۶/۳۱",
    lotteryDate: "۱۴۰۲/۰۷/۰۱",
    lotteryTime: "۲۱:۰۰",
    winners: 8,
    reserveWinners: 4,
    eligible: 196_450,
    codeLength: 6,
    description: "قرعه‌کشی تابستانی",
  },
  {
    id: "c4",
    name: "جشنواره نوروزی ۱۴۰۲",
    status: "finished",
    isActive: false,
    startDate: "۱۴۰۲/۰۱/۰۱",
    endDate: "۱۴۰۲/۰۳/۳۱",
    lotteryDate: "۱۴۰۲/۰۴/۰۱",
    lotteryTime: "۲۰:۰۰",
    winners: 12,
    reserveWinners: 6,
    eligible: 312_000,
    codeLength: 8,
    description: "قرعه‌کشی نوروزی",
    note: "همه برندگان تأیید شده‌اند.",
    noteUpdated: "۱۴۰۲/۰۴/۰۲ ۱۰:۳۰",
  },
]

// Participants are not (yet) modeled per-campaign in the source design — every
// screen reads the same pool. Kept as-is rather than inventing a campaignId
// field the original data never had (see ENGINEERING REPORT).
export const participants: Participant[] = [
  {
    id: "p1",
    mobile: "09123456789",
    lotteryCode: "52847193",
    rechargeCount: 12,
    eligible: true,
    createdAt: "۱۴۰۳/۰۱/۱۵",
    campaignId: "c1",
  },
  {
    id: "p2",
    mobile: "09351234567",
    lotteryCode: "73910284",
    rechargeCount: 8,
    eligible: true,
    createdAt: "۱۴۰۳/۰۱/۱۶",
    campaignId: "c1",
  },
  {
    id: "p3",
    mobile: "09901234567",
    lotteryCode: "19472038",
    rechargeCount: 3,
    eligible: false,
    createdAt: "۱۴۰۳/۰۱/۱۷",
    campaignId: "c1",
  },
  {
    id: "p4",
    mobile: "09361234567",
    lotteryCode: "48201937",
    rechargeCount: 15,
    eligible: true,
    createdAt: "۱۴۰۳/۰۱/۱۸",
    campaignId: "c1",
  },
  {
    id: "p5",
    mobile: "09141234567",
    lotteryCode: "92048173",
    rechargeCount: 6,
    eligible: true,
    createdAt: "۱۴۰۳/۰۱/۱۹",
    campaignId: "c1",
  },
  {
    id: "p6",
    mobile: "09101234567",
    lotteryCode: "30917482",
    rechargeCount: 21,
    eligible: true,
    createdAt: "۱۴۰۳/۰۱/۲۰",
    campaignId: "c1",
  },
  {
    id: "p7",
    mobile: "09371234567",
    lotteryCode: "71482039",
    rechargeCount: 4,
    eligible: false,
    createdAt: "۱۴۰۳/۰۱/۲۱",
    campaignId: "c1",
  },
  {
    id: "p8",
    mobile: "09381234567",
    lotteryCode: "20938471",
    rechargeCount: 9,
    eligible: true,
    createdAt: "۱۴۰۳/۰۱/۲۲",
    campaignId: "c1",
  },
]

export const winners: Winner[] = [
  {
    id: "w1",
    rank: 1,
    mobile: "09123456789",
    lotteryCode: "52847193",
    prize: "خودروی پژو ۲۰۸",
    prizeValue: "۱٬۲۰۰٬۰۰۰٬۰۰۰ تومان",
    selectedAt: "۱۴۰۳/۰۴/۰۱ ۲۱:۱۴",
    campaignId: "c1",
    eligibilityStatus: "eligible",
  },
  {
    id: "w2",
    rank: 2,
    mobile: "09351234567",
    lotteryCode: "73910284",
    prize: "موتورسیکلت هوندا",
    prizeValue: "۱۲۰٬۰۰۰٬۰۰۰ تومان",
    selectedAt: "۱۴۰۳/۰۴/۰۱ ۲۱:۲۸",
    campaignId: "c1",
    eligibilityStatus: "eligible",
  },
  {
    id: "w3",
    rank: 3,
    mobile: "09901234567",
    lotteryCode: "19472038",
    prize: "یخچال دوقلو سامسونگ",
    prizeValue: "۴۵٬۰۰۰٬۰۰۰ تومان",
    selectedAt: "۱۴۰۳/۰۴/۰۱ ۲۱:۴۵",
    campaignId: "c1",
    eligibilityStatus: "ineligible",
  },
  {
    id: "w4",
    rank: 4,
    mobile: "09141234567",
    lotteryCode: "92048173",
    prize: "تلویزیون ۵۵ اینچ",
    prizeValue: "۳۵٬۰۰۰٬۰۰۰ تومان",
    selectedAt: "۱۴۰۳/۰۴/۰۱ ۲۲:۰۱",
    campaignId: "c1",
    eligibilityStatus: "pending",
  },
]

export const reserveWinners: ReserveWinner[] = [
  {
    id: "r1",
    rank: 1,
    mobile: "09101234567",
    lotteryCode: "30917482",
    status: "replaced",
    replacedWinnerRank: 3,
    activatedAt: "۱۴۰۳/۰۴/۰۱ ۱۲:۴۵",
    campaignId: "c1",
  },
  {
    id: "r2",
    rank: 2,
    mobile: "09381234567",
    lotteryCode: "20938471",
    status: "waiting",
    campaignId: "c1",
  },
  {
    id: "r3",
    rank: 3,
    mobile: "09361234567",
    lotteryCode: "48201937",
    status: "waiting",
    campaignId: "c1",
  },
  {
    id: "r4",
    rank: 4,
    mobile: "09371234567",
    lotteryCode: "71482039",
    status: "waiting",
    campaignId: "c1",
  },
  {
    id: "r5",
    rank: 5,
    mobile: "09141298765",
    lotteryCode: "63820194",
    status: "waiting",
    campaignId: "c1",
  },
]

export const activity: ActivityEntry[] = [
  {
    id: "a1",
    time: "۱۳:۱۰",
    message: 'وضعیت کمپین به "غیرفعال" تغییر کرد.',
    type: "warning",
    campaignId: "c1",
  },
  {
    id: "a2",
    time: "۱۳:۰۲",
    message: "یادداشت کمپین توسط ادمین ویرایش شد.",
    type: "info",
    campaignId: "c1",
  },
  {
    id: "a3",
    time: "۱۲:۴۵",
    message: "فرد رزرو شماره ۱ به عنوان جایگزین برنده ۳ فعال شد.",
    type: "success",
    campaignId: "c1",
  },
  {
    id: "a4",
    time: "۱۲:۴۳",
    message: 'وضعیت برنده شماره ۳ به "فاقد شرایط" تغییر کرد.',
    type: "danger",
    campaignId: "c1",
  },
  {
    id: "a5",
    time: "۱۲:۳۰",
    message: 'وضعیت برنده شماره ۲ به "واجد شرایط" تأیید شد.',
    type: "success",
    campaignId: "c1",
  },
  {
    id: "a6",
    time: "۱۲:۱۵",
    message: 'وضعیت برنده شماره ۱ به "واجد شرایط" تأیید شد.',
    type: "success",
    campaignId: "c1",
  },
]

export const logEntries: LogEntry[] = [
  {
    id: "l1",
    time: "۲۱:۴۵:۳۲",
    operator: "محمدی",
    action: "برنده شماره ۳ تأیید شد",
    type: "success",
  },
  {
    id: "l2",
    time: "۲۱:۴۴:۱۸",
    operator: "محمدی",
    action: "رقم ۸ وارد شد (موقعیت ۸)",
    type: "info",
  },
  {
    id: "l3",
    time: "۲۱:۴۳:۵۵",
    operator: "محمدی",
    action: "رقم ۷ وارد شد (موقعیت ۷)",
    type: "info",
  },
  {
    id: "l4",
    time: "۲۱:۴۳:۲۰",
    operator: "محمدی",
    action: "قرعه‌کشی برنده شماره ۳ آغاز شد",
    type: "info",
  },
  {
    id: "l5",
    time: "۲۱:۲۸:۰۵",
    operator: "محمدی",
    action: "برنده شماره ۲ تأیید شد",
    type: "success",
  },
  {
    id: "l6",
    time: "۲۱:۱۵:۱۱",
    operator: "رضایی",
    action: "اتصال برقرار شد",
    type: "info",
  },
]

// Lottery execution history — the ONLY evidence a lottery has actually run.
// c3 and c4 are historically finished campaigns whose lotteries already ran;
// c1 is mid-flight (winners partially selected via the operator panel but the
// full run has not been confirmed complete yet) and must NOT show as
// completed; c2 hasn't started.
export const lotteryExecutions: LotteryExecution[] = [
  {
    id: "le1",
    campaignId: "c3",
    executedAt: "۱۴۰۲/۰۷/۰۱ ۲۱:۴۰",
    winnerIds: [],
    operator: "محمدی",
  },
  {
    id: "le2",
    campaignId: "c4",
    executedAt: "۱۴۰۲/۰۴/۰۱ ۲۰:۳۵",
    winnerIds: [],
    operator: "محمدی",
  },
]

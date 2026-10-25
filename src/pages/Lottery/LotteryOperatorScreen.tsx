import { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Btn } from "@/components/common/Btn"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { Toast } from "@/components/common/Toast"
import { LoadingState, ErrorState } from "@/components/common/AsyncStates"
import { campaignDetailPath } from "@/constants/routes"
import { useAsyncData } from "@/hooks/useAsyncData"
import { useToast } from "@/hooks/useToast"
import { getCampaign } from "@/services/campaigns.service"
import {
  confirmWinner as confirmWinnerService,
  findParticipantByCode,
  getLogEntries,
  logAllCleared,
  logDigitCleared,
  logDigitEntered,
  logMatchFound,
  logNoMatch,
  logWinnerRejected,
} from "@/services/lottery.service"
import { getWinners } from "@/services/winners.service"
import type { Campaign, LogEntry, Participant, Winner } from "@/types/domain"

const OPERATOR_NAME = "محمدی"

interface LotteryOperatorData {
  campaign: Campaign
  winners: Winner[]
  logs: LogEntry[]
}

async function loadLotteryData(
  campaignId: string,
): Promise<LotteryOperatorData | null> {
  const campaign = await getCampaign(campaignId)
  if (!campaign) return null
  const [winners, logs] = await Promise.all([
    getWinners(campaignId),
    getLogEntries(),
  ])
  return { campaign, winners, logs }
}

export function LotteryOperatorScreen() {
  const { campaignId = "" } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()
  const { toast, showToast, clearToast } = useToast()
  const { data, status, error, refetch } = useAsyncData(
    () => loadLotteryData(campaignId),
    [campaignId],
  )

  const [codeLength, setCodeLength] = useState(8)
  const [digits, setDigits] = useState<string[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [flipped, setFlipped] = useState<boolean[]>([])
  const [matchedParticipant, setMatchedParticipant] =
    useState<Participant | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [winnerNumber, setWinnerNumber] = useState(1)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [currentWinners, setCurrentWinners] = useState<Winner[]>([])
  // Below `lg` the two side panels (campaign info / operator log) become
  // off-canvas drawers — see the responsive note above the return statement.
  const [infoOpen, setInfoOpen] = useState(false)
  const [logOpen, setLogOpen] = useState(false)

  useEffect(() => {
    if (data) {
      setCodeLength(data.campaign.codeLength)
      setDigits(Array(data.campaign.codeLength).fill(""))
      setFlipped(Array(data.campaign.codeLength).fill(false))
      setActiveIdx(0)
      setLogs(data.logs)
      setCurrentWinners(data.winners)
      setWinnerNumber(data.winners.length + 1)
    }
  }, [data])

  const enterDigit = useCallback(
    (d: string) => {
      if (activeIdx >= codeLength) return
      const newDigits = [...digits]
      newDigits[activeIdx] = d
      const newFlipped = [...flipped]
      newFlipped[activeIdx] = true
      setDigits(newDigits)
      setFlipped(newFlipped)
      setLogs(logDigitEntered(OPERATOR_NAME, d, activeIdx + 1))
      const nextIdx = activeIdx + 1
      setActiveIdx(nextIdx)
      if (nextIdx === codeLength) {
        const code = newDigits.join("")
        findParticipantByCode(code, campaignId).then((match) => {
          setMatchedParticipant(match)
          if (match) {
            setLogs(logMatchFound(OPERATOR_NAME, match.mobile))
            showToast("شرکت‌کننده پیدا شد!", "success")
          } else {
            setLogs(logNoMatch(OPERATOR_NAME))
            showToast("کد مطابق نیافت!", "error")
          }
        })
      }
    },
    [activeIdx, codeLength, digits, flipped, showToast, campaignId],
  )

  const handleKeyPress = useCallback(
    (key: string) => {
      if (key === "Backspace") {
        if (activeIdx > 0) {
          const newDigits = [...digits]
          const newFlipped = [...flipped]
          const idx = activeIdx - 1
          newDigits[idx] = ""
          newFlipped[idx] = false
          setDigits(newDigits)
          setFlipped(newFlipped)
          setActiveIdx(idx)
          setMatchedParticipant(null)
          setLogs(logDigitCleared(OPERATOR_NAME, idx + 1))
        }
      } else if (key === "Clear") {
        setDigits(Array(codeLength).fill(""))
        setFlipped(Array(codeLength).fill(false))
        setActiveIdx(0)
        setMatchedParticipant(null)
        setLogs(logAllCleared(OPERATOR_NAME))
      } else if (/^\d$/.test(key)) {
        enterDigit(key)
      }
    },
    [activeIdx, codeLength, digits, flipped, enterDigit],
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Backspace") handleKeyPress("Backspace")
      else if (/^\d$/.test(e.key)) handleKeyPress(e.key)
      else if (e.key === "Escape") handleKeyPress("Clear")
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [handleKeyPress])

  async function confirmWinnerAction() {
    if (!matchedParticipant) return
    setConfirmOpen(false)
    try {
      const { winner, completed } = await confirmWinnerService({
        campaignId,
        rank: winnerNumber,
        participant: matchedParticipant,
        operator: OPERATOR_NAME,
      })
      setCurrentWinners((w) => [...w, winner])
      setLogs(await getLogEntries())
      showToast(`برنده شماره ${winnerNumber} با موفقیت تأیید شد`, "success")
      if (completed) {
        showToast(
          "قرعه‌کشی این کمپین به پایان رسید و در تاریخچه ثبت شد.",
          "success",
        )
      }
      setWinnerNumber((n) => n + 1)
      setDigits(Array(codeLength).fill(""))
      setFlipped(Array(codeLength).fill(false))
      setActiveIdx(0)
      setMatchedParticipant(null)
    } catch {
      showToast("تأیید برنده با خطا مواجه شد.", "error")
    }
  }

  function rejectWinner() {
    setRejectOpen(false)
    setLogs(logWinnerRejected(OPERATOR_NAME))
    setDigits(Array(codeLength).fill(""))
    setFlipped(Array(codeLength).fill(false))
    setActiveIdx(0)
    setMatchedParticipant(null)
    showToast("برنده رد شد. دوباره تلاش کنید.", "error")
  }

  if (status === "loading")
    return <LoadingState label="در حال بارگذاری پنل اپراتور..." />
  if (status === "error")
    return <ErrorState message={error ?? undefined} onRetry={refetch} />
  if (!data) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <ErrorState message="کمپین مورد نظر یافت نشد." />
        <Btn variant="secondary" onClick={() => navigate(-1)}>
          بازگشت
        </Btn>
      </div>
    )
  }

  const { campaign } = data

  return (
    <div
      className="h-screen overflow-hidden flex flex-col"
      style={{ background: "var(--background)" }}
    >
      {toast && (
        <Toast message={toast.msg} type={toast.type} onClose={clearToast} />
      )}
      <ConfirmDialog
        open={confirmOpen}
        title="تأیید برنده"
        message={`آیا از تأیید این شرکت‌کننده به عنوان برنده شماره ${winnerNumber} اطمینان دارید؟`}
        onConfirm={confirmWinnerAction}
        onCancel={() => setConfirmOpen(false)}
        confirmLabel="بله، تأیید کن"
        variant="gold"
      />
      <ConfirmDialog
        open={rejectOpen}
        title="رد برنده"
        message="آیا از رد این برنده اطمینان دارید؟ این عملیات غیرقابل بازگشت است."
        onConfirm={rejectWinner}
        onCancel={() => setRejectOpen(false)}
        confirmLabel="رد کن"
        variant="danger"
      />

      <div
        role="banner"
        className="flex items-center justify-between gap-2 px-4 sm:px-6 py-4 border-b border-border"
        style={{ background: "var(--card)" }}
      >
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Btn
            variant="ghost"
            size="sm"
            onClick={() => navigate(campaignDetailPath(campaignId))}
          >
            → بازگشت
          </Btn>
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-danger live-pulse px-3 py-1.5 rounded-lg border border-danger/25 bg-danger/10 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-danger" />
            LIVE — پنل اپراتور
          </div>
          <span className="text-sm font-semibold text-foreground truncate">
            {campaign.name}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-success" />
            اتصال برقرار است
          </div>
          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            aria-label="اطلاعات کمپین و برندگان"
            className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-foreground hover:bg-secondary transition-all"
          >
            <span aria-hidden="true">ℹ</span>
          </button>
          <button
            type="button"
            onClick={() => setLogOpen(true)}
            aria-label="گزارش اپراتور"
            className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-foreground hover:bg-secondary transition-all"
          >
            <span aria-hidden="true">📋</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {(infoOpen || logOpen) && (
          <div
            className="fixed inset-0 z-30 lg:hidden"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={() => {
              setInfoOpen(false)
              setLogOpen(false)
            }}
            aria-hidden="true"
          />
        )}
        <div
          role="complementary"
          aria-label="اطلاعات کمپین و برندگان"
          className={`fixed inset-y-0 right-0 z-40 w-[85vw] max-w-72 transition-transform duration-200 lg:static lg:z-auto lg:w-72 lg:translate-x-0 ${
            infoOpen ? "translate-x-0" : "translate-x-full"
          } flex-shrink-0 border-l border-border p-5 flex flex-col gap-4 overflow-y-auto`}
          style={{ background: "var(--card)" }}
        >
          <button
            type="button"
            onClick={() => setInfoOpen(false)}
            aria-label="بستن"
            className="lg:hidden self-start w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
          >
            ✕
          </button>
          <div className="rounded-xl p-4 bg-secondary/60 border border-border">
            <div className="text-xs text-muted-foreground mb-2">کمپین فعال</div>
            <div className="text-sm font-bold text-foreground">
              {campaign.name}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3 bg-secondary/60 border border-border text-center">
              <div className="text-xl font-black text-primary">
                {winnerNumber}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                برنده فعلی
              </div>
            </div>
            <div className="rounded-xl p-3 bg-secondary/60 border border-border text-center">
              <div className="text-xl font-black text-foreground">
                {Math.max(0, campaign.winners - winnerNumber + 1)}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                باقی‌مانده
              </div>
            </div>
          </div>
          <div className="rounded-xl aspect-video bg-secondary border border-border overflow-hidden">
            <img
              src={
                campaign.banner ||
                "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=225&fit=crop&auto=format"
              }
              alt="بنر کمپین"
              className="w-full h-full object-cover opacity-70"
            />
          </div>
          <div>
            <div className="text-xs font-bold text-muted-foreground mb-2">
              برندگان تأیید شده
            </div>
            {currentWinners.slice(-5).map((w) => (
              <div
                key={w.id}
                className="flex items-center gap-2 py-2 border-b border-border last:border-0"
              >
                <div className="w-6 h-6 rounded-lg bg-accent/15 flex items-center justify-center text-accent text-xs font-bold">
                  {w.rank}
                </div>
                <span
                  className="text-xs text-foreground flex-1"
                  style={{ fontFamily: "'JetBrains Mono'" }}
                >
                  {w.mobile}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          role="main"
          className="flex-1 flex flex-col items-center justify-center p-8 gap-8 overflow-y-auto"
        >
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground mb-1">
              ورود کد قرعه‌کشی
            </h1>
            <p className="text-sm text-muted-foreground">
              هر رقم را پس از استخراج از ماشین قرعه‌کشی وارد کنید
            </p>
          </div>

          <div className="flex gap-1.5 sm:gap-3 max-w-full overflow-x-auto px-1 py-1" style={{ perspective: "800px" }}>
            {digits.map((d, i) => (
              <div
                key={i}
                className={`relative w-9 h-12 sm:w-16 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center cursor-pointer transition-all flex-shrink-0 ${
                  flipped[i]
                    ? "digit-box-filled digit-glow"
                    : i === activeIdx
                      ? "border-2 border-primary/60 bg-primary/5 border-glow"
                      : "digit-box-empty"
                }`}
              >
                {flipped[i] ? (
                  <span
                    className="text-xl sm:text-4xl font-black text-primary digit-flip"
                    style={{ fontFamily: "'JetBrains Mono'" }}
                  >
                    {d}
                  </span>
                ) : i === activeIdx ? (
                  <span className="w-0.5 h-4 sm:h-8 bg-primary rounded-full live-pulse" />
                ) : (
                  <span className="text-xs sm:text-2xl text-muted-foreground/30 font-bold">
                    {i + 1}
                  </span>
                )}
              </div>
            ))}
          </div>

          {matchedParticipant && (
            <div
              className="winner-reveal w-full max-w-md rounded-2xl p-6 border border-accent/30 gold-glow"
              style={{
                background:
                  "linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(255,203,5,0.05) 100%)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-accent px-2.5 py-1 rounded-lg border border-accent/25 bg-accent/10">
                  شرکت‌کننده یافت شد
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    شماره موبایل
                  </div>
                  <div
                    className="text-lg font-bold text-foreground"
                    style={{ fontFamily: "'JetBrains Mono'" }}
                  >
                    {matchedParticipant.mobile}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    تعداد شارژ
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {matchedParticipant.rechargeCount}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    واجد شرایط
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      matchedParticipant.eligible
                        ? "text-success"
                        : "text-danger"
                    }`}
                  >
                    {matchedParticipant.eligible ? "✓ بله" : "✕ خیر"}
                  </span>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    جایزه
                  </div>
                  <div className="text-sm font-semibold text-foreground">{`جایزه رتبه ${winnerNumber}`}</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-2">
              {["۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"].map((n, i) => (
                <button
                  key={n}
                  onClick={() => handleKeyPress(String(i + 1))}
                  className="w-16 h-14 rounded-xl bg-secondary border border-border text-xl font-bold text-foreground hover:bg-primary hover:text-primary-foreground hover:yellow-shadow transition-all active:scale-95"
                  style={{ fontFamily: "'JetBrains Mono'" }}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleKeyPress("Clear")}
                className="w-16 h-14 rounded-xl bg-danger/10 border border-danger/20 text-xs font-bold text-danger hover:bg-danger/20 transition-all"
              >
                پاک
              </button>
              <button
                onClick={() => handleKeyPress("0")}
                className="w-16 h-14 rounded-xl bg-secondary border border-border text-xl font-bold text-foreground hover:bg-primary hover:text-primary-foreground transition-all active:scale-95"
                style={{ fontFamily: "'JetBrains Mono'" }}
              >
                ۰
              </button>
              <button
                onClick={() => handleKeyPress("Backspace")}
                className="w-16 h-14 rounded-xl bg-secondary border border-border text-base font-bold text-foreground hover:bg-secondary/80 transition-all"
              >
                ⌫
              </button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {matchedParticipant && (
              <>
                <Btn variant="gold" onClick={() => setConfirmOpen(true)}>
                  ✓ تأیید برنده
                </Btn>
                <Btn variant="danger" onClick={() => setRejectOpen(true)}>
                  ✕ رد برنده
                </Btn>
              </>
            )}
            <Btn variant="secondary" onClick={() => handleKeyPress("Clear")}>
              ریست
            </Btn>
            <Btn variant="ghost">توقف اضطراری</Btn>
          </div>
        </div>

        <div
          role="complementary"
          aria-label="گزارش اپراتور"
          className={`fixed inset-y-0 left-0 z-40 w-[85vw] max-w-72 transition-transform duration-200 lg:static lg:z-auto lg:w-72 lg:translate-x-0 ${
            logOpen ? "translate-x-0" : "-translate-x-full"
          } flex-shrink-0 border-r border-border flex flex-col overflow-hidden`}
          style={{ background: "var(--card)" }}
        >
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">گزارش اپراتور</h2>
            <button
              type="button"
              onClick={() => setLogOpen(false)}
              aria-label="بستن"
              className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {logs.map((l) => (
              <div
                key={l.id}
                className="flex flex-col gap-0.5 py-2.5 border-b border-border last:border-0 slide-in-up"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      l.type === "success"
                        ? "bg-success"
                        : l.type === "danger"
                          ? "bg-danger"
                          : l.type === "warning"
                            ? "bg-warning"
                            : "bg-muted-foreground"
                    }`}
                  />
                  <span className="text-xs font-medium text-foreground flex-1">
                    {l.action}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground mr-3.5">
                  {l.operator} • {l.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

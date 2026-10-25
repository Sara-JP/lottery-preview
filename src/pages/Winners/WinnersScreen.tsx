import { useNavigate, useParams } from "react-router-dom"
import { Btn } from "@/components/common/Btn"
import { StatCard } from "@/components/common/StatCard"
import { EligibilityControl } from "@/components/common/EligibilityControl"
import { Toast } from "@/components/common/Toast"
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/common/AsyncStates"
import { ROUTES } from "@/constants/routes"
import { useAsyncData } from "@/hooks/useAsyncData"
import { useToast } from "@/hooks/useToast"
import { getWinners, updateWinnerEligibility } from "@/services/winners.service"
import { useState, useEffect } from "react"
import type { EligibilityStatus, Winner } from "@/types/domain"
import { exportToCsv, exportToExcel } from "@/utils/excel"

function winnerExportRows(winners: Winner[]) {
  return winners.map(w => ({
    rank: w.rank,
    mobile: w.mobile,
    lotteryCode: w.lotteryCode,
    prize: w.prize,
    prizeValue: w.prizeValue,
    eligibilityStatus: w.eligibilityStatus,
    selectedAt: w.selectedAt,
  }))
}

export function WinnersScreen() {
  const { campaignId } = useParams<{ campaignId?: string }>()
  const navigate = useNavigate()
  const { toast, showToast, clearToast } = useToast()
  const { data, status, error, refetch } = useAsyncData(
    () => getWinners(campaignId),
    [campaignId],
  )
  const [winners, setWinners] = useState<Winner[]>([])

  useEffect(() => {
    if (data) setWinners(data)
  }, [data])

  async function handleEligibility(
    id: string,
    rank: number,
    s: EligibilityStatus,
  ) {
    const winner = winners.find((w) => w.id === id)
    if (!winner) return
    try {
      await updateWinnerEligibility(id, winner.campaignId, rank, s)
      setWinners((prev) =>
        prev.map((w) => (w.id === id ? { ...w, eligibilityStatus: s } : w)),
      )
      showToast("وضعیت برنده با موفقیت تغییر کرد.", "success")
    } catch {
      showToast("تغییر وضعیت برنده با خطا مواجه شد.", "error")
    }
  }

  return (
    <div className="p-8 fade-in">
      {toast && (
        <Toast message={toast.msg} type={toast.type} onClose={clearToast} />
      )}

      {campaignId && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button
            onClick={() => navigate(ROUTES.campaigns)}
            className="hover:text-foreground transition-all"
          >
            کمپین‌ها
          </button>
          <span>/</span>
          <span className="text-foreground font-medium">برندگان</span>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">برندگان</h1>
          <p className="text-sm text-muted-foreground mt-1">
            نتایج قرعه‌کشی‌های انجام‌شده
          </p>
        </div>
        <div className="flex flex-wrap gap-3 no-print">
          <Btn variant="secondary" disabled={winners.length === 0} onClick={() => window.print()}>
            چاپ
          </Btn>
          <Btn
            variant="secondary"
            disabled={winners.length === 0}
            onClick={() => {
              exportToCsv(winnerExportRows(winners), "winners.csv")
              showToast("فایل CSV با موفقیت آماده شد.", "success")
            }}
          >
            خروجی CSV
          </Btn>
          <Btn
            variant="primary"
            icon="⬇"
            disabled={winners.length === 0}
            onClick={() => {
              exportToExcel(winnerExportRows(winners), "winners.xlsx")
              showToast("فایل Excel با موفقیت آماده شد.", "success")
            }}
          >
            خروجی Excel
          </Btn>
        </div>
      </div>

      {status === "loading" && (
        <LoadingState label="در حال بارگذاری برندگان..." />
      )}
      {status === "error" && (
        <ErrorState message={error ?? undefined} onRetry={refetch} />
      )}
      {status === "empty" && <EmptyState title="هنوز برنده‌ای ثبت نشده است" />}

      {status === "success" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <StatCard
              label="کل برندگان"
              value={winners.length.toLocaleString("fa-IR")}
              icon="🏆"
            />
            <StatCard
              label="واجد شرایط"
              value={winners
                .filter((w) => w.eligibilityStatus === "eligible")
                .length.toLocaleString("fa-IR")}
              icon="✓"
            />
            <StatCard
              label="فاقد شرایط"
              value={winners
                .filter((w) => w.eligibilityStatus === "ineligible")
                .length.toLocaleString("fa-IR")}
              icon="✕"
              accent
            />
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-visible card-shadow">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {[
                    "رتبه",
                    "شماره موبایل",
                    "کد قرعه‌کشی",
                    "جایزه",
                    "ارزش جایزه",
                    "وضعیت احراز",
                    "زمان انتخاب",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-right px-5 py-4 text-xs font-bold text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {winners.map((w) => (
                  <tr
                    key={w.id}
                    className="table-row-hover border-b border-border last:border-0"
                  >
                    <td className="px-5 py-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
                        style={{
                          background:
                            w.rank === 1
                              ? "linear-gradient(135deg,#D4AF37,#F5D75E)"
                              : w.rank === 2
                                ? "rgba(192,192,192,0.15)"
                                : "rgba(205,127,50,0.15)",
                          color:
                            w.rank === 1
                              ? "#111"
                              : w.rank === 2
                                ? "#A0A0A0"
                                : "#CD7F32",
                        }}
                      >
                        {w.rank}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="text-sm font-bold text-foreground"
                        style={{ fontFamily: "'JetBrains Mono'" }}
                      >
                        {w.mobile}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="text-sm text-primary font-bold"
                        style={{
                          fontFamily: "'JetBrains Mono'",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {w.lotteryCode}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-foreground">
                      {w.prize}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="text-sm font-bold text-accent"
                        style={{ fontFamily: "'JetBrains Mono'" }}
                      >
                        {w.prizeValue}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <EligibilityControl
                        status={w.eligibilityStatus}
                        onConfirm={(s) => handleEligibility(w.id, w.rank, s)}
                      />
                    </td>
                    <td
                      className="px-5 py-4 text-sm text-muted-foreground"
                      style={{ fontFamily: "'JetBrains Mono'" }}
                    >
                      {w.selectedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Btn } from "@/components/common/Btn"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { EligibilityControl } from "@/components/common/EligibilityControl"
import {
  StatusBadge,
  CampaignStatusBadge,
} from "@/components/common/StatusBadge"
import { Toast } from "@/components/common/Toast"
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/common/AsyncStates"
import { ROUTES, campaignBroadcastPath, campaignLotteryPath } from "@/constants/routes"
import { useAsyncData } from "@/hooks/useAsyncData"
import { useToast } from "@/hooks/useToast"
import {
  getCampaignWithStatus,
  saveCampaignNote,
  type CampaignWithStatus,
} from "@/services/campaigns.service"
import {
  activateNextReserve,
  getActivity,
  getReserveWinners,
  getWinners,
  saveCampaignNoteActivity,
  updateWinnerEligibility,
} from "@/services/winners.service"
import type {
  ActivityEntry,
  EligibilityStatus,
  ReserveWinner,
  Winner,
} from "@/types/domain"
import { reserveStatusLabel } from "@/utils/format"
import { lotteryStatusLabel } from "@/utils/status"

interface CampaignDetailData {
  campaignWithStatus: CampaignWithStatus
  winners: Winner[]
  reserves: ReserveWinner[]
  activity: ActivityEntry[]
}

async function loadCampaignDetail(
  campaignId: string,
): Promise<CampaignDetailData | null> {
  const campaignWithStatus = await getCampaignWithStatus(campaignId)
  if (!campaignWithStatus) return null
  const [winners, reserves, activity] = await Promise.all([
    getWinners(campaignId),
    getReserveWinners(campaignId),
    getActivity(campaignId),
  ])
  return { campaignWithStatus, winners, reserves, activity }
}

function ReserveStatusCell({
  status,
  disabled,
}: {
  status: ReserveWinner["status"]
  disabled: boolean
}) {
  const { label, cls } = reserveStatusLabel(status)
  return (
    <StatusBadge
      label={label}
      cls={disabled ? "bg-secondary text-muted-foreground border-border" : cls}
    />
  )
}

export function CampaignDetailScreen() {
  const { campaignId = "" } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()
  const { toast, showToast, clearToast } = useToast()
  const { data, status, error, refetch } = useAsyncData(
    () => loadCampaignDetail(campaignId),
    [campaignId],
  )

  const [winners, setWinners] = useState<Winner[]>([])
  const [reserves, setReserves] = useState<ReserveWinner[]>([])
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [note, setNote] = useState("")
  const [noteEditing, setNoteEditing] = useState(false)
  const [noteVal, setNoteVal] = useState("")
  const [activateReserveFor, setActivateReserveFor] = useState<{
    winnerId: string
    rank: number
  } | null>(null)

  useEffect(() => {
    if (data) {
      setWinners(data.winners)
      setReserves(data.reserves)
      setActivity(data.activity)
      setNote(data.campaignWithStatus.campaign.note || "")
    }
  }, [data])

  if (status === "loading")
    return <LoadingState label="در حال بارگذاری کمپین..." />
  if (status === "error")
    return <ErrorState message={error ?? undefined} onRetry={refetch} />
  if (!data) {
    return (
      <div className="p-8">
        <EmptyState
          title="کمپین یافت نشد"
          description="این کمپین ممکن است حذف شده یا نشانی آن نادرست باشد."
        />
        <div className="flex justify-center mt-4">
          <Btn variant="secondary" onClick={() => navigate(ROUTES.campaigns)}>
            بازگشت به کمپین‌ها
          </Btn>
        </div>
      </div>
    )
  }

  const { campaign, campaignStatus, lotteryStatus } = data.campaignWithStatus
  const { label: lotLabel, cls: lotCls } = lotteryStatusLabel(lotteryStatus)
  const hasReplacementFor = (rank: number) =>
    reserves.some((r) => r.replacedWinnerRank === rank)

  async function handleEligibilityChange(
    winnerId: string,
    rank: number,
    newStatus: EligibilityStatus,
  ) {
    try {
      await updateWinnerEligibility(winnerId, campaignId, rank, newStatus)
      setWinners((prev) =>
        prev.map((w) =>
          w.id === winnerId ? { ...w, eligibilityStatus: newStatus } : w,
        ),
      )
      setActivity(await getActivity(campaignId))
      showToast("وضعیت برنده با موفقیت تغییر کرد.", "success")
    } catch {
      showToast("تغییر وضعیت برنده با خطا مواجه شد.", "error")
    }
  }

  async function confirmActivateReserve() {
    if (!activateReserveFor) return
    try {
      const activated = await activateNextReserve(
        campaignId,
        activateReserveFor.rank,
      )
      if (activated) {
        setReserves((prev) =>
          prev.map((r) => (r.id === activated.id ? activated : r)),
        )
        setActivity(await getActivity(campaignId))
        showToast("فرد رزرو با موفقیت فعال شد.", "success")
      } else {
        showToast("فرد رزروی برای فعال‌سازی باقی نمانده است.", "error")
      }
    } catch {
      showToast("فعال‌سازی فرد رزرو با خطا مواجه شد.", "error")
    } finally {
      setActivateReserveFor(null)
    }
  }

  async function handleSaveNote() {
    try {
      await saveCampaignNote(campaignId, noteVal)
      await saveCampaignNoteActivity(campaignId)
      setNote(noteVal)
      setNoteEditing(false)
      setActivity(await getActivity(campaignId))
      showToast("یادداشت ذخیره شد.", "success")
    } catch {
      showToast("ذخیره یادداشت با خطا مواجه شد.", "error")
    }
  }

  async function handleDeleteNote() {
    try {
      await saveCampaignNote(campaignId, "")
      setNote("")
      setNoteEditing(false)
      showToast("یادداشت حذف شد.", "success")
    } catch {
      showToast("حذف یادداشت با خطا مواجه شد.", "error")
    }
  }

  return (
    <div className="p-8 fade-in">
      {toast && (
        <Toast message={toast.msg} type={toast.type} onClose={clearToast} />
      )}
      <ConfirmDialog
        open={activateReserveFor !== null}
        title="فعال‌سازی فرد رزرو"
        message={`آیا از فعال‌سازی اولین فرد رزرو موجود به عنوان جایگزین برنده شماره ${activateReserveFor?.rank} مطمئن هستید؟`}
        confirmLabel="بله، فعال کن"
        variant="gold"
        onConfirm={confirmActivateReserve}
        onCancel={() => setActivateReserveFor(null)}
      />

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <button
          onClick={() => navigate(ROUTES.campaigns)}
          className="hover:text-foreground transition-all"
        >
          کمپین‌ها
        </button>
        <span>/</span>
        <span className="text-foreground font-medium">{campaign.name}</span>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden card-shadow mb-6">
        <div className="flex flex-col sm:flex-row gap-0">
          {campaign.banner && (
            <div className="w-full h-40 sm:w-64 sm:h-auto flex-shrink-0 relative">
              <img
                src={campaign.banner}
                alt={campaign.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-card via-card/20 to-transparent hidden sm:block" />
            </div>
          )}
          <div className="flex-1 p-5 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {campaign.name}
                </h1>
                <div className="flex items-center gap-3">
                  <StatusBadge label={lotLabel} cls={lotCls} />
                  <CampaignStatusBadge status={campaignStatus} />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Btn
                  variant="primary"
                  onClick={() => navigate(campaignLotteryPath(campaignId))}
                >
                  ورود به پنل اپراتور
                </Btn>
                <Btn
                  variant="secondary"
                  onClick={() => navigate(campaignBroadcastPath(campaignId))}
                >
                  پخش زنده
                </Btn>
                <Btn
                  variant="secondary"
                  onClick={() => navigate(ROUTES.createCampaign)}
                >
                  ✎ ویرایش کمپین
                </Btn>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
              {[
                { label: "تاریخ قرعه‌کشی", value: campaign.lotteryDate },
                { label: "برندگان اصلی", value: `${campaign.winners} نفر` },
                {
                  label: "افراد رزرو",
                  value: `${campaign.reserveWinners} نفر`,
                },
                {
                  label: "شرکت‌کنندگان",
                  value:
                    campaign.eligible > 0
                      ? campaign.eligible.toLocaleString("fa-IR")
                      : "—",
                },
              ].map((s) => (
                <div key={s.label} className="p-3 bg-secondary/50 rounded-xl">
                  <div className="text-xs text-muted-foreground mb-1">
                    {s.label}
                  </div>
                  <div className="text-base font-bold text-foreground">
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-visible card-shadow mb-6">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">برندگان اصلی</h2>
        </div>
        {winners.length === 0 ? (
          <EmptyState title="هنوز برنده‌ای برای این کمپین ثبت نشده است" />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {[
                  "ردیف",
                  "کد قرعه‌کشی",
                  "شماره موبایل",
                  "وضعیت احراز شرایط",
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
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
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
                      className="text-sm text-primary font-bold"
                      style={{
                        fontFamily: "'JetBrains Mono'",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {w.lotteryCode}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="text-sm font-semibold text-foreground"
                      style={{ fontFamily: "'JetBrains Mono'" }}
                    >
                      {w.mobile}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <EligibilityControl
                        status={w.eligibilityStatus}
                        onConfirm={(s) =>
                          handleEligibilityChange(w.id, w.rank, s)
                        }
                      />
                      {w.eligibilityStatus === "ineligible" &&
                        !hasReplacementFor(w.rank) && (
                          <Btn
                            variant="gold"
                            size="sm"
                            onClick={() =>
                              setActivateReserveFor({
                                winnerId: w.id,
                                rank: w.rank,
                              })
                            }
                          >
                            انتخاب فرد رزرو
                          </Btn>
                        )}
                    </div>
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
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden card-shadow mb-6">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">لیست رزرو</h2>
          <span className="text-xs text-muted-foreground">
            {reserves.filter((r) => r.status === "waiting").length} نفر در
            انتظار
          </span>
        </div>
        {reserves.length === 0 ? (
          <EmptyState title="فهرست رزروی برای این کمپین ثبت نشده است" />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {[
                  "رتبه رزرو",
                  "کد قرعه‌کشی",
                  "شماره موبایل",
                  "وضعیت",
                  "جایگزینی",
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
              {reserves.map((r) => {
                const disabled = r.status === "waiting"
                return (
                  <tr
                    key={r.id}
                    className={`border-b border-border last:border-0 transition-all ${
                      disabled ? "opacity-40" : "table-row-hover"
                    }`}
                    style={
                      disabled
                        ? { background: "rgba(255,255,255,0.015)" }
                        : undefined
                    }
                  >
                    <td className="px-5 py-4">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          disabled
                            ? "bg-secondary text-muted-foreground"
                            : "bg-accent/15 text-accent"
                        }`}
                      >
                        {r.rank}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-sm font-bold ${
                          disabled ? "text-muted-foreground" : "text-primary"
                        }`}
                        style={{ fontFamily: "'JetBrains Mono'" }}
                      >
                        {r.lotteryCode}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-sm font-semibold ${
                          disabled ? "text-muted-foreground" : "text-foreground"
                        }`}
                        style={{ fontFamily: "'JetBrains Mono'" }}
                      >
                        {r.mobile}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <ReserveStatusCell
                        status={r.status}
                        disabled={disabled}
                      />
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {r.status === "replaced" && r.replacedWinnerRank ? (
                        <span className="text-accent font-semibold">
                          جایگزین برنده شماره {r.replacedWinnerRank}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 card-shadow mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">
            یادداشت‌های ادمین
          </h2>
          <Btn
            variant="ghost"
            size="sm"
            onClick={() => {
              setNoteVal(note)
              setNoteEditing(true)
            }}
          >
            {note ? "ویرایش" : "+ افزودن یادداشت"}
          </Btn>
        </div>
        {note ? (
          <div className="p-4 bg-secondary/50 rounded-xl border border-border text-sm text-foreground leading-relaxed">
            {note}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
            هنوز یادداشتی ثبت نشده است
          </div>
        )}
        {noteEditing && (
          <div className="mt-4 flex flex-col gap-3">
            <textarea
              value={noteVal}
              onChange={(e) => setNoteVal(e.target.value)}
              rows={4}
              aria-label="یادداشت کمپین"
              className="w-full p-4 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 resize-none transition-all"
            />
            <div className="flex gap-3">
              <Btn variant="primary" size="sm" onClick={handleSaveNote}>
                ذخیره
              </Btn>
              <Btn
                variant="ghost"
                size="sm"
                onClick={() => setNoteEditing(false)}
              >
                انصراف
              </Btn>
              {note && (
                <Btn variant="danger" size="sm" onClick={handleDeleteNote}>
                  حذف یادداشت
                </Btn>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 card-shadow">
        <h2 className="text-lg font-bold text-foreground mb-6">
          تاریخچه تغییرات
        </h2>
        {activity.length === 0 ? (
          <EmptyState title="فعالیتی ثبت نشده است" />
        ) : (
          <div className="flex flex-col">
            {activity.map((a, i) => (
              <div key={a.id} className="flex gap-4 relative pb-4 last:pb-0">
                {i < activity.length - 1 && (
                  <div className="absolute right-3.5 top-7 bottom-0 w-px bg-border" />
                )}
                <div
                  className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${
                    a.type === "success"
                      ? "bg-success/15 text-success"
                      : a.type === "danger"
                        ? "bg-danger/15 text-danger"
                        : a.type === "warning"
                          ? "bg-warning/15 text-warning"
                          : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {a.type === "success" ? "✓" : a.type === "danger" ? "!" : "·"}
                </div>
                <div className="flex-1">
                  <div
                    className="text-sm text-foreground"
                    style={{ fontFamily: "'Vazirmatn'" }}
                  >
                    {a.time} — {a.message}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

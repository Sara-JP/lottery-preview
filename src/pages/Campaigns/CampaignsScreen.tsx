import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Btn } from "@/components/common/Btn"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { NotesDrawer } from "@/components/common/NotesDrawer"
import { OverflowMenu } from "@/components/common/OverflowMenu"
import { StatusBadge } from "@/components/common/StatusBadge"
import { ActiveToggle } from "@/components/common/ActiveToggle"
import { Toast } from "@/components/common/Toast"
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/common/AsyncStates"
import { ROUTES, campaignDetailPath } from "@/constants/routes"
import { useAsyncData } from "@/hooks/useAsyncData"
import { useToast } from "@/hooks/useToast"
import {
  getCampaignsWithStatus,
  setCampaignActive,
  saveCampaignNote,
} from "@/services/campaigns.service"
import type { Campaign } from "@/types/domain"
import { lotteryStatusLabel, campaignStatusLabel } from "@/utils/status"
import { exportToExcel } from "@/utils/excel"

const PAGE_SIZE = 10

export function CampaignsScreen() {
  const navigate = useNavigate()
  const { data, status, error, refetch } = useAsyncData(
    getCampaignsWithStatus,
    [],
  )
  const { toast, showToast, clearToast } = useToast()

  const [page, setPage] = useState(1)
  const [toggleConfirm, setToggleConfirm] = useState<{
    id: string
    newVal: boolean
  } | null>(null)
  const [notesFor, setNotesFor] = useState<Campaign | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState(false)

  const totalPages = Math.max(1, Math.ceil((data?.length ?? 0) / PAGE_SIZE))
  const pageItems = useMemo(() => {
    if (!data) return []
    const start = (page - 1) * PAGE_SIZE
    return data.slice(start, start + PAGE_SIZE)
  }, [data, page])

  const doToggle = async () => {
    if (!toggleConfirm) return
    setPendingAction(true)
    try {
      await setCampaignActive(toggleConfirm.id, toggleConfirm.newVal)
      showToast(
        `کمپین با موفقیت ${toggleConfirm.newVal ? "فعال" : "غیرفعال"} شد.`,
        "success",
      )
      refetch()
    } catch {
      showToast("تغییر وضعیت کمپین با خطا مواجه شد.", "error")
    } finally {
      setPendingAction(false)
      setToggleConfirm(null)
    }
  }

  const saveNote = async (id: string, note: string) => {
    try {
      await saveCampaignNote(id, note)
      showToast("یادداشت با موفقیت ذخیره شد.", "success")
      refetch()
    } catch {
      showToast("ذخیره یادداشت با خطا مواجه شد.", "error")
    }
  }

  return (
    <div className="p-8 fade-in">
      {toast && (
        <Toast message={toast.msg} type={toast.type} onClose={clearToast} />
      )}
      <ConfirmDialog
        open={toggleConfirm !== null}
        title={toggleConfirm?.newVal ? "فعال‌سازی کمپین" : "غیرفعال‌سازی کمپین"}
        message={
          toggleConfirm?.newVal
            ? "آیا از فعال کردن این کمپین مطمئن هستید؟"
            : "آیا از غیرفعال کردن این کمپین مطمئن هستید؟"
        }
        variant={toggleConfirm?.newVal ? "primary" : "danger"}
        confirmLabel={
          pendingAction
            ? "در حال ثبت..."
            : toggleConfirm?.newVal
              ? "فعال کن"
              : "غیرفعال کن"
        }
        onConfirm={doToggle}
        onCancel={() => setToggleConfirm(null)}
      />
      {notesFor && (
        <NotesDrawer
          open
          campaignName={notesFor.name}
          note={notesFor.note || ""}
          noteUpdated={notesFor.noteUpdated}
          onSave={(v) => saveNote(notesFor.id, v)}
          onClose={() => setNotesFor(null)}
        />
      )}

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">کمپین‌ها</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data?.length ?? 0} کمپین در سیستم
          </p>
        </div>
        <Btn variant="primary" onClick={() => navigate(ROUTES.createCampaign)}>
          + ایجاد کمپین جدید
        </Btn>
      </div>

      {status === "loading" && (
        <LoadingState label="در حال بارگذاری کمپین‌ها..." />
      )}
      {status === "error" && (
        <ErrorState message={error ?? undefined} onRetry={refetch} />
      )}
      {status === "empty" && (
        <EmptyState
          title="هنوز کمپینی ثبت نشده است"
          description="برای شروع، یک کمپین جدید ایجاد کنید."
        />
      )}

      {status === "success" && data && (
        <div className="bg-card border border-border rounded-2xl overflow-visible card-shadow">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["ردیف", "نام کمپین", "وضعیت قرعه‌کشی", "وضعیت کمپین", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className={`text-right px-2 sm:px-5 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wide ${
                        h === "ردیف" ? "hidden sm:table-cell" : ""
                      }`}
                    >
                      {h || <span className="sr-only">عملیات</span>}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {pageItems.map(({ campaign: c, lotteryStatus, campaignStatus }, i) => {
                const { label: lotLabel, cls: lotCls } =
                  lotteryStatusLabel(lotteryStatus)
                return (
                  <tr
                    key={c.id}
                    className="table-row-hover border-b border-border last:border-0"
                  >
                    <td className="hidden sm:table-cell px-5 py-4">
                      <span
                        className="text-sm font-bold text-muted-foreground"
                        style={{ fontFamily: "'JetBrains Mono'" }}
                      >
                        {String((page - 1) * PAGE_SIZE + i + 1).padStart(2, "0")}
                      </span>
                    </td>
                    <td className="px-2 sm:px-5 py-4">
                      <button
                        onClick={() => navigate(campaignDetailPath(c.id))}
                        className="text-sm font-bold text-primary hover:text-primary/80 text-right underline underline-offset-2 decoration-primary/30 transition-all"
                      >
                        {c.name}
                      </button>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {c.lotteryDate} • {c.codeLength} رقم
                      </div>
                    </td>
                    <td className="px-2 sm:px-5 py-4">
                      <StatusBadge label={lotLabel} cls={lotCls} />
                    </td>
                    <td className="px-2 sm:px-5 py-4">
                      <div className="flex items-center gap-3">
                        <ActiveToggle
                          value={c.isActive}
                          onChange={(newVal) =>
                            setToggleConfirm({ id: c.id, newVal })
                          }
                        />
                        <span className="hidden sm:inline text-xs text-muted-foreground">
                          {c.isActive ? "فعال" : "غیرفعال"}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 sm:px-5 py-4 relative">
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setOpenMenuId((id) => (id === c.id ? null : c.id))
                        }
                      >
                        •••
                      </Btn>
                      {openMenuId === c.id && (
                        <OverflowMenu
                          onClose={() => setOpenMenuId(null)}
                          items={[
                            {
                              label: "مشاهده کمپین",
                              icon: "👁",
                              onClick: () => navigate(campaignDetailPath(c.id)),
                            },
                            {
                              label: "ویرایش کمپین",
                              icon: "✎",
                              onClick: () => navigate(ROUTES.createCampaign),
                            },
                            {
                              label: "یادداشت",
                              icon: "📝",
                              onClick: () => setNotesFor(c),
                            },
                            {
                              label: "خروجی Excel",
                              icon: "⬇",
                              onClick: () => {
                                exportToExcel(
                                  [
                                    {
                                      نام: c.name,
                                      وضعیت_کمپین: campaignStatusLabel(campaignStatus).label,
                                      وضعیت_قرعه‌کشی: lotteryStatusLabel(lotteryStatus).label,
                                      تاریخ_قرعه‌کشی: c.lotteryDate,
                                      برندگان: c.winners,
                                      رزرو: c.reserveWinners,
                                    },
                                  ],
                                  `campaign-${c.id}.xlsx`,
                                )
                                showToast("فایل Excel با موفقیت آماده شد.", "success")
                              },
                            },
                          ]}
                        />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-5 py-4 border-t border-border">
            <span className="text-xs text-muted-foreground">
              نمایش {pageItems.length} از {data.length} کمپین
            </span>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    page === p
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

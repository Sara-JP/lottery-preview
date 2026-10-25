import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Btn } from "@/components/common/Btn"
import { StatCard } from "@/components/common/StatCard"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { Toast } from "@/components/common/Toast"
import { Input } from "@/components/common/Input"
import { LoadingState, ErrorState, EmptyState } from "@/components/common/AsyncStates"
import { ROUTES } from "@/constants/routes"
import { useAsyncData } from "@/hooks/useAsyncData"
import { useToast } from "@/hooks/useToast"
import { useFocusTrap } from "@/hooks/useFocusTrap"
import {
  deleteParticipant,
  getParticipants,
  importParticipants,
  updateParticipant,
} from "@/services/participants.service"
import type { Participant } from "@/types/domain"
import { downloadParticipantTemplate, exportToExcel, parseParticipantsFile } from "@/utils/excel"

const PAGE_SIZE = 5

export function ParticipantsScreen() {
  const { campaignId } = useParams<{ campaignId?: string }>()
  const navigate = useNavigate()
  const { toast, showToast, clearToast } = useToast()
  const { data: participants, status, error, refetch } = useAsyncData(() => getParticipants(campaignId), [campaignId])

  const [page, setPage] = useState(1)
  const [importing, setImporting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Participant | null>(null)
  const [editTarget, setEditTarget] = useState<Participant | null>(null)
  const [editRecharge, setEditRecharge] = useState("")
  const [editEligible, setEditEligible] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editDialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(editDialogRef, editTarget !== null)

  useEffect(() => {
    if (!editTarget) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditTarget(null)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [editTarget])

  const totalPages = Math.max(1, Math.ceil((participants?.length ?? 0) / PAGE_SIZE))
  const pageItems = useMemo(() => {
    if (!participants) return []
    const start = (page - 1) * PAGE_SIZE
    return participants.slice(start, start + PAGE_SIZE)
  }, [participants, page])

  async function handleFileSelected(file: File) {
    setImporting(true)
    try {
      const { rows, skipped } = await parseParticipantsFile(file)
      if (rows.length === 0) {
        showToast("هیچ ردیف معتبری در فایل یافت نشد.", "error")
        return
      }
      const result = await importParticipants(campaignId ?? "c1", rows, skipped)
      showToast(
        `${result.added.toLocaleString("fa-IR")} شرکت‌کننده افزوده شد` +
          (result.duplicates ? ` — ${result.duplicates.toLocaleString("fa-IR")} تکراری نادیده گرفته شد` : "") +
          (result.skipped ? ` — ${result.skipped.toLocaleString("fa-IR")} ردیف نامعتبر رد شد` : ""),
        "success",
      )
      refetch()
    } catch {
      showToast("خواندن فایل با خطا مواجه شد. فرمت فایل را بررسی کنید.", "error")
    } finally {
      setImporting(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteParticipant(deleteTarget.id)
      showToast("شرکت‌کننده حذف شد.", "success")
      refetch()
    } catch {
      showToast("حذف شرکت‌کننده با خطا مواجه شد.", "error")
    } finally {
      setDeleteTarget(null)
    }
  }

  function openEdit(p: Participant) {
    setEditTarget(p)
    setEditRecharge(String(p.rechargeCount))
    setEditEligible(p.eligible)
  }

  async function saveEdit() {
    if (!editTarget) return
    const recharge = Number(editRecharge)
    if (Number.isNaN(recharge) || recharge < 0) {
      showToast("تعداد شارژ باید عددی صفر یا بزرگ‌تر باشد.", "error")
      return
    }
    try {
      await updateParticipant(editTarget.id, { rechargeCount: recharge, eligible: editEligible })
      showToast("اطلاعات شرکت‌کننده به‌روزرسانی شد.", "success")
      refetch()
    } catch {
      showToast("به‌روزرسانی با خطا مواجه شد.", "error")
    } finally {
      setEditTarget(null)
    }
  }

  return (
    <div className="p-8 fade-in">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={clearToast} />}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        aria-label="بارگذاری فایل شرکت‌کنندگان"
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) handleFileSelected(f)
          e.target.value = ""
        }}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        title="حذف شرکت‌کننده"
        message={`آیا از حذف شرکت‌کننده با شماره ${deleteTarget?.mobile} مطمئن هستید؟ این عملیات غیرقابل بازگشت است.`}
        confirmLabel="حذف کن"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {editTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        >
          <div
            ref={editDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-participant-title"
            className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full mx-4 card-shadow-lg scale-in"
          >
            <h3 id="edit-participant-title" className="text-base font-bold text-foreground mb-1">ویرایش شرکت‌کننده</h3>
            <p className="text-xs text-muted-foreground mb-5" style={{ fontFamily: "'JetBrains Mono'" }}>
              {editTarget.mobile}
            </p>
            <div className="flex flex-col gap-4">
              <Input label="تعداد شارژ" type="number" value={editRecharge} onChange={setEditRecharge} />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">واجد شرایط</span>
                <div className="flex gap-2">
                  <Btn
                    size="sm"
                    variant={editEligible ? "primary" : "secondary"}
                    onClick={() => setEditEligible(true)}
                  >
                    بله
                  </Btn>
                  <Btn
                    size="sm"
                    variant={!editEligible ? "danger" : "secondary"}
                    onClick={() => setEditEligible(false)}
                  >
                    خیر
                  </Btn>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Btn variant="primary" className="flex-1" onClick={saveEdit}>
                ذخیره
              </Btn>
              <Btn variant="secondary" className="flex-1" onClick={() => setEditTarget(null)}>
                انصراف
              </Btn>
            </div>
          </div>
        </div>
      )}

      {campaignId && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button onClick={() => navigate(ROUTES.campaigns)} className="hover:text-foreground transition-all">
            کمپین‌ها
          </button>
          <span>/</span>
          <span className="text-foreground font-medium">شرکت‌کنندگان</span>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">شرکت‌کنندگان</h1>
          <p className="text-sm text-muted-foreground mt-1">{participants?.length ?? 0} شرکت‌کننده در کمپین فعال</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Btn variant="secondary" onClick={downloadParticipantTemplate}>
            دانلود قالب
          </Btn>
          <Btn
            variant="secondary"
            disabled={!participants || participants.length === 0}
            onClick={() =>
              participants &&
              exportToExcel(
                participants.map(p => ({
                  mobile: p.mobile,
                  lotteryCode: p.lotteryCode,
                  rechargeCount: p.rechargeCount,
                  eligible: p.eligible ? "بله" : "خیر",
                  createdAt: p.createdAt,
                })),
                "participants.xlsx",
              )
            }
          >
            خروجی اکسل
          </Btn>
          <Btn variant="primary" disabled={importing} onClick={() => fileInputRef.current?.click()}>
            {importing ? "در حال بارگذاری..." : "+ بارگذاری"}
          </Btn>
        </div>
      </div>

      {status === "loading" && <LoadingState label="در حال بارگذاری شرکت‌کنندگان..." />}
      {status === "error" && <ErrorState message={error ?? undefined} onRetry={refetch} />}
      {status === "empty" && (
        <EmptyState title="شرکت‌کننده‌ای ثبت نشده است" description="می‌توانید با «+ بارگذاری» فهرستی از شرکت‌کنندگان اضافه کنید." />
      )}

      {status === "success" && participants && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard label="کل شرکت‌کنندگان" value={participants.length.toLocaleString("fa-IR")} icon="👥" />
            <StatCard label="واجد شرایط" value={participants.filter(p => p.eligible).length.toLocaleString("fa-IR")} icon="✓" />
            <StatCard label="غیر واجد" value={participants.filter(p => !p.eligible).length.toLocaleString("fa-IR")} icon="✕" />
            <StatCard
              label="میانگین شارژ"
              value={(participants.reduce((sum, p) => sum + p.rechargeCount, 0) / participants.length).toLocaleString("fa-IR", { maximumFractionDigits: 1 })}
              icon="📶"
              accent
            />
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden card-shadow">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right px-5 py-4 text-xs font-bold text-muted-foreground">#</th>
                  {["شماره موبایل", "کد قرعه‌کشی", "تعداد شارژ", "واجد شرایط", "تاریخ ثبت", "عملیات"].map(h => (
                    <th key={h} className="text-right px-5 py-4 text-xs font-bold text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageItems.map((p, i) => (
                  <tr key={p.id} className="table-row-hover border-b border-border last:border-0">
                    <td className="px-5 py-4 text-xs text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-foreground" style={{ fontFamily: "'JetBrains Mono'" }}>
                        {p.mobile}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-primary font-bold" style={{ fontFamily: "'JetBrains Mono'", letterSpacing: "0.05em" }}>
                        {p.lotteryCode}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, p.rechargeCount * 5)}%` }} />
                        </div>
                        <span className="text-sm text-foreground font-semibold">{p.rechargeCount}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                          p.eligible ? "bg-success/10 text-success border-success/20" : "bg-danger/10 text-danger border-danger/20"
                        }`}
                      >
                        {p.eligible ? "✓ واجد" : "✕ غیر واجد"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground" style={{ fontFamily: "'JetBrains Mono'" }}>
                      {p.createdAt}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <Btn variant="ghost" size="sm" onClick={() => openEdit(p)}>
                          ویرایش
                        </Btn>
                        <Btn variant="danger" size="sm" onClick={() => setDeleteTarget(p)}>
                          حذف
                        </Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-5 py-4 border-t border-border">
              <span className="text-xs text-muted-foreground">
                نمایش {pageItems.length} از {participants.length}
              </span>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                      page === p ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

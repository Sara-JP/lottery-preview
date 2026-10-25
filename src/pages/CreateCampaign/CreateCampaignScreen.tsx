import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Btn } from "@/components/common/Btn"
import { Input } from "@/components/common/Input"
import { ImageUploadZone } from "@/components/common/ImageUploadZone"
import { Toast } from "@/components/common/Toast"
import { ROUTES, campaignDetailPath } from "@/constants/routes"
import { useToast } from "@/hooks/useToast"
import { createCampaign } from "@/services/campaigns.service"

interface FormErrors {
  name?: string
  banner?: string
  numWinners?: string
  numReserve?: string
}

export function CreateCampaignScreen() {
  const navigate = useNavigate()
  const { toast, showToast, clearToast } = useToast()

  const [name, setName] = useState("")
  const [banner, setBanner] = useState("")
  const [numWinners, setNumWinners] = useState("10")
  const [numReserve, setNumReserve] = useState("5")
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  function validate(): FormErrors {
    const next: FormErrors = {}
    if (!name.trim()) next.name = "نام کمپین الزامی است."
    if (!banner) next.banner = "تصویر کمپین الزامی است."

    const winnersNum = Number(numWinners)
    if (!numWinners.trim() || Number.isNaN(winnersNum) || winnersNum <= 0) {
      next.numWinners = "تعداد برندگان اصلی باید عددی بزرگ‌تر از صفر باشد."
    }

    const reserveNum = Number(numReserve)
    if (!numReserve.trim() || Number.isNaN(reserveNum) || reserveNum < 0) {
      next.numReserve = "تعداد افراد رزرو باید عددی صفر یا بزرگ‌تر باشد."
    }

    return next
  }

  async function handleSubmit() {
    if (submitting) return // guard against duplicate submissions
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    try {
      const created = await createCampaign({
        name: name.trim(),
        banner,
        numWinners: Number(numWinners),
        numReserve: Number(numReserve),
      })
      showToast("کمپین با موفقیت ایجاد شد.", "success")
      setTimeout(() => navigate(campaignDetailPath(created.id)), 1200)
    } catch {
      showToast("ایجاد کمپین با خطا مواجه شد. لطفاً دوباره تلاش کنید.", "error")
      setSubmitting(false)
    }
  }

  return (
    <div className="p-8 fade-in max-w-[800px]">
      {toast && (
        <Toast message={toast.msg} type={toast.type} onClose={clearToast} />
      )}

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <button
          onClick={() => navigate(ROUTES.campaigns)}
          className="hover:text-foreground transition-all"
        >
          کمپین‌ها
        </button>
        <span>/</span>
        <span className="text-foreground font-medium">ایجاد کمپین جدید</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">ایجاد کمپین جدید</h1>
        <p className="text-sm text-muted-foreground mt-1">
          اطلاعات کمپین قرعه‌کشی زنده را وارد کنید
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
        // Native HTML5 `required` validation would otherwise intercept
        // submission before our own handler runs and show the browser's
        // default (non-Persian, non-styled) validation bubble instead of the
        // Persian messages this form is required to show. `required` stays
        // on the inputs for the visual "*" and for assistive tech, but this
        // form is the single source of truth for whether submission proceeds.
        noValidate
        className="bg-card border border-border rounded-2xl p-8 card-shadow flex flex-col gap-8"
      >
        <Input
          label="نام کمپین"
          value={name}
          onChange={(v) => {
            setName(v)
            if (errors.name) setErrors((er) => ({ ...er, name: undefined }))
          }}
          placeholder="مثال: جشنواره شارژ طلایی"
          required
          error={errors.name}
          disabled={submitting}
        />

        <ImageUploadZone
          label="تصویر کمپین"
          value={banner}
          onChange={(v) => {
            setBanner(v)
            if (errors.banner) setErrors((er) => ({ ...er, banner: undefined }))
          }}
          error={errors.banner}
        />

        <div className="grid grid-cols-2 gap-6">
          <Input
            label="تعداد برندگان اصلی"
            value={numWinners}
            onChange={(v) => {
              setNumWinners(v)
              if (errors.numWinners)
                setErrors((er) => ({ ...er, numWinners: undefined }))
            }}
            type="number"
            placeholder="10"
            required
            error={errors.numWinners}
            disabled={submitting}
          />
          <Input
            label="تعداد افراد رزرو"
            value={numReserve}
            onChange={(v) => {
              setNumReserve(v)
              if (errors.numReserve)
                setErrors((er) => ({ ...er, numReserve: undefined }))
            }}
            type="number"
            placeholder="5"
            hint="افراد رزرو زمانی استفاده می‌شوند که برنده اصلی فاقد شرایط تشخیص داده شود."
            required
            error={errors.numReserve}
            disabled={submitting}
          />
        </div>

        <div className="flex items-center justify-end gap-3 mt-2">
          <Btn
            type="button"
            variant="ghost"
            onClick={() => navigate(ROUTES.campaigns)}
            disabled={submitting}
          >
            انصراف
          </Btn>
          <Btn type="submit" variant="primary" disabled={submitting}>
            {submitting ? "در حال ایجاد..." : "ایجاد کمپین"}
          </Btn>
        </div>
      </form>
    </div>
  )
}

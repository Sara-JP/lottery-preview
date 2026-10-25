import { useNavigate, useParams } from "react-router-dom"
import { Btn } from "@/components/common/Btn"
import { campaignBroadcastPath } from "@/constants/routes"
import { LiveBroadcastScreen } from "@/pages/Broadcast/LiveBroadcastScreen"

/**
 * Preview mode for the live broadcast screen — same visual, watermarked, and
 * exited back to the broadcast route. No dedicated "configure broadcast"
 * screen exists in the supplied design for the preview to return to instead
 * (see ENGINEERING REPORT); this preserves the original exit target.
 */
export function BroadcastPreviewScreen() {
  const { campaignId = "" } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()

  return (
    <div className="fixed inset-0 z-50" style={{ background: "#000" }}>
      <div
        className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center"
        style={{ transform: "rotate(-15deg)" }}
      >
        <div
          className="text-[120px] font-black text-white/[0.04] select-none"
          style={{ whiteSpace: "nowrap" }}
        >
          پیش‌نمایش • PREVIEW
        </div>
      </div>
      <div className="absolute top-4 right-4 z-[60]">
        <Btn
          variant="secondary"
          onClick={() => navigate(campaignBroadcastPath(campaignId))}
        >
          × خروج از پیش‌نمایش
        </Btn>
      </div>
      <div className="absolute top-4 left-4 z-[60] flex items-center gap-2 px-3 py-2 rounded-lg border border-warning/30 bg-warning/10">
        <span className="w-2 h-2 rounded-full bg-warning live-pulse" />
        <span className="text-xs font-bold text-warning">
          پیش‌نمایش — مخاطبان این صفحه را نمی‌بینند
        </span>
      </div>
      <div className="absolute inset-0">
        <LiveBroadcastScreen />
      </div>
    </div>
  )
}

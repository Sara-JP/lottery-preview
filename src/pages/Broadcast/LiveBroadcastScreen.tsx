import { useState } from "react"
import { useParams } from "react-router-dom"
import { useAsyncData } from "@/hooks/useAsyncData"
import { getCampaign } from "@/services/campaigns.service"
import { getWinners } from "@/services/winners.service"
import { maskMobile } from "@/utils/format"

async function loadBroadcastData(campaignId: string) {
  const [campaign, winners] = await Promise.all([
    getCampaign(campaignId),
    getWinners(campaignId),
  ])
  return { campaign, winners }
}

/**
 * Full-bleed public broadcast display. No dedicated "configure broadcast"
 * screen exists in the supplied design (only this live view + a preview
 * mode) — see ENGINEERING REPORT. The digit reveal / confetti sequence is
 * still a static demo state: wiring it to a real live draw would mean
 * inventing a WebSocket/real-time contract that was not supplied, which
 * Phase 15 explicitly says not to do. Only the campaign/winner data source
 * has been connected to the real (mock) data layer.
 */
export function LiveBroadcastScreen() {
  const { campaignId = "" } = useParams<{ campaignId: string }>()
  const { data } = useAsyncData(
    () => loadBroadcastData(campaignId),
    [campaignId],
  )
  const [digits] = useState<string[]>(["5", "2", "8", "4", "7", "", "", ""])
  const [showWinnerReveal] = useState(false)
  const [confetti] = useState(false)
  const [winnerCounter] = useState(3)
  const confettiColors = [
    "#FFCB05",
    "#D4AF37",
    "#FFFFFF",
    "#F59E0B",
    "#22C55E",
    "#EF4444",
    "#818CF8",
  ]

  const campaign = data?.campaign
  const winners = data?.winners ?? []
  const totalWinners = campaign?.winners ?? winners.length
  const campaignName = campaign?.name ?? "قرعه‌کشی زنده"
  const bannerUrl =
    campaign?.banner ||
    "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=640&h=360&fit=crop&auto=format"

  return (
    <div
      role="main"
      className="fixed inset-0 broadcast-bg flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden"
      style={{ fontFamily: "'Vazirmatn'" }}
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {confetti && (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={
                {
                  left: `${Math.random() * 100}%`,
                  top: 0,
                  background: confettiColors[i % confettiColors.length],
                  borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                  width: `${6 + Math.random() * 10}px`,
                  height: `${6 + Math.random() * 10}px`,
                  "--dur": `${2 + Math.random() * 3}s`,
                  "--delay": `${Math.random() * 1.5}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6 p-8 relative z-10">
        <div className="rounded-2xl overflow-hidden aspect-video relative border border-white/10">
          <img
            src={bannerUrl}
            alt="بنر کمپین"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="text-white font-black text-lg leading-tight">
              {campaignName}
            </div>
          </div>
        </div>
        <div className="rounded-2xl p-5 border border-white/08 glass">
          <div className="text-sm font-black text-primary mb-4 uppercase tracking-wider">
            جزئیات جوایز
          </div>
          {winners.slice(0, 3).map((w) => (
            <div
              key={w.id}
              className="flex items-center gap-3 py-2.5 border-b border-white/06 last:border-0"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                style={{
                  background:
                    w.rank === 1
                      ? "linear-gradient(135deg,#D4AF37,#F5D75E)"
                      : "rgba(255,255,255,0.08)",
                  color: w.rank === 1 ? "#111" : "rgba(255,255,255,0.7)",
                }}
              >
                {w.rank}
              </div>
              <span className="text-sm text-white/80 flex-1">{w.prize}</span>
            </div>
          ))}
          <div className="mt-4 pt-3 border-t border-white/08">
            <div className="text-xs text-white/40 mb-1">تعداد کل برندگان</div>
            <div className="text-2xl font-black text-primary">
              {totalWinners}
            </div>
          </div>
        </div>
        <div className="rounded-2xl p-4 border border-white/08 glass text-center">
          <div className="text-xs text-white/30 mb-3 uppercase tracking-widest">
            حامی برنامه
          </div>
          <div className="text-2xl font-black text-primary">MTN Irancell</div>
          <div className="text-xs text-white/40 mt-1">ایرانسل</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-8">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(212,175,55,0.6), transparent)",
          }}
        />
        <div className="text-center mb-12">
          <div
            className="text-3xl sm:text-5xl font-black text-white mb-3 tracking-tight"
            style={{ textShadow: "0 0 40px rgba(255,203,5,0.3)" }}
          >
            قرعه‌کشی زنده
          </div>
          <div className="text-lg text-white/50 font-medium">
            ام‌تی‌ان ایرانسل
          </div>
          <div
            className="w-24 h-0.5 mx-auto mt-4"
            style={{
              background:
                "linear-gradient(to right, transparent, #D4AF37, transparent)",
            }}
          />
        </div>
        <div className="flex gap-2 sm:gap-4 mb-10 max-w-full overflow-x-auto px-1 py-1" style={{ perspective: "1000px" }}>
          {digits.map((d, i) => {
            const revealed = d !== ""
            return (
              <div
                key={i}
                className={`relative w-12 h-16 sm:w-20 sm:h-24 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                  revealed ? "digit-box-filled digit-glow" : "digit-box-empty"
                }`}
                style={{
                  boxShadow: revealed
                    ? "0 0 30px rgba(255,203,5,0.5), 0 0 60px rgba(255,203,5,0.25), inset 0 0 20px rgba(255,203,5,0.08)"
                    : "none",
                  background: revealed
                    ? "rgba(255,203,5,0.08)"
                    : "rgba(255,255,255,0.03)",
                  border: revealed
                    ? "2px solid rgba(255,203,5,0.7)"
                    : "2px solid rgba(255,255,255,0.08)",
                }}
              >
                {revealed ? (
                  <span
                    className="text-2xl sm:text-5xl font-black text-primary digit-flip"
                    style={{
                      fontFamily: "'JetBrains Mono'",
                      textShadow: "0 0 20px rgba(255,203,5,0.8)",
                    }}
                  >
                    {d}
                  </span>
                ) : (
                  <span
                    className="text-xl sm:text-4xl font-black text-white/10"
                    style={{ fontFamily: "'JetBrains Mono'" }}
                  >
                    ?
                  </span>
                )}
              </div>
            )
          })}
        </div>
        {showWinnerReveal ? (
          <div className="winner-reveal text-center mb-8">
            <div className="text-sm font-bold text-accent uppercase tracking-widest mb-4">
              🏆 برنده قرعه‌کشی
            </div>
            <div
              className="text-4xl font-black text-primary mb-3"
              style={{
                fontFamily: "'JetBrains Mono'",
                textShadow: "0 0 40px rgba(255,203,5,0.8)",
              }}
            >
              {maskMobile("09351234567")}
            </div>
            <div className="text-xl font-bold text-white/70">
              خودروی پژو ۲۰۸
            </div>
          </div>
        ) : (
          <div className="text-center mb-8">
            <div className="text-sm text-white/30 mb-2">
              در انتظار استخراج ارقام بعدی...
            </div>
            <div className="flex items-center justify-center gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary/40"
                  style={{
                    animation: `livePulse 1.2s ${i * 0.3}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 px-4 sm:px-8 py-4 rounded-2xl border border-white/08 glass">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-danger live-pulse" />
            <span className="text-xs font-bold text-danger uppercase">
              زنده
            </span>
          </div>
          <div className="w-px h-5 bg-white/10" />
          <div className="text-sm text-white/60">
            برنده{" "}
            <span className="text-primary font-black text-lg">
              {winnerCounter}
            </span>{" "}
            از <span className="text-white font-bold">{totalWinners}</span>
          </div>
          <div className="w-px h-5 bg-white/10" />
          <div className="text-xs text-white/30">{campaignName}</div>
        </div>
      </div>

      <div className="w-full lg:w-80 flex-shrink-0 flex flex-col p-8 relative z-10">
        <div className="text-sm font-black text-white/50 uppercase tracking-widest mb-5">
          برندگان
        </div>
        <div className="flex flex-col gap-3 flex-1">
          {winners.map((w, i) => (
            <div
              key={w.id}
              className={`rounded-xl p-4 border transition-all ${
                i === 0
                  ? "border-accent/40 gold-glow row-insert"
                  : "border-white/06 glass"
              }`}
              style={{
                background:
                  i === 0 ? "rgba(212,175,55,0.08)" : "rgba(255,255,255,0.03)",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
                  style={{
                    background:
                      w.rank === 1
                        ? "linear-gradient(135deg,#D4AF37,#F5D75E)"
                        : "rgba(255,255,255,0.08)",
                    color:
                      w.rank === 1
                        ? "#111"
                        : i === 0
                          ? "#D4AF37"
                          : "rgba(255,255,255,0.6)",
                  }}
                >
                  {w.rank}
                </div>
                <span className="text-xs text-white/40 font-bold uppercase">
                  رتبه {w.rank}
                </span>
              </div>
              <div
                className="text-base font-black text-white mb-0.5"
                style={{ fontFamily: "'JetBrains Mono'" }}
              >
                {maskMobile(w.mobile)}
              </div>
              <div className="text-xs text-white/50">{w.prize}</div>
            </div>
          ))}
        </div>
        <div className="mt-auto pt-6 border-t border-white/06 text-center">
          <div className="text-2xl font-black text-primary mb-1">
            MTN Irancell
          </div>
          <div className="text-xs text-white/25">همراه شما در هر لحظه</div>
        </div>
      </div>
    </div>
  )
}

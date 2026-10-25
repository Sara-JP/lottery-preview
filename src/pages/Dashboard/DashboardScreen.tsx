import { useNavigate } from "react-router-dom"
import { StatCard } from "@/components/common/StatCard"
import {
  StatusBadge,
  CampaignStatusBadge,
} from "@/components/common/StatusBadge"
import { Btn } from "@/components/common/Btn"
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/common/AsyncStates"
import {
  ROUTES,
  campaignLotteryPath,
  campaignBroadcastPath,
} from "@/constants/routes"
import { useAsyncData } from "@/hooks/useAsyncData"
import { getDashboardData } from "@/services/dashboard.service"
import { eligibilityLabel } from "@/utils/format"

export function DashboardScreen() {
  const navigate = useNavigate()
  const { data, status, error, refetch } = useAsyncData(getDashboardData, [])

  if (status === "loading")
    return <LoadingState label="در حال بارگذاری داشبورد..." />
  if (status === "error")
    return <ErrorState message={error ?? undefined} onRetry={refetch} />
  if (!data) return <EmptyState title="داده‌ای برای داشبورد یافت نشد" />

  const { campaigns, recentWinners, recentActivity, featuredCampaign } = data

  return (
    <div className="p-8 max-w-[1600px] fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">داشبورد</h1>
        <p className="text-muted-foreground text-sm mt-1">
          سه‌شنبه ۱ تیر ۱۴۰۳ • ۲۱:۱۴
        </p>
      </div>

      {featuredCampaign && (
        <div
          className="rounded-2xl p-6 mb-8 border border-primary/30 border-glow relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,203,5,0.08) 0%, rgba(212,175,55,0.05) 100%)",
          }}
        >
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,203,5,0.12) 0%, transparent 70%)",
              transform: "translate(30%,-30%)",
            }}
          />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-danger live-pulse px-2.5 py-1 rounded-lg border border-danger/25 bg-danger/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-danger" />
                  پخش زنده
                </span>
                <span className="text-xs text-muted-foreground">
                  امشب ساعت {featuredCampaign.lotteryTime}
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">
                {featuredCampaign.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {featuredCampaign.winners} برنده • {featuredCampaign.codeLength}{" "}
                رقمی • {featuredCampaign.eligible.toLocaleString("fa-IR")}{" "}
                شرکت‌کننده واجد شرایط
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Btn
                variant="primary"
                onClick={() =>
                  navigate(campaignLotteryPath(featuredCampaign.id))
                }
              >
                ورود به پنل اپراتور
              </Btn>
              <Btn
                variant="secondary"
                onClick={() =>
                  navigate(campaignBroadcastPath(featuredCampaign.id))
                }
              >
                پخش زنده
              </Btn>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="شرکت‌کنندگان واجد شرایط"
          value="۲۸۴٬۳۲۰"
          sub="+۱۲٬۴۵۰"
          icon="👥"
        />
        <StatCard label="برندگان باقی‌مانده" value="۷ از ۱۰" icon="🏆" />
        <StatCard
          label="بودجه جوایز"
          value="۱٬۵۸۵٬۰۰۰٬۰۰۰ ت"
          icon="💰"
          accent
        />
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="bg-card border border-border rounded-2xl p-6 card-shadow">
          <div className="flex items-start justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-foreground">کمپین‌ها</h2>
            <Btn
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.campaigns)}
            >
              مشاهده همه
            </Btn>
          </div>
          {campaigns.length === 0 ? (
            <EmptyState title="کمپینی ثبت نشده است" />
          ) : (
            campaigns.slice(0, 3).map(({ campaign, campaignStatus }) => (
              <div
                key={campaign.id}
                className="flex items-center gap-4 py-3 border-b border-border last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">
                    {campaign.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {campaign.lotteryDate} • {campaign.winners} برنده
                  </div>
                </div>
                <CampaignStatusBadge status={campaignStatus} />
              </div>
            ))
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 card-shadow">
          <div className="flex items-start justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-foreground">آخرین برندگان</h2>
            <Btn
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.winners)}
            >
              مشاهده همه
            </Btn>
          </div>
          {recentWinners.length === 0 ? (
            <EmptyState title="هنوز برنده‌ای ثبت نشده است" />
          ) : (
            recentWinners.map((w) => {
              const { label, cls } = eligibilityLabel(w.eligibilityStatus)
              return (
                <div
                  key={w.id}
                  className="flex items-center gap-4 py-3 border-b border-border last:border-0"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center text-accent text-sm font-bold">
                    {w.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-semibold text-foreground"
                      style={{ fontFamily: "'JetBrains Mono'" }}
                    >
                      {w.mobile}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">
                      {w.prize}
                    </div>
                  </div>
                  <StatusBadge label={label} cls={cls} />
                </div>
              )
            })
          )}
        </div>

        <div
          className="bg-card border border-border rounded-2xl p-6 card-shadow"
          style={{ gridColumn: "1 / 3" }}
        >
          <h2 className="text-xl font-bold text-foreground mb-6">
            فعالیت‌های اخیر
          </h2>
          <div className="flex flex-col">
            {recentActivity.map((e, i) => (
              <div key={e.id} className="flex gap-4 relative pb-4 last:pb-0">
                {i < recentActivity.length - 1 && (
                  <div className="absolute right-3.5 top-7 bottom-0 w-px bg-border" />
                )}
                <div
                  className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${
                    e.type === "success"
                      ? "bg-success/15 text-success"
                      : e.type === "danger"
                        ? "bg-danger/15 text-danger"
                        : e.type === "warning"
                          ? "bg-warning/15 text-warning"
                          : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {e.type === "success" ? "✓" : e.type === "danger" ? "!" : "·"}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-foreground">{e.action}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {e.operator} • {e.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

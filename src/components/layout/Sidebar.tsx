import { Link, useLocation } from "react-router-dom"
import { ROUTES } from "@/constants/routes"

interface NavItem {
  to: string
  label: string
  icon: string
  /** Route prefixes that should also highlight this item (nested campaign pages). */
  activePrefixes: string[]
}

// Every screen that should be reachable from the persistent sidebar. Lottery
// Operator and Broadcast are intentionally excluded — they are "operator
// mode" full-bleed screens entered from a specific campaign's context
// (Campaign Details / Dashboard), not general sidebar destinations, matching
// the original design's treatment of those two screens.
const NAV_ITEMS: NavItem[] = [
  {
    to: ROUTES.dashboard,
    label: "داشبورد",
    icon: "▦",
    activePrefixes: ["/dashboard"],
  },
  {
    to: ROUTES.campaigns,
    label: "کمپین‌ها",
    icon: "◉",
    activePrefixes: ["/campaigns"],
  },
  {
    to: ROUTES.participants,
    label: "شرکت‌کنندگان",
    icon: "👥",
    activePrefixes: ["/participants"],
  },
  {
    to: ROUTES.winners,
    label: "برندگان",
    icon: "🏆",
    activePrefixes: ["/winners"],
  },
]

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation()

  return (
    <aside
      className={`fixed top-0 right-0 h-screen flex flex-col border-l border-border z-40 transition-transform duration-200 lg:translate-x-0 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
      style={{ width: "var(--sidebar-width)", background: "var(--card)" }}
    >
      <div className="px-6 py-5 border-b border-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center yellow-shadow">
          <span className="text-sm font-black text-primary-foreground">
            MTN
          </span>
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-foreground">ایرانسل</div>
          <div className="text-xs text-muted-foreground">سامانه قرعه‌کشی</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="بستن منو"
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
        >
          ✕
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="mb-6">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">
            مدیریت
          </div>
          {NAV_ITEMS.map((item) => {
            const active = item.activePrefixes.some((p) =>
              location.pathname.startsWith(p),
            )
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={`nav-item ${
                  active ? "nav-active" : ""
                } relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-secondary-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <div className="nav-indicator" />
                <span className="text-base" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
            م
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground truncate">
              احمد محمدی
            </div>
            <div className="text-xs text-muted-foreground">مدیر سیستم</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-success" />
        </div>
      </div>
    </aside>
  )
}

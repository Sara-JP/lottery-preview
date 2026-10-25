import { useEffect, useState } from "react"
import { useLocation, Outlet } from "react-router-dom"
import { Sidebar } from "@/components/layout/Sidebar"

/**
 * Shared chrome for every "admin" screen (everything except the full-bleed
 * Live Broadcast / Broadcast Preview screens, which render outside this
 * layout — see routes/AppRoutes.tsx).
 *
 * The sidebar was originally a fixed-width, always-visible element with no
 * narrow-viewport handling at all — on a 375px screen it consumed most of
 * the width, leaving content squeezed into a sliver (see ENGINEERING
 * REPORT, responsive fixes). Below the `lg` breakpoint it now behaves as an
 * off-canvas drawer toggled from a small top bar, while staying pixel-for-
 * pixel the same fixed sidebar above `lg` — no visual redesign, just the
 * conservative mobile behavior the original design never specified.
 */
export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Auto-close the mobile drawer on every navigation.
  useEffect(() => setSidebarOpen(false), [location.pathname])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden lg:mr-[var(--sidebar-width)]">
        <div
          className="no-print lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0"
          style={{ background: "var(--card)" }}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="باز کردن منو"
            aria-expanded={sidebarOpen}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-foreground hover:bg-secondary transition-all"
          >
            <span aria-hidden="true">☰</span>
          </button>
          <span className="text-sm font-bold text-foreground">ایرانسل — سامانه قرعه‌کشی</span>
        </div>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

// ── Shared Formatting Helpers ─────────────────────────────────────────────────

/** Masks a mobile number for public/broadcast surfaces: 0912***6789 */
export function maskMobile(mobile: string): string {
  return mobile.slice(0, 4) + "***" + mobile.slice(7)
}

export function eligibilityLabel(
  status: "pending" | "eligible" | "ineligible",
): { label: string; cls: string } {
  if (status === "eligible")
    return {
      label: "واجد شرایط",
      cls: "bg-success/15 text-success border-success/25",
    }
  if (status === "ineligible")
    return {
      label: "فاقد شرایط",
      cls: "bg-danger/15 text-danger border-danger/25",
    }
  return {
    label: "در انتظار بررسی",
    cls: "bg-secondary text-secondary-foreground border-border",
  }
}

export function reserveStatusLabel(
  status: "waiting" | "selected" | "replaced" | "eligible" | "ineligible",
): { label: string; cls: string } {
  if (status === "replaced")
    return {
      label: "جایگزین برنده",
      cls: "bg-accent/15 text-accent border-accent/25",
    }
  if (status === "eligible")
    return {
      label: "واجد شرایط",
      cls: "bg-success/15 text-success border-success/25",
    }
  if (status === "ineligible")
    return {
      label: "فاقد شرایط",
      cls: "bg-danger/15 text-danger border-danger/25",
    }
  if (status === "selected")
    return {
      label: "انتخاب شده",
      cls: "bg-primary/15 text-primary border-primary/25",
    }
  return {
    label: "در انتظار",
    cls: "bg-secondary text-secondary-foreground border-border",
  }
}

/** Simple stable id generator for mock-created records (campaigns, winners, activity, ...). */
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

/** Current time formatted the way the existing activity/log UI expects (HH:MM). */
export function nowShortTime(): string {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
}

/** Current time formatted for operator logs (HH:MM:SS). */
export function nowLogTime(): string {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`
}

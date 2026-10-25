// ── Excel / CSV Utilities ─────────────────────────────────────────────────—
// Backs the "دانلود قالب" (download template), "+ بارگذاری" (upload),
// "خروجی اکسل"/"خروجی Excel" (Excel export), and "خروجی CSV" (CSV export)
// buttons, which previously rendered with no handler at all. Runs entirely
// client-side (no backend endpoint exists for any of this), using SheetJS —
// a real, commonly-used library for this exact job, not a hand-rolled CSV
// string-joiner that breaks on commas/quotes in the data.
//
// SheetJS is dynamically imported (not a top-level `import`) so its ~400KB
// stays out of the main bundle and is only fetched the moment someone
// actually clicks an export/import/template button, not on every page load.

function loadXlsx() {
  return import("xlsx")
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Downloads `rows` as a real .xlsx workbook. */
export async function exportToExcel(rows: Record<string, string | number>[], filename: string, sheetName = "Sheet1") {
  const XLSX = await loadXlsx()
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  triggerDownload(
    new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    filename,
  )
}

/** Downloads `rows` as a .csv file. */
export async function exportToCsv(rows: Record<string, string | number>[], filename: string) {
  const XLSX = await loadXlsx()
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const csv = XLSX.utils.sheet_to_csv(worksheet)
  // Prefix a UTF-8 BOM so Persian text opens correctly in Excel, not as mojibake.
  triggerDownload(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }), filename)
}


const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹"
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩"

/**
 * Normalizes the mobile formats that actually show up in Iranian spreadsheets
 * into the canonical 11-digit "09xxxxxxxxx" form:
 *  - Persian / Arabic-Indic digits (۰۹۱۲…) → ASCII
 *  - spaces, dashes, parentheses stripped
 *  - "+98912…", "0098912…", "98912…" → "0912…"
 *  - a bare 10-digit "912…" (Excel drops the leading zero from numeric cells) → "0912…"
 * Anything that still isn't 09 + 9 digits afterwards is left as-is and will be
 * rejected by the caller's validation.
 */
export function normalizeMobile(input: string): string {
  let v = input
    .trim()
    .replace(/[۰-۹]/g, d => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, d => String(ARABIC_DIGITS.indexOf(d)))
    .replace(/[\s\-()]/g, "")
  v = v.replace(/^(\+98|0098|98)(?=9\d{9}$)/, "0")
  if (/^9\d{9}$/.test(v)) v = "0" + v
  return v
}

export interface ParticipantImportRow {
  mobile: string
  rechargeCount: number
}

const TEMPLATE_HEADERS = { mobile: "09120000000", rechargeCount: 1 }

/** Downloads a blank participant-upload template with the expected columns. */
export async function downloadParticipantTemplate() {
  await exportToExcel([TEMPLATE_HEADERS], "participants-template.xlsx", "Participants")
}

/**
 * Parses an uploaded participant file (.xlsx, .xls, or .csv) into rows.
 * Accepts `mobile` (required, 11-digit starting with 0) and `rechargeCount`
 * (optional, defaults to 0) columns, case-insensitively, and tolerates a
 * couple of common Persian header variants.
 */
export async function parseParticipantsFile(file: File): Promise<{ rows: ParticipantImportRow[]; skipped: number }> {
  const XLSX = await loadXlsx()
  // raw: true keeps CSV cell values as the literal text — otherwise a value like
  // "09125550001" is coerced to the number 9125550001 and loses its leading zero.
  //
  // CSVs must be decoded as UTF-8 TEXT before parsing. Handing SheetJS the raw
  // bytes makes it guess a legacy codepage, which turns any BOM-less UTF-8 file
  // containing Persian (digits OR the Persian column headers) into mojibake.
  // Binary workbooks (.xlsx/.xls) are read from the array buffer as usual.
  const isCsv = /\.csv$/i.test(file.name) || file.type === "text/csv"
  const workbook = isCsv
    ? XLSX.read(await file.text(), { type: "string", raw: true })
    : XLSX.read(await file.arrayBuffer(), { type: "array", raw: true })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" })

  const rows: ParticipantImportRow[] = []
  let skipped = 0

  for (const record of raw) {
    const entries = Object.entries(record).reduce<Record<string, unknown>>((acc, [k, v]) => {
      acc[k.trim().toLowerCase()] = v
      return acc
    }, {})
    const mobileRaw = entries["mobile"] ?? entries["شماره موبایل"] ?? entries["موبایل"] ?? ""
    const mobile = normalizeMobile(String(mobileRaw))
    const rechargeRaw = entries["rechargecount"] ?? entries["تعداد شارژ"] ?? entries["recharge_count"] ?? 0
    const rechargeCount = Number(rechargeRaw) || 0

    if (/^09\d{9}$/.test(mobile)) {
      rows.push({ mobile, rechargeCount })
    } else if (mobile) {
      skipped++
    }
  }

  return { rows, skipped }
}

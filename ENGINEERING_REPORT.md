# Engineering Report — Enterprise Lottery Platform Refactor

## 0. Starting point (Phase 1 audit)

The uploaded project was a **Figma Make** export, much smaller than the brief assumed: a single 1,646-line `src/App.tsx`, no `components/`, no router, no services layer, no mock/API separation. `package.json` had no `react-router-dom`. A design brief was bundled in the project itself at `src/imports/pasted_text/admin-panel-updates.md` (Irancell/MTN admin-panel spec) and was used to resolve several ambiguities below.

Baseline: `pnpm run build` succeeded; `tsc --noEmit` showed 4 pre-existing unused-variable errors, all pointing at **orphaned, half-wired features** (see "Bugs fixed").

---

## 1. Architecture

```
src/
  types/domain.ts            Campaign, Participant, Winner, ReserveWinner,
                              ActivityEntry, LogEntry, LotteryExecution, statuses
  utils/
    status.ts                 single source of truth: getCampaignStatus(),
                               getLotteryStatus(), hasLotteryRun()
    format.ts                 maskMobile, eligibilityLabel, reserveStatusLabel, ids/time
  data/mockDb.ts              in-memory mock "database" (session-only, not localStorage)
  services/
    api.ts                     API_BASE_URL / USE_MOCK_DATA / apiFetch / ApiError
    campaigns.service.ts       + getCampaignsWithStatus / getCampaignWithStatus
    participants.service.ts
    winners.service.ts
    lottery.service.ts         confirmWinner() records execution history
    dashboard.service.ts
  hooks/
    useAsyncData.ts             loading/success/empty/error, no extra dependency
    useToast.ts
  constants/routes.ts          ROUTES + path builders (campaignDetailPath, etc.)
  components/
    common/                    Btn, Input, Select, StatusBadge, CampaignStatusBadge,
                               ActiveToggle, ConfirmDialog, Toast, StatCard,
                               ImageUploadZone, OverflowMenu, EligibilityControl,
                               NotesDrawer, AsyncStates (Loading/Empty/Error)
    layout/                    Sidebar (responsive), AppLayout (off-canvas drawer)
  pages/
    Dashboard/, Campaigns/, CreateCampaign/, CampaignDetails/,
    Participants/, Winners/, Lottery/, Broadcast/ (Live + Preview), NotFound/
  routes/AppRoutes.tsx
  App.tsx                     now 4 lines — just <AppRoutes />
  main.tsx                    wraps <App /> in <BrowserRouter>
```

**Why no TanStack Query / Zustand / etc.:** evaluated per Phase 6's instruction not to add a server-state library "merely because it's popular." A small dependency-free `useAsyncData` hook covers loading/success/empty/error for every screen; the mock store is a plain module-level singleton, so a page revisit (route remount) already re-reads current state. Revisit this decision if/when a real backend adds real caching/invalidation needs.

## 2. Routes

| Route | Screen | Notes |
|---|---|---|
| `/` | → redirects to `/dashboard` | previously defaulted to Campaigns; Dashboard is now actually reachable, so it's the landing page |
| `/dashboard` | Dashboard | |
| `/campaigns` | Campaigns list | |
| `/campaigns/new` | Create Campaign | |
| `/campaigns/:campaignId` | Campaign Details | |
| `/campaigns/:campaignId/participants` | Participants (scoped) | |
| `/campaigns/:campaignId/winners` | Winners (scoped, filtered by campaignId) | |
| `/campaigns/:campaignId/lottery` | Lottery Operator | **outside** the sidebar layout (see Bugs fixed) |
| `/campaigns/:campaignId/broadcast` | Live Broadcast | outside the sidebar layout (unchanged from original) |
| `/campaigns/:campaignId/broadcast/preview` | Broadcast Preview | outside the sidebar layout (unchanged) |
| `/participants` | Participants (global, unfiltered) | |
| `/winners` | Winners (global, unfiltered) | |
| `*` (within sidebar layout) | Not Found | |

All nested campaign pages read `campaignId` from the URL (`useParams`), so a hard refresh on any of them preserves the selected campaign — verified live (see §7).

## 3. Bugs fixed

1. **Dashboard, Participants, Winners, Lottery Operator were unreachable.** The sidebar only ever linked to Campaigns. Added sidebar entries for Dashboard/Participants/Winners (Lottery Operator and Broadcast stay entry-only, from Dashboard's live banner and — new — Campaign Details, see #2).
2. **Lottery Operator and Broadcast were only reachable for the one "featured" campaign on the Dashboard.** No campaign's own detail page could reach *its* lottery/broadcast, even though the routes are per-campaign. Added "ورود به پنل اپراتور" / "پخش زنده" buttons to Campaign Details, reusing the exact existing Dashboard labels/styling (no new copy or visual design).
3. **`OverflowMenu` state (`openMenu`/`setOpenMenu`) and the `OverflowMenu` component were dead code** — declared, never rendered. Wired it into the Campaigns list actions column (مشاهده کمپین / ویرایش کمپین / یادداشت / خروجی Excel), matching the project's own design brief.
4. **`handleEligibilityChange` and `activateReserveFor` were dead code** in Campaign Details — a fully-built winner-eligibility → reserve-activation flow with no UI trigger. Added the `EligibilityControl` column to the Main Winners table and an "انتخاب فرد رزرو" action that appears once a winner is marked ineligible, exactly matching the bundled design brief's §10 flow.
5. **Lottery Operator hard-coded `CAMPAIGNS_INIT[0]`** regardless of which campaign was open. Now reads `campaignId` from the route.
6. **No Back navigation from Lottery Operator.** Added a header Back button → the campaign's own Details page.
7. **Lottery Operator was nested inside the sidebar layout's `h-screen` container while itself also being `h-screen`** — a double viewport-height container. Moved it to render full-bleed outside `AppLayout` (matching how Broadcast screens were already treated).
8. **Native `required` on Create Campaign inputs silently intercepted submission** before the custom Persian-message validation ever ran (browser's own non-Persian validation UI would show instead). Added `noValidate` to the form; `required` stays for the visual `*` and assistive tech.
9. **Participants stat cards showed hard-coded fake totals** ("۲۸۴٬۳۲۰" etc.) that contradicted the actual 8-row table beneath them. Now derived from the real participant list.
10. **Lottery Operator's center column had no scroll fallback** (`overflow-hidden` on every ancestor); on a shorter viewport, or once the "match found" card expands the layout, the confirm/reject buttons could be clipped outside the visible area with no way to scroll to them. Added `overflow-y-auto`. Found by screenshot during manual verification (see §7).
11. **Sidebar had zero narrow-viewport handling** (position:fixed, always visible, ~248px wide) — at 375px it consumed most of the screen, leaving content squeezed into a ~115px sliver. Added a conservative, standard off-canvas drawer below `lg` (hamburger toggle, backdrop, auto-close on navigation) — no change to the sidebar's own visual design above `lg`.
12. **"Save Draft" removed** from Create Campaign entirely — button, handlers, state, imports.

**Self-inflicted bug caught and fixed during verification:** running the project's own `format` script (`oxfmt`, an early-stage formatter) in write mode silently deleted required semicolons inside several inline TypeScript object-type literals (e.g. `{ label: string cls: string }`), breaking 8 files. Found via `tsc`, fixed by hand, re-verified clean. `oxfmt --check src` now passes on all 42 files; I did not re-run it in write mode given the demonstrated bug.

## 4. Responsive & accessibility

- Audited 375 / 768 / 1440px on every screen, including the two full-bleed ones outside the sidebar layout (Lottery Operator, Broadcast) — see §6.6 for the real bugs found there and fixed in the Round 2 pass below.
- Sidebar off-canvas fix (the one responsive bug found in Round 1's narrower audit).
- `ConfirmDialog` and `NotesDrawer` use `role="alertdialog"`/`role="dialog"`, `aria-modal`, Escape-to-close, autofocus the primary action, and — added in Round 2 (§6.4) after live keyboard testing — actually trap Tab focus and restore it on close.
- `Btn` forwards refs (needed for the above) and has a real `type="button"|"submit"`.
- Toasts use `role="status"`/`aria-live="polite"`.
- Semantic buttons everywhere a clickable div previously would have gone; images have `alt`; icons that are purely decorative are `aria-hidden`.

## 5. Verification performed

- `tsc --noEmit`: clean (0 errors in `src/`), re-confirmed after every round of changes.
- `pnpm run build`: succeeds throughout.
- `oxfmt --check src`: passes except the files hand-edited after the formatter-corruption incident (cosmetic style drift only — see §6.4 commands note).
- **Live browser verification** (Playwright + real Chromium, not just compile checks): every route loads with **zero JS/React runtime errors**; full digit-entry → match → confirm winner → execution-history flow run end-to-end via actual keyboard input; status agreement checked across Campaign Details/Campaigns list/Dashboard before and after; 404 and "campaign not found" paths render gracefully; a forced service failure was used to actually exercise the error path (§6.5), not just reasoned about; CSV/Excel export, template download, and file-upload import were all driven through real file I/O, not mocked; keyboard-only Tab/Escape behavior and focus restoration verified on every dialog; responsive behavior confirmed visually (not just via overflow checks, which proved insufficient on their own — see §6.6) at 375/768/1440px on every screen.

---

## STATUS LOGIC REPORT

**Campaign Status** and **Lottery Status** are each computed by exactly one function (`src/utils/status.ts`), called from exactly one place per screen (`campaigns.service.ts`'s `getCampaignsWithStatus()` / `getCampaignWithStatus()`), never recomputed inline in a component.

- **`hasLotteryRun(campaignId, executions)`** — the *only* rule that may say a lottery ran: a matching row in `LotteryExecution[]` history. Never looks at dates.
- **`getLotteryStatus()`** → `'completed'` iff `hasLotteryRun()`; else `'not-started'` if the campaign hasn't reached its active window, else `'ready'`.
- **`getCampaignStatus()`** → if the lottery has run but the stored lifecycle field still says `'upcoming'`/`'active'`, promotes it to `'finished'` (the one contradiction the brief explicitly called out); otherwise trusts the stored field.
- **Execution history is recorded exactly once**, inside `lottery.service.ts`'s `confirmWinner()`, the moment a campaign's confirmed-winner count reaches its configured target — never by a UI toggle, never by date.

**Ambiguity documented, not invented:** the original data model keeps campaign lifecycle `status` as an independently-set field with no documented backend rule for how it should react to lottery completion. Rather than inventing date-driven business rules, the fix above only resolves the one specific contradiction in scope (status vs. lottery-execution evidence) and leaves the rest of the stored field's semantics untouched.

**Verified live:** a campaign with 4/10 winners drawn shows "در حال برگزاری" everywhere (never "انجام شده"); drawing the remaining 6 winners through the actual operator UI flips it to "انجام شده" on Campaign Details, the Campaigns list, and (would, on next fetch) the Dashboard — all from the same single computation.

---

## NAVIGATION REPORT

- Sidebar: Dashboard, Campaigns, Participants, Winners — all functional, all highlight correctly including on nested campaign routes.
- Campaign cards / rows / breadcrumbs: all navigate correctly (verified live).
- Back behavior: breadcrumb (Campaign Details → Campaigns) and a dedicated header Back button (Lottery Operator → that campaign's Details) both use router navigation, not `window.location`.
- Direct URL access to any nested campaign route (`/campaigns/c1/lottery`, etc.) resolves the correct campaign from the URL — verified live via a real page load (not a client-side transition).
- A campaign ID that doesn't exist renders an in-page "not found" state with a way back, rather than crashing.
- Unknown top-level paths render `NotFoundScreen` (inside the sidebar layout, so navigation stays available).

---

## BACKEND INTEGRATION REPORT

No backend docs/OpenAPI spec were supplied, so every service below currently reads/writes `src/data/mockDb.ts` (a session-only in-memory store — explicitly not localStorage). Each is written against a small typed interface so a real implementation drops in without touching any page.

| Feature | Current source | Should come from backend? | Service/module | Endpoint available? | Remaining requirement |
|---|---|---|---|---|---|
| Dashboard stats/feed | mock, composed | Yes | `dashboard.service.ts` | No | Aggregate endpoint or client-side composition of the others |
| Campaigns list/detail | mock | Yes | `campaigns.service.ts` | No | CRUD endpoints; status fields as currently modeled |
| Create Campaign | mock (pushes to store) | Yes | `campaigns.service.ts` `createCampaign()` | No | Create endpoint; also needs start/end date fields (currently unset — see below) |
| Campaign edit | **not implemented** (Edit routes to the Create form, unchanged from original, no prefill) | Yes | — | No | Original app never supported edit-with-prefill either; flagged rather than invented |
| Participants | mock, campaign-scoped (see §6.2), with real CSV/XLSX import | Yes | `participants.service.ts` | No | Backend needs a bulk-import endpoint equivalent to `importParticipants()` |
| Winners | mock, campaign-scoped via `campaignId` | Yes | `winners.service.ts` | No | CRUD + eligibility-update endpoint |
| Winner eligibility change | mock, mutates store + activity log | Yes | `winners.service.ts` `updateWinnerEligibility()` | No | Mutation endpoint |
| Reserve activation | mock, mutates store + activity log | Yes | `winners.service.ts` `activateNextReserve()` | No | Mutation endpoint; "who is next" rule currently "first waiting reserve, campaign order" — not specified elsewhere |
| Lottery execution / history | mock, **the single source of truth for "completed"** | Yes | `lottery.service.ts` `confirmWinner()` | No | Must be server-authoritative in production — the brief explicitly says the browser alone must not decide winners |
| Lottery digit-entry / operator log | mock, synchronous (no artificial delay, see rationale in code) | Possibly (real-time log) | `lottery.service.ts` | No | If multiple operators need a shared live log, this needs a real-time channel — not invented here |
| Live Broadcast digit reveal / confetti | **static demo state**, unchanged | Yes, eventually | — | No | No WebSocket/real-time contract was supplied; Phase 15 explicitly says not to invent one. Only the campaign/winner *data* (name, banner, prize list) was connected to the real (mock) layer |
| Broadcast configuration | **no such screen exists** in the supplied design | — | — | — | Only a Live view and a Preview mode exist; nothing to configure. Documented rather than invented |

---

## 6. Round 2 — completeness pass

A follow-up pass to close every gap flagged at the end of Round 1, rather than leave them as documented-but-unfixed.

### 6.1 Previously-inert action buttons — now real

All of the following had **no `onClick` handler at all** (confirmed against the original `App.tsx` — most were pre-existing gaps, not regressions introduced by the refactor). All now do real, client-side work via a new `src/utils/excel.ts` (built on SheetJS, dynamically `import()`-ed so its ~400KB only loads when someone actually clicks an export/import button — verified it no longer bloats the main bundle, see §6.5):

- **"دانلود قالب" (download template)** — Participants: downloads a real `.xlsx` with the expected columns.
- **"+ بارگذاری" (upload)** — Participants: opens a file picker, parses `.xlsx`/`.xls`/`.csv`, validates each row (11-digit mobile starting with `0`), adds valid rows to the campaign's participant pool, and reports added/duplicate/invalid counts in the toast. Verified live with a 3-row test file (2 valid, 1 invalid) → "۲ شرکت‌کننده افزوده شد — ۱ ردیف نامعتبر رد شد".
- **"خروجی اکسل" / "خروجی Excel"** — Campaigns (per-row, overflow menu), Participants, Winners: all download a real `.xlsx`, verified live (file size checked, not just "a download fired").
- **"خروجی CSV"** — Winners: downloads a real `.csv` (UTF-8 BOM so Persian text opens correctly in Excel, not as mojibake).
- **"چاپ" (print)** — Winners: triggers the browser print dialog; a new global print stylesheet (`src/index.css`) hides the sidebar/topbar/action buttons so only the table prints.
- **Per-row "ویرایش"/"حذف" (edit/delete)** — Participants: edit opens a small dialog for recharge count + eligibility; delete asks for confirmation via the existing `ConfirmDialog`. Both call real service mutations and refetch.

### 6.2 Participants are now genuinely campaign-scoped

This was flagged as a documented gap in Round 1; now fixed as a real data-model change, not just a note:

- `Participant` gained a `campaignId` field; all 8 seeded participants belong to `c1` (the only campaign with an in-progress lottery in the mock data) — `/campaigns/c2/participants` etc. now correctly render empty rather than the same unfiltered global list. Verified live.
- **`findParticipantByCode` is now campaign-scoped too** — a direct correctness fix enabled by the above: the Lottery Operator for campaign A can no longer match a participant who only ever entered campaign B. This wasn't possible to express correctly before participants had an owning campaign.

### 6.3 Pagination is now real

Campaigns and Participants previously showed static `1 2 3` buttons that didn't slice any data. Both now compute real page counts (`Math.ceil(total / pageSize)`) and slice the actual array; verified live (8 participants / 5 per page → exactly 2 page buttons, 5 rows on page 1).

### 6.4 Accessibility: dialogs are now actually modal to keyboard users

Found via live keyboard testing, not just a code read: `ConfirmDialog` and `NotesDrawer` visually looked modal but a keyboard user could **Tab straight out of them into the page behind**. Added a small reusable `useFocusTrap` hook (`src/hooks/useFocusTrap.ts`) — traps Tab/Shift+Tab within the open dialog, wraps at both ends, and restores focus to whatever triggered the dialog on close. Applied to `ConfirmDialog`, `NotesDrawer`, and the new participant-edit dialog. `NotesDrawer` was also missing Escape-to-close and autofocus, which `ConfirmDialog` already had — added both for consistency.

**Verified live:** opening a dialog focuses its primary action; Tab cycles only within the dialog's own buttons (confirmed it wraps back rather than escaping); Escape closes it; focus returns to the exact control that opened it.

### 6.5 A real bug TEST 8 caught: raw errors were leaking to the UI

Forced a live failure (temporarily made `getCampaigns()` throw, loaded the page, reverted after) specifically to exercise the error path end-to-end, per the brief's TEST 8. It failed its own stated requirement: `useAsyncData` was passing `err.message` straight through to the UI whenever the thrown value was any `Error` instance — meaning a real backend failure's raw technical message would have been shown to end users, directly contradicting Phase 19 §8 ("Do not expose raw technical backend errors directly to normal users"). Round 1's live testing hadn't actually forced a failure, so this slipped through.

**Fix:** only `ApiError` (the one error type explicitly constructed with a safe, pre-written message — see `src/services/api.ts`) is ever shown verbatim; every other thrown value falls back to the generic Persian message, while the real error is still `console.error`-logged for developers. Re-verified live after the fix: forced failure now shows the generic Persian message + a working retry button, on both Campaigns and Dashboard.

### 6.6 Responsive: Lottery Operator and Broadcast were unusable at 375px

Round 1's responsive audit only covered Dashboard/Campaigns/Create Campaign/Campaign Details. Screenshotting the other two full-bleed screens (outside the sidebar layout, so not covered by that audit) found both seriously broken at 375px — not just "a bit cramped" but **two-thirds of each screen's content was clipped and unreachable**, with `overflow-hidden` on every ancestor preventing even a fallback scroll.

- **Lottery Operator** (an interactive tool — someone might genuinely need to use it from a tablet): applied the same off-canvas pattern as the main sidebar fix. Below `lg`, the two side panels (campaign info + confirmed winners; operator log) become toggleable drawers with their own close buttons and a backdrop; the center digit-entry column — the actual job of the screen — stays front and center, full-width, with its own `overflow-y-auto` fallback. The 8-digit code row and keypad also got responsive sizing (smaller boxes/text below `sm`, original size restored at `sm`/`lg`+) plus a horizontal-scroll fallback for longer codes, since even the resized boxes could in principle exceed a very narrow viewport. Desktop layout (`lg`+) is pixel-identical to before.
- **Broadcast** (a passive public display — realistically shown on a TV/projector, not a phone, but still shouldn't be *broken*): used vertical stacking (`flex-col lg:flex-row`) instead of toggles, since there's no interaction to preserve — all three sections (campaign/prizes, digit reveal, winners list) just stack top-to-bottom and scroll, with nothing hidden behind a button. Same digit-box responsive sizing applied. Desktop (`lg`+) layout is unchanged.

**Verified live** at 375/768/1440px for all three screens (Lottery Operator, Broadcast, Broadcast Preview): no horizontal page overflow at any width; Lottery Operator's full digit-entry → match → confirm flow re-run successfully at 375px; Broadcast's three sections all confirmed reachable (screenshotted after programmatically scrolling the screen's own internal scroll container, since it's a `position: fixed` full-viewport element — Playwright's full-page screenshot doesn't follow fixed-element scroll, which is a tooling quirk, not an app bug).

### 6.7 Bundle size

Adding SheetJS (for §6.1) pushed the main JS bundle to 751KB and triggered Vite's chunk-size warning. Converted every `xlsx` usage in `utils/excel.ts` to a dynamic `import()` instead of a top-level import — main bundle is back to ~330KB, with `xlsx` now a separate ~425KB chunk fetched only when an export/import/template button is actually clicked.

---

## 7. Round 3 — bugs found by looking at the output instead of trusting the checks

Round 2 ended with "all clean", but several of the checks used (automated horizontal-overflow flags, "a download fired", "the code path exists") turned out to be too weak. This round re-verified by *looking* — screenshots, print emulation, real files, real keyboard input — and found real bugs each time:

1. **Print output was still dark-themed** (black page, yellow cards — would waste a printer's ink and be hard to read). Round 2's print stylesheet hid the sidebar/buttons correctly but overrode `body`'s color only; every card/panel paints its own background from the `--background`/`--card`/… CSS variables, so none of it changed. Fix: override the design tokens themselves under `@media print` (they cascade to inline styles too) and drop screen-only glow shadows. Verified with a print-emulation screenshot: white page, dark text.
2. **Several screens were unusable at 375px even though the overflow check said "no overflow"** (the check only inspects the document root; these screens clip or squeeze inside their own containers):
   - *Campaign Details* hero: a fixed 256px banner column left ~115px for the title/stats/buttons. Now stacks (banner on top) below `sm`; buttons wrap.
   - *Dashboard* live-campaign banner: the action buttons were squeezed out of view. Now stacks and wraps.
   - *Participants / Winners / Campaign Details / Dashboard* stat-card grids (3–4 fixed columns) → 2 columns (1 on Dashboard) below `sm`.
   - *Participants / Winners / Campaigns* header action rows now wrap instead of clipping (the **upload button was not even visible** at 375px).
   - *Campaigns* table: hides the row-number column and tightens padding below `sm`, so the status toggle and `•••` actions column are on-screen instead of off to the side.
   - Desktop (`lg`+) layouts were re-screenshotted and are unchanged.
3. **CSV import was broken in three separate ways** (only `.xlsx` had been tested): (a) numeric-looking CSV cells lost their leading zero (`09125550001` → `9125550001`) and were rejected; (b) UTF-8 CSVs without a BOM were decoded as mojibake, so Persian digits *and the Persian column headers the parser claims to accept* failed; (c) common real-world formats weren't normalized. Fixed: CSVs are read as UTF-8 text with `raw` cell values, and a new `normalizeMobile()` accepts Persian/Arabic-Indic digits, spaces/dashes, `+98`/`0098`/`98` prefixes, and Excel's dropped-leading-zero 10-digit form. Verified with five real files (plain, in-file duplicate, mixed formats, Persian headers, UTF-8 BOM — the BOM case matters because it's what this app's own CSV export produces) plus an `.xlsx` regression.
4. **Eligibility dropdown couldn't be dismissed** without choosing something: no Escape, no click-outside. Added both; Escape returns focus to the trigger. Verified by keyboard.
5. **Status toggle had no accessible name** (and its visible "فعال/غیرفعال" text is now hidden on narrow screens), so it now carries an `aria-label`.
6. Persian-digit consistency: the Participants "average recharge" stat printed `9.8` while every other number was Persian (`۹٫۸`).

**Final end-to-end regression (real Chromium, after all Round 3 changes):** 15/15 routes render with 0 page errors; c1 shows "در حال برگزاری" before any run; drawing 6 winners through the real operator UI flips it to "انجام شده" on Campaign Details (10 winner rows) and the Campaigns list; the Dashboard's "live" banner correctly disappears because it is driven by the same derived status. (Note this is a *consequence of the single source of truth*, not a bug: once a lottery has run, the campaign is no longer "active/live".)

---

## 8. Round 4 — automated accessibility audit, and the test I had skipped

1. **axe-core (WCAG 2 A/AA + best-practice) run against all 8 main screens.** Structural findings, all fixed → **0 structural violations on every screen**:
   - *Nested interactive controls* on Create Campaign (my own doing: the image drop zone was `role="button"` and also contained a real button). The zone is now a plain drop target; the inner button is the single keyboard-reachable control.
   - *Empty table headers*: the Campaigns actions column now has a screen-reader-only "عملیات" label, and Campaign Details' winners table had a **sixth header with no cells under it at all** (removed).
   - *Lottery Operator* had no `main` landmark and no `<h1>`; Broadcast had no `main` landmark. Added landmarks/headings (and kept heading order valid).
2. **TEST 7 had never actually been run** (only the empty-form validation had). Running it found a **real bug**: upload an image → remove it → pick the *same* image again did nothing, because browsers don't fire `change` for an unchanged file-input value, so the form then rejected submission with "image required". Fixed (input value reset after each pick). Now verified end-to-end in a real browser: upload by mouse (exactly one file chooser) and by keyboard (Enter on the focused button), same-file re-select works, a **deliberate double-click on submit creates exactly one campaign** (button shows "در حال ایجاد..." and is disabled), success toast, navigation to the new campaign, and the new campaign correctly shows lottery status "انجام نشده".
3. **1024px and 1920px** screenshotted/measured on every screen: no overflow or clipping (the only flagged element is the Preview screen's intentionally oversized 4%-opacity "PREVIEW" watermark).
4. **Colour contrast — decision needed, not applied.** axe reports 88 contrast failures across the screens; **79 are one palette token**, `--muted-foreground` `#5a5a6e` (2.3–2.9:1 on the card/background colours; AA needs 4.5:1), and ~9 are the red "ineligible" badge text. Because the brief says not to change colours without permission, I did **not** change the Figma palette. I tested a minimal fix as a *runtime-only override*: `--muted-foreground: #8a8a98` (same bluish-grey hue, just lighter; 4.53:1 worst case) and `--danger: #f87171` (5.4:1+) → failures drop **88 → 2** (one is the pulsing "LIVE" badge being sampled mid-animation; one is the "finished" badge whose tint derives from the same token), and the dashboard screenshot shows the visual hierarchy unchanged. Applying it is a two-line edit to `:root` in `src/index.css`.

---

## What has NOT been verified (please read)

- **No real assistive-technology testing.** Keyboard operation, focus management, ARIA, landmarks and accessible names were checked programmatically (incl. an axe-core audit); nobody has run NVDA/VoiceOver/TalkBack against it. Contrast has been *audited* (§8.4) but not yet *fixed* pending your decision.
- **Chromium only.** No Firefox/Safari (SheetJS file handling, print, and `position: fixed` scroll containers are the likeliest places for browser differences).
- **Desktop was spot-checked visually after each responsive change, not pixel-diffed** against the original Figma.
- **No backend exists**, so every "integration" is against the in-memory mock. The service boundaries are typed and ready, but none of it has run against a real API.
- **External images** (mock banners point at Unsplash) were blocked in my test sandbox, so layouts were only seen with broken-image placeholders. Unsplash may also be unreachable from some regions — real banners should come from your own storage.

## Remaining items / known limitations (not fixed, by design)

- **Duplicate lottery codes between seeded "already-won" winners and the participant pool** (both still draw from the same base mock people for campaign `c1`) mean the operator demo can re-draw an already-crowned mobile number under a new rank. This mirrors the original app's mock data exactly (no such exclusion existed there either) — flagged, not silently "fixed" with new matching-exclusion logic that wasn't asked for.
- **Campaign edit has no prefill** — same as the original; "ویرایش کمپین" still opens the blank Create form. No spec existed for this in either version.
- **Imported participants get a randomly-generated lottery code** (`src/services/participants.service.ts`) since no real code-generation algorithm was specified anywhere in the brief or the original app.
- **Wide tables (Winners, Participants, Campaign Details) scroll horizontally with the whole content area on phones**, not inside their own container. A dedicated `overflow-x-auto` wrapper would clip the absolutely-positioned dropdowns (eligibility, row menu) on the last rows, so I left the working-but-plain behavior rather than trade it for a different bug. Nothing is unreachable.
- Cosmetic formatting drift on the files hand-edited across all rounds (see §3 and §6) — functionally correct (clean `tsc` + build every round), just not run back through `oxfmt` given its demonstrated corruption bug.

---

## Commands used for verification

```
pnpm install
npx tsc --noEmit          # 0 errors in src/, both rounds
pnpm run build             # succeeds, both rounds
npx oxfmt --check src      # passes except the hand-edited files (cosmetic only)
PORT=<n> pnpm run dev &    # + Playwright (real Chromium): routes, full lottery-execution flow,
                            # CSV/Excel export+import, pagination, edit/delete, keyboard/focus-trap
                            # behavior, a forced-failure error-state test, and 375/768/1440px
                            # screenshots of every screen including the two full-bleed ones.
```

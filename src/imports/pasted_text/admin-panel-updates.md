Update the **existing Lucky Draw Admin Panel design** based on the requirements below.

Do NOT redesign the entire product from scratch.

Keep the existing:

* Irancell visual identity
* RTL Persian layout
* Typography
* Yellow / black / white color palette
* Sidebar navigation
* Components
* Border radius
* Spacing system
* Table style
* Overall visual language

The goal is to extend and improve the current Admin Panel while keeping it visually consistent with the existing design.

---

# 1. PARTICIPANT MOBILE NUMBERS

Update all participant-related views inside the Admin Panel.

Currently, some mobile numbers are masked.

Inside the **Admin Panel only**, always display the participant's **full mobile number**.

Example:

`09123456789`

Do NOT use:

`0912***6789`

Masked mobile numbers should only be used on public-facing / Live Broadcast screens.

---

# 2. CREATE NEW CAMPAIGN PAGE

Create a dedicated Admin Panel page called:

**ایجاد کمپین جدید**

The page should be accessible from:

**کمپین‌ها → ایجاد کمپین جدید**

Also place a prominent primary CTA:

**+ ایجاد کمپین جدید**

on the Campaign List page.

Design this page as a clean form using the existing Admin Panel Design System.

## Campaign Information

Include these fields:

### Campaign Name

Label:

**نام کمپین**

Text input.

---

### Campaign Image / Banner

Label:

**تصویر کمپین**

Create a drag-and-drop image upload component.

Include:

* Upload icon
* Drag & Drop area
* Browse button
* Recommended image size / aspect ratio
* Image preview after upload
* Replace image action
* Remove image action

This image will later be used on the Live Lottery / Broadcast screen.

---

### Number of Winners

Label:

**تعداد برندگان اصلی**

Numeric input.

Example:

`10`

---

### Number of Reserve Winners

Label:

**تعداد افراد رزرو**

Numeric input.

Example:

`5`

Add helper text explaining that reserve participants can be used when an originally selected winner is determined to be ineligible.

---

At the bottom of the page include:

Secondary button:

**انصراف**

Secondary button:

**ذخیره پیش‌نویس**

Primary Irancell Yellow button:

**ایجاد کمپین**

---

# 3. CAMPAIGN LIST PAGE

Create / update a dedicated page:

**کمپین‌ها**

This page should show ALL campaigns in a professional data table.

At the top include:

* Page title: کمپین‌ها
* Search
* Status filters
* Lottery status filter
* Export Excel
* Create New Campaign button

## Campaign Table

Create these columns:

### 1. Campaign Row / ID

**ردیف**

Example:

01
02
03
04

---

### 2. Campaign Name

**نام کمپین**

Campaign name should be clickable.

Example:

**جشنواره شارژ طلایی**

Clicking the campaign name must navigate to the **Campaign Detail Page**.

---

### 3. Lottery Status

**وضعیت قرعه‌کشی**

Use clear status badges.

Possible states:

**انجام شده**

Green status badge.

**انجام نشده**

Neutral / gray status badge.

Optionally support:

**در حال برگزاری**

Yellow status badge.

---

### 4. Campaign Active Status

**وضعیت کمپین**

Use an interactive toggle / checkbox.

Admin should be able to activate or deactivate each campaign directly from the table.

States:

**فعال**

**غیرفعال**

Use a confirmation dialog before changing the status.

Example:

"آیا از غیرفعال کردن این کمپین مطمئن هستید؟"

---

### 5. Details / Notes

**جزئیات**

Provide a note action for each campaign.

Use a small note / edit icon with:

**یادداشت**

When clicked, open a modal or side drawer where the Admin can:

* Add a note
* Edit an existing note
* Save the note
* See the last update date

If a campaign already has a note, visually indicate it in the table.

---

### 6. Actions

Add an overflow menu `•••` containing:

* مشاهده کمپین
* ویرایش کمپین
* یادداشت
* خروجی Excel

---

# 4. EXPORT CAMPAIGN LIST

Add an:

**خروجی Excel**

button above the Campaign Table.

Admin must be able to export the complete campaign list to Excel.

Use an Excel / Download icon.

Keep this action visually secondary to the **Create Campaign** button.

---

# 5. SINGLE CAMPAIGN DETAIL PAGE

When the Admin clicks on a Campaign Name, navigate to a dedicated Campaign Detail page.

Example page title:

**جشنواره شارژ طلایی**

Add breadcrumb navigation:

**کمپین‌ها / جشنواره شارژ طلایی**

This page should provide a complete overview of the selected campaign.

---

# 6. CAMPAIGN SUMMARY SECTION

At the top show:

* Campaign Image / Banner
* Campaign Name
* Lottery Date
* Lottery Status
* Active / Inactive Status
* Number of Main Winners
* Number of Reserve Winners

Example:

**جشنواره شارژ طلایی**

تاریخ قرعه‌کشی
۱۴۰۵/۰۷/۰۵

برندگان اصلی
10 نفر

افراد رزرو
5 نفر

وضعیت قرعه‌کشی
انجام شده

وضعیت کمپین
فعال

Use compact summary cards.

Also provide:

**ویرایش کمپین**

button.

---

# 7. WINNERS SECTION

Below the campaign summary create a section:

**برندگان اصلی**

Display the selected winners in a professional data table.

Columns:

### Rank

**ردیف**

### Lottery Code

**کد قرعه‌کشی**

### Full Mobile Number

**شماره موبایل**

IMPORTANT:

Show the FULL mobile number in Admin Panel.

Example:

`09123456789`

### Prize

**جایزه**

### Eligibility Status

**وضعیت احراز شرایط**

Admin must be able to manually determine the eligibility status of every winner.

Use a dropdown or segmented status control.

Possible states:

**در انتظار بررسی**

Neutral / gray

**واجد شرایط**

Green

**فاقد شرایط**

Red

Changing this status should require confirmation.

Example:

"آیا از تغییر وضعیت این برنده به فاقد شرایط مطمئن هستید؟"

### Selection Date / Time

**زمان انتخاب**

---

# 8. RESERVE WINNERS SECTION

Below the Main Winners table create another section:

**لیست رزرو**

The table should include:

* Reserve Rank
* Lottery Code
* Full Mobile Number
* Status
* Replacement information

Possible reserve states:

**در انتظار**

**انتخاب شده**

**جایگزین برنده**

**واجد شرایط**

**فاقد شرایط**

---

# 9. DISABLED RESERVE ROWS

This behavior is very important.

Reserve winners should initially appear in the list but should NOT look like active winners.

If a reserve participant has NOT been selected / activated yet:

Display the entire row in a **disabled visual state**.

Use:

* Lower opacity
* Light gray background
* Disabled controls
* Muted text

The user must immediately understand:

"This reserve participant exists in the reserve list but has not been activated."

Example:

Reserve #1 — Active replacement

Reserve #2 — Disabled

Reserve #3 — Disabled

Reserve #4 — Disabled

Reserve #5 — Disabled

---

# 10. WINNER → RESERVE REPLACEMENT FLOW

Design the UX for this scenario:

A main winner is reviewed by Admin.

Admin changes:

**واجد شرایط**

to:

**فاقد شرایط**

After confirmation, show an action:

**انتخاب فرد رزرو**

Admin can then activate the next available reserve participant.

After activation:

* The reserve row becomes enabled.
* Show which original winner this reserve participant replaced.
* Update the reserve status to:

**جایگزین برنده**

Example:

**جایگزین برنده شماره ۳**

Visually connect the replacement to the original winner.

Do NOT automatically replace a winner without Admin confirmation.

---

# 11. WINNERS EXCEL EXPORT

Above the Main Winners / Reserve section provide:

**خروجی Excel برندگان**

The Excel export should conceptually contain:

* Campaign Name
* Lottery Date
* Winner Rank
* Lottery Code
* Full Mobile Number
* Prize
* Eligibility Status
* Main / Reserve Type
* Replacement Status
* Selection Date

Use a download icon.

---

# 12. CAMPAIGN NOTES

On the Campaign Detail page include a section:

**یادداشت‌های ادمین**

Admin can:

* Add notes
* Edit notes
* Delete notes
* See creation date
* See last edited date

Keep this section visually secondary to the winner management functionality.

---

# 13. CAMPAIGN DETAIL PAGE STRUCTURE

Use approximately this hierarchy:

Campaign Detail

→ Breadcrumb

→ Campaign Header

→ Campaign Banner + Basic Information

→ Campaign Statistics

→ Main Winners

→ Reserve Winners

→ Admin Notes

→ Activity / Change History

---

# 14. ACTIVITY HISTORY

Add a small section at the bottom:

**تاریخچه تغییرات**

Record important Admin actions visually.

Examples:

`12:43 — وضعیت برنده شماره ۳ به "فاقد شرایط" تغییر کرد.`

`12:45 — فرد رزرو شماره ۱ به عنوان جایگزین فعال شد.`

`13:02 — یادداشت کمپین توسط ادمین ویرایش شد.`

`13:10 — وضعیت کمپین به "غیرفعال" تغییر کرد.`

Use a clean timeline UI.

---

# 15. IMPORTANT UX RULES

Maintain these rules throughout the Admin Panel:

1. Full mobile numbers are visible to Admins.

2. Public / Broadcast screens must continue using masked mobile numbers.

3. Never automatically replace an ineligible winner.

4. Require Admin confirmation before:

   * Changing eligibility status
   * Activating a reserve participant
   * Deactivating a campaign

5. Disabled reserve participants must be visually distinguishable from active reserve participants.

6. Use clear colors consistently:

Green = Eligible / Completed / Active

Red = Ineligible / Critical

Yellow = Pending / In Progress / Irancell primary action

Gray = Disabled / Not Started / Inactive

7. Use confirmation dialogs for destructive or important actions.

8. Add success toast notifications after important actions.

Examples:

**وضعیت برنده با موفقیت تغییر کرد.**

**فرد رزرو با موفقیت فعال شد.**

**کمپین با موفقیت ایجاد شد.**

**فایل Excel با موفقیت آماده شد.**

---

# DESIGN REQUIREMENTS

Keep everything consistent with the existing Lucky Draw Admin Panel.

Do NOT change the Live Broadcast design unless necessary to maintain consistency.

Focus this revision on the Admin Panel.

Use:

* RTL Persian layout
* Existing Irancell Design System
* Irancell Yellow as primary CTA color
* Black / dark typography
* White surfaces
* Light gray dashboard background
* 12–16px border radius
* Clean enterprise data tables
* Clear status badges
* Auto Layout
* Reusable Components
* Component Variants
* Consistent spacing
* Responsive desktop layout

Create proper component variants for:

* Campaign Status
* Lottery Status
* Winner Eligibility Status
* Reserve Status
* Active / Inactive Toggle
* Disabled Reserve Row
* Confirmation Modal
* Notes Drawer
* Export Button
* Success Toast

The final design should feel like a polished, production-ready enterprise Admin Panel for MTN Irancell rather than a conceptual wireframe.

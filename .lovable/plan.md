# Silambam Class Attendance & Management App

A fully offline, single-user PWA for a Silambam master to manage batches, students, attendance, achievements, certificates, and reports. All data lives in IndexedDB via Dexie — no accounts, no server, no internet required.

## Tech adaptation
The project is on TanStack Start + Tailwind + shadcn/ui. I'll keep that stack instead of Bootstrap (cleaner integration, same responsive result, matches the existing design system). Everything else from your spec stays: React UI, Dexie/IndexedDB storage, offline use, JSON backup/restore, PDF/Excel export, PWA-ready.

## Routes (TanStack file-based)
```text
/                  Dashboard
/batches           Batch list + create/edit
/batches/$id       Batch detail (students inside)
/students/$id      Student profile (info, attendance %, achievements)
/attendance        Take/edit attendance (date + batch picker)
/achievements      Achievement list + add
/certificates      Generate & export certificates
/reports           Monthly batch + per-student reports
/backup            Export / import JSON
/history           Deleted batches & students (restore)
```

## Data model (Dexie tables)
- `batches` — id, name, timings, days[], notes, createdAt
- `students` — id, batchId, name, age, gender, phone, parentName, parentPhone, address, joinDate, beltLevel, notes, photoBlob
- `attendance` — id, batchId, date (YYYY-MM-DD), records: { studentId: 'present' | 'absent' }
- `achievements` — id, studentId, title, description, date, imageBlob
- `deleted` — id, type ('batch' | 'student'), data (snapshot), deletedAt

Photos and achievement images stored as Blobs directly in IndexedDB.

## Feature breakdown

**Dashboard** — counts (batches, students, today's attendance), recent students, recent achievements, quick-action buttons (Take Attendance, Add Student, New Batch, Reports, Backup).

**Batches** — CRUD with name, timings (start/end), class days (Mon–Sun chips), notes. Soft-delete moves to history.

**Students** — Add/edit inside a batch. Fast form, optional photo upload (compressed client-side). Soft-delete to history. Profile page shows attendance % and achievement timeline.

**Attendance** — defaults to today + last-used batch. All students preselected as **present**; tap to toggle absent. Date picker (shadcn Calendar) loads existing record for edit. Auto-saves on change. Optimized for one-handed phone use.

**Achievements** — per-student entries with title, description, date, image. Shown on student profile and dashboard recent list.

**Certificates** — pick an achievement → render a styled certificate (3 templates: Traditional, Modern Minimal, Gold Premium) with student name, title, date, master name, signature line → export as PDF via `jspdf` + `html2canvas`.

**Reports**
- Batch monthly: matrix (rows=students, cols=days of month), green/red cells, totals per student.
- Student: attendance %, present/absent counts, achievements list.
- Export PDF (jspdf-autotable) and Excel (xlsx / SheetJS).

**Backup & Restore** — Export full DB (including image blobs base64-encoded) as a single JSON file. Import replaces or merges.

**History** — list deleted items with restore + permanent-delete actions.

**Settings** — Master name + signature image (used on certificates), stored in a `settings` Dexie table.

## Technical details

**Dependencies to add**
- `dexie` — IndexedDB wrapper
- `jspdf`, `jspdf-autotable`, `html2canvas` — PDF + certificate render
- `xlsx` — Excel export
- `date-fns` — date utilities
- `react-hook-form` + `zod` (already in shadcn forms) — forms

**Architecture**
- `src/lib/db.ts` — Dexie schema + typed tables
- `src/lib/repos/*.ts` — thin data-access functions per entity
- `src/hooks/use-*.ts` — TanStack Query hooks bound to Dexie (live queries via `dexie-react-hooks` `useLiveQuery`)
- `src/components/` — feature components (BatchCard, StudentRow, AttendanceList, CertificateTemplate, ReportTable, …)
- `src/lib/export/` — pdf.ts, excel.ts, backup.ts
- All routes client-rendered (data lives in browser); no server functions needed.

**Notes**
- IndexedDB is browser-only → guard Dexie imports so SSR doesn't touch them (`if (typeof window !== 'undefined')` or dynamic import in effects).
- Photo compression via canvas resize before storing to keep DB lean.
- PWA wrapper (manifest + service worker) can be added in a follow-up if you want install-to-home-screen.

## Build order
1. Dexie schema, repos, base layout + sidebar nav
2. Batches CRUD → Students CRUD (inside batch)
3. Attendance screen (the core loop) + dashboard counts
4. Achievements + student profile
5. Certificates (templates + PDF export)
6. Reports (batch matrix + student summary, PDF + Excel)
7. Backup / restore + History (soft delete + restore)
8. Settings (master name, signature) + polish

After approval I'll start with steps 1–3 so the daily attendance flow works end-to-end, then layer the rest.
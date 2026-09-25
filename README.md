# TaskTrack frontend

Next.js App Router and TypeScript frontend for TaskTrack. All persistent application data comes from the ASP.NET Core API.

Copy `.env.example` to `.env.local`, then run `npm ci` and `npm run dev`.

## Implementation sequence

1. Application shell and shared design system.
2. Public dashboard and detail pages.
3. Validated CRUD management forms.
4. Search, board, calendar and export.
5. End-to-end verification and Vercel deployment preparation.

No authentication is required by the assignment baseline. Features requiring new database tables are tracked separately.

## Available features

- All 10 required routes: overview, departments, department/project/task details, task search, and four management pages.
- Modal CRUD with browser and API field validation, confirmation dialogs, tag multi-select, loading/error/empty states and toasts.
- Kanban board with persisted status changes, deadline calendar, project reports, CSV export, task duplication, trash and restore.
- Responsive sidebar and mobile layout; keyboard-accessible Radix dialogs.
- Search filters live in the URL and debounce title changes. Current list pagination and sorting are client-side.
- Business timezone defaults to Asia/Ho_Chi_Minh; keep NEXT_PUBLIC_BUSINESS_TIME_ZONE aligned with backend BusinessTimeZone.

## Checks

`npm run typecheck` and `npm run build` validate the application. With the API on port 5080 and frontend on 3000, run `npx playwright install chromium` then `npx playwright test tests/workspace.spec.ts`.

The additional `tests/crud.spec.ts` routes writes to a disposable API on port 5081. Do not point that API at your real database. The test creates records and checks create/edit/delete/restore through the real UI.

## Vercel

Import this repository as a Next.js project. Set `NEXT_PUBLIC_API_URL=https://YOUR-BACKEND.onrender.com` (without `/api`) and redeploy. Configure backend CORS to the exact frontend origin. All application data is fetched from the backend; no demo data is embedded in the frontend.

## Known scope limits

No user accounts, assignees, comments, attachments or historical reports exist in the supplied schema. Those features remain a separate migration phase. Kanban persists status, not manual card order. Reports show current data, not invented historical trends.

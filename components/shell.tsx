"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  ListTodo,
  Tags,
  Search,
  Columns3,
  CalendarDays,
  Menu,
  X,
  ArrowUpRight,
  Layers,
  ChartNoAxesCombined,
  Plus,
  ChevronDown,
} from "lucide-react";
const sections = [
  {
    title: "Dashboard",
    links: [
      ["/", "Overview", LayoutDashboard],
      ["/departments", "Departments", Building2],
      ["/search", "All tasks", Search],
      ["/board", "Board", Columns3],
      ["/calendar", "Calendar", CalendarDays],
      ["/reports", "Reports", ChartNoAxesCombined],
    ],
  },
  {
    title: "Workspace",
    links: [
      ["/projects/manage", "Projects", FolderKanban],
      ["/tasks/manage", "Tasks", ListTodo],
      ["/departments/manage", "Departments", Building2],
      ["/tags/manage", "Tags", Tags],
    ],
  },
] as const;
export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="app-shell">
      <button
        className="mobile-menu icon-button"
        aria-label="Open navigation"
        onClick={() => setOpen(true)}
      >
        <Menu />
      </button>
      {open && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <Link href="/" className="brand">
          <span className="brand-icon">
            <Layers size={22} />
          </span>
          TaskTrack
        </Link>
        <button
          className="mobile-close icon-button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        >
          <X />
        </button>
        <div className="workspace-label">
          <span className="workspace-avatar">T</span>
          <div>
            <strong>Team workspace</strong>
            <small>Make good work happen</small>
          </div>
          <span className="online-dot" />
        </div>
        {sections.map((s) => (
          <nav key={s.title} aria-label={s.title}>
            <p className="nav-heading">{s.title}</p>
            {s.links.map(([href, label, Icon]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`nav-link ${pathname === href ? "active" : ""}`}
              >
                <Icon size={18} />
                {label}
                {pathname === href && <span className="active-dot" />}
              </Link>
            ))}
          </nav>
        ))}
        <div className="sidebar-footer">
          <div className="tiny-label">YOUR WORKSPACE</div>
          <p>
            Everything you need.
            <br />
            One place to focus.
          </p>
          <Link href="/reports">
            Workspace insights <ArrowUpRight size={15} />
          </Link>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <span className="topbar-breadcrumb">
            Workspace <span className="breadcrumb-divider">/</span>{" "}
            <strong>
              {pathname === "/"
                ? "Overview"
                : pathname.split("/")[1]?.replace(/^./, (c) => c.toUpperCase())}
            </strong>
          </span>
          <form className="global-search" action="/search">
            <Search size={16} />
            <input
              name="title"
              aria-label="Search workspace"
              placeholder="Search anything…"
            />
            <kbd>↵</kbd>
          </form>
          <div className="topbar-right">
            <Link
              className="button secondary topbar-create"
              href="/tasks/manage?create=1"
            >
              <Plus size={15} />
              Create new
            </Link>
            <span className="public-pill">
              <span className="online-dot" /> Public workspace
            </span>
            <Link href="/departments" className="workspace-profile">
              <span className="avatar">TT</span>
              <span>
                <strong>Team workspace</strong>
                <small>Public workspace</small>
              </span>
              <ChevronDown size={14} />
            </Link>
          </div>
        </header>
        <main>{children}</main>
        <footer className="page-footer">
          TaskTrack <span>Built for a clearer workday.</span>
        </footer>
      </div>
    </div>
  );
}

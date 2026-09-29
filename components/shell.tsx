"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
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
  Layers,
  ChartNoAxesCombined,
  Plus,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/primitives/dropdown-menu";

const sections = [
  { title: "Dashboard", links: [["/" , "Overview", LayoutDashboard]] },
  {
    title: "Workspace",
    links: [
      ["/departments", "Departments", Building2],
      ["/projects", "Projects", FolderKanban],
      ["/tasks", "Tasks", ListTodo],
      ["/search", "Search", Search],
      ["/board", "Board", Columns3],
      ["/calendar", "Calendar", CalendarDays],
      ["/reports", "Reports", ChartNoAxesCombined],
    ],
  },
  {
    title: "Management",
    links: [
      ["/departments/manage", "Departments", Building2],
      ["/projects/manage", "Projects", FolderKanban],
      ["/tasks/manage", "Tasks", ListTodo],
      ["/tags/manage", "Tags", Tags],
    ],
  },
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const m = window.matchMedia("(min-width: 761px)");
    const close = () => { if (m.matches) setOpen(false); };
    m.addEventListener("change", close);
    return () => m.removeEventListener("change", close);
  }, []);

  function active(href: string) {
    return (
      pathname === href ||
      (href === "/projects" && /^\/projects\/\d+$/.test(pathname)) ||
      (href === "/departments" && /^\/departments\/\d+$/.test(pathname)) ||
      (href === "/tasks" && /^\/tasks\/\d+$/.test(pathname))
    );
  }

  const navigation = (
    <>
      <Link href="/" className="brand" onClick={() => setOpen(false)}>
        <span className="brand-icon">
          <Layers size={17} strokeWidth={2} />
        </span>
        <span className="brand-name">TaskTrack</span>
      </Link>

      <div className="workspace-label">
        <span className="workspace-avatar">T</span>
        <div>
          <strong style={{ fontSize: 12, fontWeight: 600 }}>Team workspace</strong>
          <small>Projects &amp; tasks</small>
        </div>
      </div>

      {sections.map((s) => (
        <nav key={s.title} aria-label={s.title}>
          <p className="nav-heading">{s.title}</p>
          {s.links.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              aria-current={active(href) ? "page" : undefined}
              onClick={() => setOpen(false)}
              className={`nav-link ${active(href) ? "active" : ""}`}
            >
              <Icon size={16} strokeWidth={1.7} />
              <span className="nav-label">{label}</span>
            </Link>
          ))}
        </nav>
      ))}

      <div className="sidebar-footer">
        <span className="tiny-label">TaskTrack</span>
        <p>Manage projects,<br />priorities &amp; teams.</p>
      </div>
    </>
  );

  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      {/* Desktop sidebar */}
      <aside className="sidebar desktop-sidebar">
        {navigation}
        <button
          className="collapse-button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((v) => !v)}
        >
          {collapsed ? (
            <PanelLeftOpen size={16} strokeWidth={1.7} />
          ) : (
            <PanelLeftClose size={16} strokeWidth={1.7} />
          )}
          <span className="nav-label" style={{ fontSize: 12 }}>Collapse</span>
        </button>
      </aside>

      {/* Mobile drawer */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger
          className="mobile-menu icon-button"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="drawer-overlay" />
          <Dialog.Content className="sidebar mobile-drawer">
            <Dialog.Title className="sr-only">
              Workspace navigation
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              Browse TaskTrack pages and management tools.
            </Dialog.Description>
            <Dialog.Close
              className="mobile-close icon-button"
              aria-label="Close navigation"
            >
              <X size={18} />
            </Dialog.Close>
            {navigation}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Main content area */}
      <div className="main-shell">
        <header className="topbar">
          <form className="global-search" action="/search">
            <Search size={15} strokeWidth={1.8} style={{ color: "#9aabbb", flexShrink: 0 }} />
            <input
              name="title"
              aria-label="Search workspace"
              placeholder="Search tasks and projects…"
            />
            <kbd>↵</kbd>
          </form>

          <div className="topbar-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="button topbar-create"
                  aria-label="Create new record"
                >
                  <Plus size={15} />
                  <span>Create new</span>
                  <ChevronDown size={12} strokeWidth={2} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="atlas-menu">
                <DropdownMenuLabel>Create new</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {[
                  ["/tasks/manage", "Task"],
                  ["/projects/manage", "Project"],
                  ["/departments/manage", "Department"],
                  ["/tags/manage", "Tag"],
                ].map(([path, label]) => (
                  <DropdownMenuItem asChild key={path}>
                    <Link href={`${path}?create=1`}>{label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href="/departments"
              className="workspace-profile"
              aria-label="Browse team workspace"
            >
              <span className="avatar">TT</span>
              <span>
                <strong>Team workspace</strong>
                <small>Public workspace</small>
              </span>
            </Link>
          </div>
        </header>

        <main id="page-content">{children}</main>

        <footer className="page-footer">
          <span>TaskTrack</span>
          <span>Projects, priorities, progress.</span>
        </footer>
      </div>
    </div>
  );
}

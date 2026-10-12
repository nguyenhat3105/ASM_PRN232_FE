"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  ShieldCheck,
  Tags,
  Users,
} from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { useAuth } from "@/lib/auth";
import { useResource } from "@/lib/use-resource";
import { Department, Project, Task, Tag } from "@/lib/types";

const adminAreas = [
  {
    label: "Departments",
    description: "Organize teams and ownership",
    href: "/admin/departments",
    icon: Building2,
    tone: "blue",
  },
  {
    label: "Projects",
    description: "Plan delivery and progress",
    href: "/admin/projects",
    icon: FolderKanban,
    tone: "violet",
  },
  {
    label: "Tasks",
    description: "Keep work moving forward",
    href: "/admin/tasks",
    icon: ListTodo,
    tone: "orange",
  },
  {
    label: "Tags",
    description: "Create consistent task labels",
    href: "/admin/tags",
    icon: Tags,
    tone: "green",
  },
] as const;

export default function Page() {
  const { account } = useAuth();
  const departments = useResource<Department[]>("/departments");
  const projects = useResource<Project[]>("/projects");
  const tasks = useResource<Task[]>("/tasks");
  const tags = useResource<Tag[]>("/tags");
  const counts = [
    departments.data?.length,
    projects.data?.length,
    tasks.data?.length,
    tags.data?.length,
  ];

  return (
    <AuthGate>
      <section className="admin-dashboard">
        <header className="admin-dashboard__hero">
          <div>
            <p className="admin-dashboard__eyebrow">
              <LayoutDashboard size={14} /> Administration
            </p>
            <h1>Admin dashboard</h1>
            <p>
              Review your workspace at a glance and open the management area you
              need.
            </p>
          </div>
          <div className="admin-dashboard__identity">
            <span className="admin-dashboard__identity-icon">
              <ShieldCheck size={18} />
            </span>
            <span>
              <small>Signed in as</small>
              <strong>
                {account?.role === 1 ? "Administrator" : "Staff member"}
              </strong>
            </span>
          </div>
        </header>

        <div className="admin-dashboard__section-heading">
          <div>
            <h2>Workspace management</h2>
            <p>Choose an area to view, create, edit, or remove records.</p>
          </div>
          <span className="admin-dashboard__count">
            {counts.reduce<number>((total, count) => total + (count ?? 0), 0)}{" "}
            records
          </span>
        </div>

        <div className="admin-overview-grid">
          {adminAreas.map(
            ({ label, description, href, icon: Icon, tone }, index) => (
              <Link className="admin-overview-card" href={href} key={href}>
                <span className={`admin-overview-card__icon ${tone}`}>
                  <Icon size={19} />
                </span>
                <span className="admin-overview-card__body">
                  <span className="admin-overview-card__label">{label}</span>
                  <strong>{counts[index] ?? "—"}</strong>
                  <small>{description}</small>
                </span>
                <ArrowUpRight
                  className="admin-overview-card__arrow"
                  size={17}
                />
              </Link>
            ),
          )}

          {account?.role === 1 && (
            <Link
              className="admin-overview-card admin-overview-card--accounts"
              href="/admin/accounts"
            >
              <span className="admin-overview-card__icon indigo">
                <Users size={19} />
              </span>
              <span className="admin-overview-card__body">
                <span className="admin-overview-card__label">
                  Account management
                </span>
                <strong>Open</strong>
                <small>Control staff access and roles</small>
              </span>
              <ArrowUpRight className="admin-overview-card__arrow" size={17} />
            </Link>
          )}
        </div>
      </section>
    </AuthGate>
  );
}

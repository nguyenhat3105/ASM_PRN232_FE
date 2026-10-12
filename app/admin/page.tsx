"use client";

import Link from "next/link";
import { AuthGate } from "@/components/auth-gate";
import { useAuth } from "@/lib/auth";
import { useResource } from "@/lib/use-resource";
import { Department, Project, Task, Tag } from "@/lib/types";

export default function Page() {
  const { account } = useAuth();
  const departments = useResource<Department[]>("/departments");
  const projects = useResource<Project[]>("/projects");
  const tasks = useResource<Task[]>("/tasks");
  const tags = useResource<Tag[]>("/tags");

  return (
    <AuthGate>
      <div>
        <h1>Admin dashboard</h1>
        <p className="muted">
          Signed in as {account?.role === 1 ? "Administrator" : "Staff"}. Manage
          TaskTrack data with your authenticated account.
        </p>
        <div className="stats-grid">
          {[
            ["Departments", departments.data?.length, "/admin/departments"],
            ["Projects", projects.data?.length, "/admin/projects"],
            ["Tasks", tasks.data?.length, "/admin/tasks"],
            ["Tags", tags.data?.length, "/admin/tags"],
          ].map(([label, count, path]) => (
            <Link className="stat-card" href={String(path)} key={String(path)}>
              <span>{label}</span>
              <strong>{count ?? "—"}</strong>
            </Link>
          ))}
          {account?.role === 1 && (
            <Link className="stat-card" href="/admin/accounts">
              <span>Account management</span>
              <strong>Open</strong>
            </Link>
          )}
        </div>
      </div>
    </AuthGate>
  );
}

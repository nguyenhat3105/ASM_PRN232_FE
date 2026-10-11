"use client";
import Link from "next/link";
import { AuthGate } from "@/components/auth-gate";
import { useResource } from "@/lib/use-resource";
import { Department, Project, Task, Tag } from "@/lib/types";
export default function Page() { const departments=useResource<Department[]>("/departments"), projects=useResource<Project[]>("/projects"), tasks=useResource<Task[]>("/tasks"), tags=useResource<Tag[]>("/tags"); return <AuthGate><div><h1>Admin dashboard</h1><p className="muted">Manage TaskTrack data with your authenticated account.</p><div className="stats-grid">{[["Departments",departments.data?.length,"/admin/departments"],["Projects",projects.data?.length,"/admin/projects"],["Tasks",tasks.data?.length,"/admin/tasks"],["Tags",tags.data?.length,"/admin/tags"]].map(([label,count,path])=><Link className="stat-card" href={String(path)} key={String(label)}><span>{label}</span><strong>{count ?? "—"}</strong></Link>)}</div></div></AuthGate>; }

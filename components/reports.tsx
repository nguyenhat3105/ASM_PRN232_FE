"use client";
import Link from "next/link";
import { Download } from "lucide-react";
import { useResource } from "@/lib/use-resource";
import { Project, Task, taskStatuses, priorities, overdue } from "@/lib/types";
import { exportTasks } from "@/lib/export";
import { PageHeading, Loading, ErrorState, Badge } from "./ui";

export function Reports() {
  const projects = useResource<Project[]>("/projects");
  const tasks = useResource<Task[]>("/tasks");
  const error = projects.error || tasks.error;
  if (error)
    return (
      <ErrorState
        message={error}
        retry={() => {
          projects.reload();
          tasks.reload();
        }}
      />
    );
  if (!projects.data || !tasks.data) return <Loading />;
  const all = tasks.data;
  const eligible = all.filter((t) => t.status !== 3);
  const done = eligible.filter((t) => t.status === 2).length;
  const completion = eligible.length
    ? Math.round((done / eligible.length) * 100)
    : 0;
  return (
    <>
      <PageHeading
        eyebrow="TURN CLARITY INTO PROGRESS"
        title="Workspace insights"
        description="Current progress and priorities across your active projects."
        action={
          <button
            className="button secondary"
            onClick={() => exportTasks(all)}
            disabled={!all.length}
          >
            <Download size={15} />
            Export tasks
          </button>
        }
      />
      <div className="stats-grid">
        {[
          ["Active tasks", all.length],
          ["Completion rate", `${completion}%`],
          ["Overdue", all.filter(overdue).length],
          ["No due date", all.filter((t) => !t.dueDate).length],
        ].map(([label, value]) => (
          <div className="stat-card" key={label}>
            <div className="stat-top">{label}</div>
            <div className="stat-value">{value}</div>
          </div>
        ))}
      </div>
      <div className="report-grid">
        {[
          {
            title: "Tasks by status",
            labels: taskStatuses,
            field: "status" as const,
          },
          {
            title: "Tasks by priority",
            labels: priorities,
            field: "priority" as const,
          },
        ].map((group) => (
          <section className="panel detail-body" key={group.title}>
            <h2>{group.title}</h2>
            {group.labels.map((label, value) => {
              const count = all.filter((t) => t[group.field] === value).length;
              return (
                <div key={label} className="report-bar-row">
                  <div className="card-meta">
                    <span>{label}</span>
                    <strong>{count}</strong>
                  </div>
                  <div className="progress">
                    <span
                      style={{
                        width: `${all.length ? (count / all.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </section>
        ))}
      </div>
      <div className="section-heading">
        <h2>Project health</h2>
        <span className="muted">Current snapshot</span>
      </div>
      <div className="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Status</th>
              <th>Open</th>
              <th>Done</th>
              <th>Overdue</th>
              <th>Completion</th>
            </tr>
          </thead>
          <tbody>
            {projects.data.map((p) => {
              const items = all.filter((t) => t.projectId === p.projectId);
              const completed = items.filter((t) => t.status === 2).length;
              const total = items.filter((t) => t.status !== 3).length;
              const late = items.filter(overdue).length;
              return (
                <tr key={p.projectId}>
                  <td className="title-cell">
                    <Link href={`/projects/${p.projectId}`}>
                      {p.projectName}
                    </Link>
                    <div className="table-subtitle">{p.departmentName}</div>
                  </td>
                  <td>
                    <Badge value={p.status} type="project" />
                  </td>
                  <td>{items.filter((t) => t.status < 2).length}</td>
                  <td>{completed}</td>
                  <td className={late ? "overdue" : ""}>{late}</td>
                  <td>{total ? Math.round((completed / total) * 100) : 0}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="muted" style={{ marginTop: 18 }}>
        Completion = Done ÷ active tasks excluding Cancelled. Overdue excludes
        Done and Cancelled. Historical trends require status history and are not
        inferred from modification dates.
      </p>
    </>
  );
}

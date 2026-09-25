"use client";
import Link from "next/link";
import {
  Plus,
  ArrowUpRight,
  Building2,
  FolderKanban,
  CheckCheck,
  Clock3,
} from "lucide-react";
import { useResource } from "@/lib/use-resource";
import { Department, Project, Task, overdue, taskStatuses } from "@/lib/types";
import { PageHeading, Loading, ErrorState, Empty, Badge } from "./ui";
import { TaskTable } from "./task-table";
export function Dashboard() {
  const departments = useResource<Department[]>("/departments"),
    projects = useResource<Project[]>("/projects"),
    tasks = useResource<Task[]>("/tasks");
  const error = departments.error || projects.error || tasks.error;
  if (error)
    return (
      <ErrorState
        message={error}
        retry={() => {
          departments.reload();
          projects.reload();
          tasks.reload();
        }}
      />
    );
  if (!departments.data || !projects.data || !tasks.data) return <Loading />;
  const all = tasks.data,
    done = all.filter((t) => t.status === 2).length,
    late = all.filter(overdue);
  const stats = [
    {
      name: "Active projects",
      value: projects.data.length,
      Icon: FolderKanban,
      note: `${projects.data.filter((p) => p.status === 1).length} currently in progress`,
    },
    {
      name: "Open tasks",
      value: all.filter((t) => t.status < 2).length,
      Icon: Clock3,
      note: "Ready for your next step",
    },
    {
      name: "Completed",
      value: done,
      Icon: CheckCheck,
      note: `Across ${departments.data.length} active departments`,
    },
    {
      name: "Overdue",
      value: late.length,
      Icon: Building2,
      note: "Tasks past their due date",
    },
  ];
  const counts = taskStatuses.map(
    (_, i) => all.filter((t) => t.status === i).length,
  );
  const colors = ["#325bdf", "#9cb7f2", "#148b80", "#ef707a"];
  let cursor = 0;
  const stops = counts
    .map((count, i) => {
      const start = cursor;
      cursor += all.length ? (count / all.length) * 100 : 0;
      return `${colors[i]} ${start}% ${cursor}%`;
    })
    .join(",");
  const deadlines = all
    .filter((t) => t.status < 2 && t.dueDate)
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))
    .slice(0, 4);
  return (
    <>
      <PageHeading
        eyebrow="DASHBOARD"
        title="Overview"
        description="Everything happening in your workspace, at a glance."
        action={
          <Link href="/tasks/manage?create=1" className="button">
            <Plus size={15} />
            Create task
          </Link>
        }
      />
      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.name} className="stat-card">
            <div className="stat-top">
              <span>{s.name}</span>
              <span className="stat-icon">
                <s.Icon size={15} />
              </span>
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-bottom">{s.note}</div>
          </div>
        ))}
      </div>
      <div className="atlas-overview-grid">
        <section className="panel">
          <div className="panel-heading">
            <h2>
              Project progress{" "}
              <span className="count-label">{projects.data.length}</span>
            </h2>
            <Link href="/projects/manage" aria-label="View all projects">
              <ArrowUpRight size={15} />
            </Link>
          </div>
          {projects.data.length ? (
            projects.data.slice(0, 6).map((p) => {
              const percent = p.taskCount
                ? Math.round((p.completedTaskCount / p.taskCount) * 100)
                : 0;
              return (
                <div className="atlas-project-row" key={p.projectId}>
                  <div>
                    <h3>
                      <Link href={`/projects/${p.projectId}`}>
                        {p.projectName}
                      </Link>
                    </h3>
                    <small>{p.departmentName}</small>
                  </div>
                  <div className="atlas-progress-label">
                    <div
                      className="progress"
                      aria-label={`${percent}% completed`}
                    >
                      <span
                        style={{
                          width: `${percent}%`,
                          background: p.status === 2 ? "#148b80" : "#325bdf",
                        }}
                      />
                    </div>
                    <span>{percent}%</span>
                  </div>
                  <Badge value={p.status} type="project" />
                </div>
              );
            })
          ) : (
            <Empty title="No active projects" />
          )}
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>Upcoming & overdue</h2>
            <Link href="/calendar" aria-label="Open calendar">
              <ArrowUpRight size={15} />
            </Link>
          </div>
          {deadlines.length ? (
            deadlines.map((t) => (
              <div className="atlas-deadline" key={t.taskId}>
                <span className="date-tile">
                  {new Date(t.dueDate! + "T12:00:00").toLocaleDateString(
                    "en-GB",
                    { month: "short" },
                  )}
                  <strong>{Number(t.dueDate!.slice(-2))}</strong>
                </span>
                <Link href={`/tasks/${t.taskId}`}>
                  {t.title}
                  <small>{t.projectName}</small>
                </Link>
              </div>
            ))
          ) : (
            <Empty
              title="No pending deadlines"
              description="Your scheduled tasks will appear here."
            />
          )}
        </section>
      </div>
      <div className="atlas-bottom-grid">
        <section className="panel">
          <div className="panel-heading">
            <h2>
              Priority tasks <span className="count-label">{late.length}</span>
            </h2>
            <Link href="/search?overdue=true">
              View all <ArrowUpRight size={12} style={{ display: "inline" }} />
            </Link>
          </div>
          <TaskTable
            tasks={[...late]
              .sort((a, b) => b.priority - a.priority)
              .slice(0, 4)}
          />
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>Task overview</h2>
            <Link href="/reports" aria-label="Open reports">
              <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="atlas-chart">
            <div
              className="task-donut"
              role="img"
              aria-label={taskStatuses
                .map((s, i) => `${s}: ${counts[i]}`)
                .join(", ")}
              style={{
                background: all.length ? `conic-gradient(${stops})` : "#edf0f5",
              }}
            >
              <div className="donut-label">
                <strong>{all.length}</strong>
                <span>Total tasks</span>
              </div>
            </div>
            <div className="chart-legend">
              {taskStatuses.map((s, i) => (
                <div key={s}>
                  <i style={{ background: colors[i] }} />
                  {s}
                  <strong>{counts[i]}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

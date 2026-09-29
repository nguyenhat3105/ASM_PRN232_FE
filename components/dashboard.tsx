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
import { ProjectCard } from "./project-card";
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

  if (!departments.data || !projects.data || !tasks.data)
    return <Loading variant="dashboard" />;

  const all = tasks.data,
    done = all.filter((t) => t.status === 2).length,
    inProgress = all.filter((t) => t.status === 1).length,
    late = all.filter(overdue);

  const stats = [
    {
      name: "Active projects",
      value: projects.data.length,
      Icon: FolderKanban,
      note: `${projects.data.filter((p) => p.status === 1).length} in progress`,
    },
    {
      name: "Total tasks",
      value: all.length,
      Icon: Clock3,
      note: `${inProgress} in progress`,
    },
    {
      name: "Completed",
      value: done,
      Icon: CheckCheck,
      note: `Out of ${all.length} tasks`,
    },
    {
      name: "Departments",
      value: departments.data.length,
      Icon: Building2,
      note: "Active teams",
    },
  ];

  // Task status donut chart
  const counts = taskStatuses.map((_, i) => all.filter((t) => t.status === i).length);
  const colors = ["#8493ae", "#355ae2", "#2d7262", "#85688b"];
  let cursor = 0;
  const stops = counts
    .map((count, i) => {
      const start = cursor;
      cursor += all.length ? (count / all.length) * 100 : 0;
      return `${colors[i]} ${start}% ${cursor}%`;
    })
    .join(",");

  // Upcoming deadlines: open tasks with due date, sorted soonest first, max 5
  const deadlines = all
    .filter((t) => t.status < 2 && t.dueDate)
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))
    .slice(0, 5);

  return (
    <>
      <PageHeading
        eyebrow="OVERVIEW"
        title="Overview"
        description="Track your projects, tasks and workspace activity."
        action={
          <Link href="/tasks/manage?create=1" className="button">
            <Plus size={14} />
            Create task
          </Link>
        }
      />

      <section className="welcome-banner" aria-labelledby="welcome-title">
        <h2 id="welcome-title">Welcome to TaskTrack</h2>
        <p>Plan your next step, organize your team’s projects, and keep work moving.</p>
      </section>

      {/* ─── Stats row ─── */}
      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.name} className="stat-card">
            <div className="stat-top">
              <span>{s.name}</span>
              <span className="stat-icon">
                <s.Icon size={16} strokeWidth={1.6} />
              </span>
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-bottom">{s.note}</div>
          </div>
        ))}
      </div>

      {/* ─── Main grid: Project progress + Deadlines ─── */}
      <div className="atlas-overview-grid">
        {/* Project progress panel */}
        <section className="panel">
          <div className="panel-heading">
            <h2>
              Active projects{" "}
              <span className="count-label">{projects.data.length}</span>
            </h2>
            <Link href="/projects" aria-label="View all projects">
              <ArrowUpRight size={15} />
              View all
            </Link>
          </div>
          {projects.data.length ? (
            <div className="dashboard-project-cards">
              {projects.data.map((project) => <ProjectCard key={project.projectId} project={project} />)}
            </div>
          ) : (
            <Empty title="No projects yet" description="Create your first project to see progress here."
              action={<Link href="/projects/manage?create=1" className="button"><Plus size={14} />New project</Link>} />
          )}
        </section>

        {/* Upcoming deadlines panel */}
        <section className="panel">
          <div className="panel-heading">
            <h2>Upcoming deadlines</h2>
            <Link href="/calendar" aria-label="Open calendar">
              <ArrowUpRight size={15} />
            </Link>
          </div>
          {deadlines.length ? (
            deadlines.map((t) => (
              <div className="atlas-deadline" key={t.taskId}>
                <span className="date-tile" aria-hidden="true">
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
              description="Your upcoming task due dates will appear here."
            />
          )}
        </section>
      </div>

      {/* ─── Bottom grid: Overdue tasks + Task overview chart ─── */}
      <div className="atlas-bottom-grid">
        {/* Overdue / priority tasks */}
        <section className="panel">
          <div className="panel-heading">
            <h2>
              Overdue tasks{" "}
              {late.length > 0 && (
                <span className="count-label">{late.length}</span>
              )}
            </h2>
            <Link href="/search?overdue=true">
              View all <ArrowUpRight size={12} style={{ display: "inline" }} />
            </Link>
          </div>
          <TaskTable
            tasks={[...late].sort((a, b) => b.priority - a.priority).slice(0, 5)}
          />
        </section>

        {/* Task status donut */}
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
                background: all.length
                  ? `conic-gradient(${stops})`
                  : "#e8ecf5",
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
                  <i style={{ background: colors[i] }} aria-hidden="true" />
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

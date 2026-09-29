"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useResource } from "@/lib/use-resource";
import { Department, Project, projectStatuses, dateLabel } from "@/lib/types";
import { PageHeading, Loading, ErrorState, Empty, Badge } from "./ui";

export function ProjectTable({ projects }: { projects: Project[] }) {
  if (!projects.length) {
    return (
      <Empty
        title="No projects to show"
        description="Projects matching this view will appear here."
      />
    );
  }
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Project</th>
            <th>Status</th>
            <th>Start date</th>
            <th>End date</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => {
            const pct = p.taskCount
              ? Math.round((p.completedTaskCount / p.taskCount) * 100)
              : 0;
            return (
              <tr key={p.projectId}>
                <td className="title-cell">
                  <Link href={`/projects/${p.projectId}`}>{p.projectName}</Link>
                  <div className="table-subtitle">{p.departmentName}</div>
                </td>
                <td>
                  <Badge value={p.status} type="project" />
                </td>
                <td>{dateLabel(p.startDate)}</td>
                <td>{dateLabel(p.endDate)}</td>
                <td>
                  <div className="table-progress">
                    <span>
                      {p.completedTaskCount} / {p.taskCount} tasks
                    </span>
                    <div
                      className="progress"
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${pct}% complete`}
                    >
                      <span style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function Projects() {
  const [name, setName] = useState(""),
    [status, setStatus] = useState(""),
    [department, setDepartment] = useState("");

  const projects = useResource<Project[]>("/projects"),
    departments = useResource<Department[]>("/departments");

  const filtered = (projects.data || []).filter(
    (p) =>
      p.projectName.toLowerCase().includes(name.toLowerCase()) &&
      (!status || p.status === Number(status)) &&
      (!department || p.departmentId === Number(department)),
  );

  return (
    <>
      <PageHeading
        eyebrow="WORKSPACE"
        title="Projects"
        description="Track projects and progress across departments."
        action={
          <Link className="button" href="/projects/manage?create=1">
            <Plus size={14} />
            New project
          </Link>
        }
      />

      <div className="toolbar">
        <Search size={15} strokeWidth={1.8} style={{ color: "#9aabbb" }} />
        <input
          aria-label="Search projects"
          placeholder="Search projects…"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {projectStatuses.map((s, i) => (
            <option key={s} value={i}>
              {s}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">All departments</option>
          {departments.data?.map((d) => (
            <option key={d.departmentId} value={d.departmentId}>
              {d.departmentName}
            </option>
          ))}
        </select>
      </div>

      {departments.error && (
        <div className="notice">
          Department filters could not load.{" "}
          <button onClick={departments.reload}>Retry</button>
        </div>
      )}

      {projects.error ? (
        <ErrorState message={projects.error} retry={projects.reload} />
      ) : projects.loading ? (
        <Loading variant="table" />
      ) : (
        <div className="panel">
          <div className="panel-heading">
            <h2>
              All projects{" "}
              <span className="count-label">{filtered.length}</span>
            </h2>
          </div>
          {filtered.length ? (
            <ProjectTable projects={filtered} />
          ) : (
            <Empty
              title="No projects found"
              description="Try another filter or create your first project."
              action={
                <Link className="button" href="/projects/manage?create=1">
                  <Plus size={14} />
                  Create project
                </Link>
              }
            />
          )}
        </div>
      )}
    </>
  );
}

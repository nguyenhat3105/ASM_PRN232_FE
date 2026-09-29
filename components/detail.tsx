"use client";
import Link from "next/link";
import { ChevronRight, Pencil, Plus, Building2 } from "lucide-react";
import { useState } from "react";
import { taskStatuses } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/primitives/tabs";
import { ProjectTable } from "./projects";
import { useResource } from "@/lib/use-resource";
import { Department, Project, Task, dateLabel, overdue } from "@/lib/types";
import { Badge, TagChip, PageHeading, Loading, ErrorState, Empty } from "./ui";
import { TaskTable } from "./task-table";

export function Detail({
  kind,
  id,
}: {
  kind: "departments" | "projects" | "tasks";
  id: string;
}) {
  const r = useResource<Department | Project | Task>(`/${kind}/${id}`);
  const [status, setStatus] = useState("all");

  if (r.error) return <ErrorState message={r.error} retry={r.reload} />;
  if (!r.data) return <Loading />;

  const d = r.data;
  const title =
    "title" in d
      ? d.title
      : "projectName" in d
        ? d.projectName
        : d.departmentName;

  // Singular form for breadcrumb / edit label
  const singular =
    kind === "departments" ? "Department" : kind === "projects" ? "Project" : "Task";

  return (
    <>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link href="/">Overview</Link>
        <span className="breadcrumb-sep" aria-hidden="true">
          <ChevronRight size={13} />
        </span>
        <Link href={`/${kind}`}>
          {kind.charAt(0).toUpperCase() + kind.slice(1)}
        </Link>
        <span className="breadcrumb-sep" aria-hidden="true">
          <ChevronRight size={13} />
        </span>
        <span className="breadcrumb-current">{title}</span>
      </nav>

      <PageHeading
        eyebrow={`${singular.toUpperCase()} DETAILS`}
        title={title}
        description={
          kind === "tasks"
            ? `Task #${id}`
            : kind === "projects"
              ? `Project #${id}`
              : "The teams and projects moving work forward."
        }
        action={
          <Link
            className="button secondary"
            href={`/${kind}/manage?edit=${id}`}
          >
            <Pencil size={13} />
            Edit {singular.toLowerCase()}
          </Link>
        }
      />

      {/* ── Department detail ── */}
      {"departmentDescription" in d ? (
        <>
          {/* Department header card */}
          <div className="dept-header-panel">
            <div className="dept-header-icon">
              <Building2 size={22} strokeWidth={1.6} />
            </div>
            <div className="dept-header-text">
              <h2>{d.departmentName}</h2>
              <p>{d.departmentDescription || "No description provided."}</p>
            </div>
          </div>

          {/* Projects section */}
          <div className="section-heading">
            <h2>
              Projects{" "}
              <span className="count-label">{d.projectCount}</span>
            </h2>
            <Link
              className="button"
              href={`/projects/manage?create=1&departmentId=${d.departmentId}`}
            >
              <Plus size={14} />
              New project
            </Link>
          </div>
          <div className="panel">
            {d.projects?.length ? (
              <ProjectTable projects={d.projects} />
            ) : (
              <Empty
                title="No projects yet"
                description="Create the first project for this department."
                action={
                  <Link
                    href={`/projects/manage?create=1&departmentId=${d.departmentId}`}
                    className="button"
                  >
                    <Plus size={14} />
                    Create project
                  </Link>
                }
              />
            )}
          </div>
        </>
      ) : (
        /* ── Project / Task detail ── */
        <>
          <div className="detail-grid">
            {/* Left: Description + Tags */}
            <section className="panel detail-body">
              <h2 style={{ marginBottom: 12 }}>
                {"taskCount" in d ? "Description" : "Description"}
              </h2>
              <p>{d.description || "No description provided."}</p>

              {"tags" in d && (
                <>
                  <h3 style={{ marginTop: 24, marginBottom: 10 }}>Tags</h3>
                  <div className="tag-list">
                    {d.tags.length ? (
                      d.tags.map((t) => <TagChip key={t.tagId} tag={t} />)
                    ) : (
                      <span className="muted">No tags assigned</span>
                    )}
                  </div>
                </>
              )}
            </section>

            {/* Right: Properties */}
            <section className="panel detail-body">
              <h2 style={{ marginBottom: 4 }}>Details</h2>
              <dl>
                <div className="property">
                  <dt>Status</dt>
                  <dd>
                    <Badge
                      value={d.status}
                      type={kind === "tasks" ? "task" : "project"}
                    />
                  </dd>
                </div>

                {"priority" in d ? (
                  <>
                    <div className="property">
                      <dt>Priority</dt>
                      <dd>
                        <Badge value={d.priority} type="priority" />
                      </dd>
                    </div>
                    <div className="property">
                      <dt>Project</dt>
                      <dd>
                        <Link href={`/projects/${d.projectId}`}>
                          {d.projectName}
                        </Link>
                      </dd>
                    </div>
                    <div className="property">
                      <dt>Due date</dt>
                      <dd className={overdue(d) ? "overdue" : ""}>
                        {dateLabel(d.dueDate)}
                      </dd>
                    </div>
                    <div className="property">
                      <dt>Last modified</dt>
                      <dd>{dateLabel(d.modifiedDate)}</dd>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="property">
                      <dt>Department</dt>
                      <dd>
                        <Link href={`/departments/${d.departmentId}`}>
                          {d.departmentName}
                        </Link>
                      </dd>
                    </div>
                    <div className="property">
                      <dt>Start date</dt>
                      <dd>{dateLabel(d.startDate)}</dd>
                    </div>
                    <div className="property">
                      <dt>End date</dt>
                      <dd>{dateLabel(d.endDate)}</dd>
                    </div>
                    <div className="property">
                      <dt>Tasks completed</dt>
                      <dd>
                        {d.completedTaskCount} / {d.taskCount}
                      </dd>
                    </div>
                  </>
                )}

                <div className="property">
                  <dt>Created</dt>
                  <dd>{dateLabel(d.createdDate)}</dd>
                </div>
                <div className="property" style={{ borderBottom: 0 }}>
                  <dt>Active</dt>
                  <dd>{d.isActive ? "Yes" : "No"}</dd>
                </div>
              </dl>
            </section>
          </div>

          {/* ── Project task list ── */}
          {"taskCount" in d && (
            <>
              <div className="section-heading">
                <h2>Project tasks</h2>
                <Link
                  className="button"
                  href={`/tasks/manage?create=1&projectId=${d.projectId}`}
                >
                  <Plus size={14} />
                  Add task
                </Link>
              </div>
              <Tabs
                value={status}
                onValueChange={setStatus}
                className="view-tabs status-tabs"
              >
                <TabsList aria-label="Filter tasks by status">
                  <TabsTrigger value="all">All</TabsTrigger>
                  {taskStatuses.map((s, i) => (
                    <TabsTrigger value={String(i)} key={s}>
                      {s}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <div className="panel">
                <TaskTable
                  tasks={(d.tasks || []).filter(
                    (t) => status === "all" || t.status === Number(status),
                  )}
                />
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

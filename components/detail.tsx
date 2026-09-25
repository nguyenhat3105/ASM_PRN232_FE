"use client";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { useResource } from "@/lib/use-resource";
import { Department, Project, Task, dateLabel, overdue } from "@/lib/types";
import { Badge, TagChip, PageHeading, Loading, ErrorState, Empty } from "./ui";
import { ProjectCard } from "./project-card";
import { TaskTable } from "./task-table";
export function Detail({
  kind,
  id,
}: {
  kind: "departments" | "projects" | "tasks";
  id: string;
}) {
  const r = useResource<Department | Project | Task>(`/${kind}/${id}`);
  if (r.error) return <ErrorState message={r.error} retry={r.reload} />;
  if (!r.data) return <Loading />;
  const d = r.data;
  const title =
    "title" in d
      ? d.title
      : "projectName" in d
        ? d.projectName
        : d.departmentName;
  return (
    <>
      <Link
        className="back-link"
        href={kind === "departments" ? "/departments" : `/${kind}/manage`}
      >
        <ArrowLeft size={14} />
        Back to {kind}
      </Link>
      <PageHeading
        eyebrow={`${kind.slice(0, -1).toUpperCase()} DETAILS`}
        title={title}
        description={
          kind === "tasks"
            ? `Task #${id}`
            : kind === "projects"
              ? `Project #${id}`
              : "The people and projects moving work forward."
        }
        action={
          <Link
            className="button secondary"
            href={`/${kind}/manage?edit=${id}`}
          >
            <Pencil size={14} />
            Edit {kind.slice(0, -1)}
          </Link>
        }
      />
      {"departmentDescription" in d ? (
        <>
          <div className="panel detail-body">
            <h2>About this department</h2>
            <p>{d.departmentDescription}</p>
          </div>
          <div className="section-heading">
            <h2>
              Projects <span className="count-label">{d.projectCount}</span>
            </h2>
          </div>
          <div className="project-grid">
            {d.projects?.map((p) => (
              <ProjectCard key={p.projectId} project={p} />
            ))}
          </div>
          {!d.projects?.length && <Empty title="No projects yet" />}
        </>
      ) : (
        <>
          <div className="detail-grid">
            <section className="panel detail-body">
              <h2>Description</h2>
              <p>{d.description || "No description provided."}</p>
              {"tags" in d && (
                <>
                  <h3 style={{ marginTop: 28 }}>Tags</h3>
                  <div className="tag-list">
                    {d.tags.length ? (
                      d.tags.map((t) => <TagChip key={t.tagId} tag={t} />)
                    ) : (
                      <span className="muted">No tags</span>
                    )}
                  </div>
                </>
              )}
            </section>
            <section className="panel detail-body">
              <h2>At a glance</h2>
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
                <div className="property">
                  <dt>Active</dt>
                  <dd>{d.isActive ? "Yes" : "No"}</dd>
                </div>
              </dl>
            </section>
          </div>
          {"taskCount" in d && (
            <>
              <div className="section-heading">
                <h2>Project tasks</h2>
                <Link href={`/search?projectId=${d.projectId}`}>
                  Filter tasks
                </Link>
              </div>
              <div className="panel">
                <TaskTable tasks={d.tasks || []} />
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

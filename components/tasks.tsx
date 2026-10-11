"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { useResource } from "@/lib/use-resource";
import { Project, Task, taskStatuses } from "@/lib/types";
import { ErrorState, Loading, PageHeading } from "./ui";
import { TaskTable } from "./task-table";

export function Tasks() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [projectId, setProjectId] = useState("");
  const tasks = useResource<Task[]>("/tasks");
  const projects = useResource<Project[]>("/projects");
  const filtered = (tasks.data || []).filter(
    (task) =>
      task.title.toLowerCase().includes(query.toLowerCase()) &&
      (!status || task.status === Number(status)) &&
      (!projectId || task.projectId === Number(projectId)),
  );

  return (
    <>
      <PageHeading
        eyebrow="WORKSPACE"
        title="Tasks"
        description="Browse active work across every project. Sign in to manage tasks."
      />
      <div className="toolbar">
        <Search size={15} strokeWidth={1.8} style={{ color: "#9aabbb" }} />
        <input
          aria-label="Search tasks"
          placeholder="Search tasks…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          aria-label="Filter tasks by status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">All statuses</option>
          {taskStatuses.map((label, value) => (
            <option key={label} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter tasks by project"
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
        >
          <option value="">All projects</option>
          {projects.data?.map((project) => (
            <option key={project.projectId} value={project.projectId}>
              {project.projectName}
            </option>
          ))}
        </select>
      </div>
      {projects.error && (
        <div className="notice">
          Project filters could not load.{" "}
          <button onClick={projects.reload}>Retry</button>
        </div>
      )}
      {tasks.error ? (
        <ErrorState message={tasks.error} retry={tasks.reload} />
      ) : tasks.loading ? (
        <Loading variant="table" />
      ) : (
        <div className="panel">
          <div className="panel-heading">
            <h2>
              All tasks <span className="count-label">{filtered.length}</span>
            </h2>
          </div>
          <TaskTable tasks={filtered} />
        </div>
      )}
    </>
  );
}

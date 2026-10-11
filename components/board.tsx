"use client";
import Link from "next/link";
import { useState } from "react";
import { useResource } from "@/lib/use-resource";
import { Task, Project } from "@/lib/types";
import { PageHeading, Loading, ErrorState } from "./ui";
import { TaskKanban } from "./task-kanban";
export function Board() {
  const [project, setProject] = useState("");
  const tasks = useResource<Task[]>(`/tasks/search?projectId=${project}`),
    projects = useResource<Project[]>("/projects");
  return (
    <>
      <PageHeading
        eyebrow="WORKSPACE"
        title="Task board"
        description="Browse work by status. Sign in to update a task."
      />
      <div className="toolbar">
        <select
          aria-label="Board project"
          value={project}
          onChange={(e) => setProject(e.target.value)}
        >
          <option value="">All projects</option>
          {projects.data?.map((p) => (
            <option key={p.projectId} value={p.projectId}>
              {p.projectName}
            </option>
          ))}
        </select>
        <Link className="button secondary" href="/tasks">
          Open task list
        </Link>
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
        <Loading variant="cards" />
      ) : (
        <TaskKanban tasks={tasks.data || []} editable={false} />
      )}
    </>
  );
}

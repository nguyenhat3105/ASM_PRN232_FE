"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, SlidersHorizontal, X } from "lucide-react";
import { useResource } from "@/lib/use-resource";
import { Task, Tag, Project, taskStatuses, priorities } from "@/lib/types";
import { exportTasks } from "@/lib/export";
import { PageHeading, Loading, ErrorState } from "./ui";
import { TaskTable } from "./task-table";
export function SearchPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SearchContent />
    </Suspense>
  );
}
function SearchContent() {
  const params = useSearchParams();
  const [title, setTitle] = useState(params.get("title") || "");
  const [sort, setSort] = useState("priority");
  const [page, setPage] = useState(1);
  const projects = useResource<Project[]>("/projects"),
    tags = useResource<Tag[]>("/tags");
  const query = params.toString();
  const tasks = useResource<Task[]>(`/tasks/search?${query}`);
  const urlTitle = params.get("title") || "";
  useEffect(() => { setTitle(urlTitle); }, [urlTitle]);
  useEffect(() => { setPage(1); }, [query]);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title === (params.get("title") || "")) return;
      const next = new URLSearchParams(window.location.search);
      if (title) next.set("title", title);
      else next.delete("title");
      window.history.replaceState(null, "", `/search?${next.toString()}`);
    }, 350);
    return () => clearTimeout(timer);
  }, [title, params]);
  function filter(key: string, value: string) {
    const next = new URLSearchParams(window.location.search);
    if (value) next.set(key, value);
    else next.delete(key);
    window.history.replaceState(null, "", `/search?${next}`);
    setPage(1);
  }
  const filtered = [...(tasks.data || [])].sort((a, b) =>
    sort === "title"
      ? a.title.localeCompare(b.title)
      : sort === "dueDate"
        ? (a.dueDate || "9999").localeCompare(b.dueDate || "9999")
        : sort === "createdDate"
          ? b.createdDate.localeCompare(a.createdDate)
          : b.priority - a.priority || a.taskId - b.taskId,
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 15));
  const current = Math.min(page, pages);
  return (
    <>
      <PageHeading
        eyebrow="SEARCH"
        title="Search"
        description="Find tasks across your workspace."
        action={
          <button
            className="button secondary"
            disabled={!filtered.length || tasks.loading || !!tasks.error}
            onClick={() => exportTasks(filtered)}
          >
            <Download size={14} />
            Export CSV
          </button>
        }
      />
      <div className="toolbar">
        <SlidersHorizontal size={15} strokeWidth={1.8} style={{ color: "#9aabbb" }} />
        <input
          aria-label="Search task title"
          placeholder="Search tasks by title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select
          aria-label="Filter status"
          value={params.get("status") || ""}
          onChange={(e) => filter("status", e.target.value)}
        >
          <option value="">All statuses</option>
          {taskStatuses.map((v, i) => (
            <option key={i} value={i}>
              {v}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter priority"
          value={params.get("priority") || ""}
          onChange={(e) => filter("priority", e.target.value)}
        >
          <option value="">All priorities</option>
          {priorities.map((v, i) => (
            <option key={i} value={i}>
              {v}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter project"
          value={params.get("projectId") || ""}
          onChange={(e) => filter("projectId", e.target.value)}
        >
          <option value="">All projects</option>
          {projects.data?.map((p) => (
            <option value={p.projectId} key={p.projectId}>
              {p.projectName}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter tag"
          value={params.get("tagId") || ""}
          onChange={(e) => filter("tagId", e.target.value)}
        >
          <option value="">All tags</option>
          {tags.data?.map((t) => (
            <option value={t.tagId} key={t.tagId}>
              {t.tagName}
            </option>
          ))}
        </select>
      </div>
      <div className="toolbar">
        <label className="check-inline">
          <input
            type="checkbox"
            checked={params.get("overdue") === "true"}
            onChange={(e) => filter("overdue", e.target.checked ? "true" : "")}
          />
          Overdue only
        </label>
        <select
          aria-label="Sort tasks"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="priority">Highest priority first</option>
          <option value="dueDate">Due date</option>
          <option value="title">Title A–Z</option>
          <option value="createdDate">Newest first</option>
        </select>
        {query && (
          <button
            className="button secondary"
            onClick={() => {
              setTitle("");
              window.history.replaceState(null, "", "/search");
            }}
          >
            <X size={14} />
            Clear filters
          </button>
        )}
      </div>
      {(projects.error || tags.error) && (
        <div className="notice">
          Some filter options could not load.{" "}
          <button
            onClick={() => {
              projects.reload();
              tags.reload();
            }}
          >
            Retry filters
          </button>
        </div>
      )}
      {tasks.error ? (
        <ErrorState message={tasks.error} retry={tasks.reload} />
      ) : tasks.loading ? (
        <Loading />
      ) : (
        <div className="panel">
          <TaskTable tasks={filtered.slice((current - 1) * 15, current * 15)} />
          <div className="pagination">
            <span>
              {filtered.length} matching tasks · Page {current} of {pages}
            </span>
            <div>
              <button
                className="button secondary"
                disabled={current === 1}
                onClick={() => setPage(current - 1)}
              >
                Previous
              </button>
              <button
                className="button secondary"
                disabled={current === pages}
                onClick={() => setPage(current + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

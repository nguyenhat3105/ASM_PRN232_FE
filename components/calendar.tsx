"use client";
import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useResource } from "@/lib/use-resource";
import { Task, Project, overdue, today } from "@/lib/types";
import { Loading, ErrorState, PageHeading } from "./ui";
const key = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export function Calendar() {
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [project, setProject] = useState("");
  const tasks = useResource<Task[]>(`/tasks/search?projectId=${project}`),
    projects = useResource<Project[]>("/projects");
  const start = new Date(month);
  start.setDate(1 - ((start.getDay() + 6) % 7));
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
  return (
    <>
      <PageHeading
        eyebrow="MAKE SPACE FOR WHAT MATTERS"
        title="Your work, on the calendar."
        description="See upcoming deadlines and give your week a little structure."
      />
      <div className="toolbar">
        <button
          className="icon-button"
          aria-label="Previous month"
          onClick={() =>
            setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
          }
        >
          <ChevronLeft />
        </button>
        <h2 style={{ margin: 0, minWidth: 170, textAlign: "center" }}>
          {month.toLocaleDateString("en-GB", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button
          className="icon-button"
          aria-label="Next month"
          onClick={() =>
            setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
          }
        >
          <ChevronRight />
        </button>
        <button
          className="button secondary"
          onClick={() =>
            setMonth(
              new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            )
          }
        >
          Today
        </button>
        <select
          aria-label="Calendar project"
          value={project}
          onChange={(e) => setProject(e.target.value)}
        >
          <option value="">All projects</option>
          {projects.data?.map((p) => (
            <option value={p.projectId} key={p.projectId}>
              {p.projectName}
            </option>
          ))}
        </select>
      </div>
      {tasks.error ? (
        <ErrorState message={tasks.error} retry={tasks.reload} />
      ) : !tasks.data ? (
        <Loading />
      ) : (
        <>
          <div className="panel table-wrap">
            <div className="calendar">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div className="calendar-label" key={d}>
                  {d}
                </div>
              ))}
              {days.map((d) => (
                <div
                  className={`calendar-day ${d.getMonth() !== month.getMonth() ? "other" : ""} ${key(d) === today() ? "today" : ""}`}
                  key={key(d)}
                >
                  <span>{d.getDate()}</span>
                  {tasks.data
                    ?.filter((t) => t.dueDate === key(d))
                    .map((t) => (
                      <Link
                        className={`calendar-task ${overdue(t) ? "late" : ""}`}
                        key={t.taskId}
                        href={`/tasks/${t.taskId}`}
                      >
                        {t.title}
                      </Link>
                    ))}
                </div>
              ))}
            </div>
          </div>
          <p className="muted" style={{ marginTop: 15 }}>
            {tasks.data.filter((t) => !t.dueDate).length} tasks have no due date
            and are not shown on the calendar.
          </p>
        </>
      )}
    </>
  );
}

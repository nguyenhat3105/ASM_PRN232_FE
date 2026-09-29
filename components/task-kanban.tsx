"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";
import { api } from "@/lib/api";
import { Task, taskStatuses, dateLabel, overdue } from "@/lib/types";
import { Badge, TagChip } from "./ui";

const COLUMN_COLORS = ["#8493ae", "#355ae2", "#2d7262", "#85688b"];

export function TaskKanban({
  tasks,
  onChanged,
}: {
  tasks: Task[];
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false),
    [drag, setDrag] = useState<number | null>(null);

  async function move(task: Task, status: number) {
    if (busy || task.status === status) return;
    setBusy(true);
    try {
      await api(`/tasks/${task.taskId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success(`Task moved to ${taskStatuses[status]}`);
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not move task.");
    } finally {
      setBusy(false);
      setDrag(null);
    }
  }

  return (
    <div className="board" aria-label="Task board">
      {taskStatuses.map((status, index) => {
        const colTasks = tasks.filter((t) => t.status === index);
        return (
          <section
            className={`board-column ${drag === index ? "drag-over" : ""}`}
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(index);
            }}
            onDragLeave={() => setDrag(null)}
            onDrop={(e) => {
              e.preventDefault();
              const task = tasks.find(
                (t) => t.taskId === Number(e.dataTransfer.getData("text/plain")),
              );
              setDrag(null);
              if (task) move(task, index);
            }}
          >
            {/* Column header */}
            <h2>
              <span
                className={`column-dot task-${index}`}
                style={{ background: COLUMN_COLORS[index] }}
                aria-hidden="true"
              />
              {status}
              <span className="column-count">{colTasks.length}</span>
            </h2>

            {/* Task cards */}
            {colTasks.map((t) => (
              <article
                className="board-card"
                key={t.taskId}
                draggable={!busy}
                onDragStart={(e) =>
                  e.dataTransfer.setData("text/plain", String(t.taskId))
                }
                onDragEnd={() => setDrag(null)}
              >
                {/* Top row: priority badge */}
                <div className="card-meta">
                  <Badge value={t.priority} type="priority" />
                  <span style={{ fontSize: 11, color: "#9aabbb" }}>
                    #{t.taskId}
                  </span>
                </div>

                {/* Task title */}
                <h3>
                  <Link href={`/tasks/${t.taskId}`}>{t.title}</Link>
                </h3>

                {/* Project name */}
                <small>{t.projectName}</small>

                {/* Tags */}
                {t.tags.length > 0 && (
                  <div className="tag-list" style={{ marginTop: 10 }}>
                    {t.tags.map((tag) => (
                      <TagChip key={tag.tagId} tag={tag} />
                    ))}
                  </div>
                )}

                {/* Due date */}
                {t.dueDate && (
                  <div
                    className={`board-due ${overdue(t) ? "overdue" : ""}`}
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <CalendarDays
                      size={11}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                    {dateLabel(t.dueDate)}
                  </div>
                )}

                {/* Status change — compact select */}
                <select
                  className="board-status-select"
                  aria-label={`Move "${t.title}" to a different status`}
                  value={t.status}
                  disabled={busy}
                  onChange={(e) => move(t, Number(e.target.value))}
                >
                  {taskStatuses.map((s, i) => (
                    <option key={s} value={i}>
                      {s}
                    </option>
                  ))}
                </select>
              </article>
            ))}

            {colTasks.length === 0 && (
              <p className="column-empty">No tasks</p>
            )}
          </section>
        );
      })}
    </div>
  );
}

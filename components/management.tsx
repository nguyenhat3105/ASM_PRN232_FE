"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ExternalLink,
  LoaderCircle,
  RotateCcw,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useResource } from "@/lib/use-resource";
import {
  Department,
  Entity,
  Kind,
  Project,
  Task,
  Tag,
  taskStatuses,
  projectStatuses,
  priorities,
  dateLabel,
  today,
} from "@/lib/types";
import {
  Badge,
  TagChip,
  PageHeading,
  Loading,
  ErrorState,
  Empty,
  Modal,
} from "./ui";
type Draft = {
  departmentName: string;
  departmentDescription: string;
  projectName: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  departmentId: string;
  title: string;
  priority: string;
  dueDate: string;
  projectId: string;
  tagIDs: number[];
  tagName: string;
  color: string;
};
const initial: Draft = {
  departmentName: "",
  departmentDescription: "",
  projectName: "",
  description: "",
  startDate: "",
  endDate: "",
  status: "0",
  departmentId: "",
  title: "",
  priority: "1",
  dueDate: "",
  projectId: "",
  tagIDs: [],
  tagName: "",
  color: "#64748B",
};
const singular: Record<Kind, string> = {
  departments: "department",
  projects: "project",
  tasks: "task",
  tags: "tag",
};
function idOf(kind: Kind, item: Entity) {
  return Number(
    (item as unknown as Record<string, unknown>)[`${singular[kind]}Id`],
  );
}
function nameOf(kind: Kind, item: Entity) {
  return String(
    (item as unknown as Record<string, unknown>)[
      kind === "tasks" ? "title" : `${singular[kind]}Name`
    ],
  );
}
export function Management({ kind }: { kind: Kind }) {
  return (
    <Suspense fallback={<Loading />}>
      <ManagementContent kind={kind} />
    </Suspense>
  );
}
function ManagementContent({ kind }: { kind: Kind }) {
  const [trash, setTrash] = useState(false);
  const resource = useResource<Entity[]>(
    kind === "tasks" && trash ? "/tasks/trash" : `/${kind}`,
  );
  const departments = useResource<Department[]>("/departments"),
    projects = useResource<Project[]>("/projects"),
    tags = useResource<Tag[]>("/tags");
  const [query, setQuery] = useState(""),
    [page, setPage] = useState(1),
    [open, setOpen] = useState(false),
    [editing, setEditing] = useState<Entity | null>(null),
    [draft, setDraft] = useState<Draft>(initial),
    [errors, setErrors] = useState<Record<string, string[]>>({}),
    [busy, setBusy] = useState(false),
    [deleting, setDeleting] = useState<Entity | null>(null),
    [handled, setHandled] = useState(false);
  const params = useSearchParams();
  function begin(item: Entity | null) {
    setEditing(item);
    setErrors({});
    setDraft(
      item
        ? {
            ...initial,
            ...Object.fromEntries(
              Object.entries(item).map(([k, v]) => [
                k,
                v == null ? "" : String(v),
              ]),
            ),
            tagIDs: "tags" in item ? item.tags.map((t) => t.tagId) : [],
            color: "color" in item ? item.color || "" : "",
          }
        : { ...initial, startDate: today() },
    );
    setOpen(true);
  }
  function duplicate(item: Task) {
    begin(item);
    setEditing(null);
    setDraft((d) => ({
      ...d,
      title: `${item.title.slice(0, 293)} (copy)`,
      status: "0",
    }));
  }
  useEffect(() => {
    if (handled || !resource.data) return;
    const edit = params.get("edit");
    if (edit) {
      const item = resource.data.find((e) => idOf(kind, e) === Number(edit));
      if (item) begin(item);
      setHandled(true);
    } else if (params.get("create") === "1") {
      begin(null);
      setHandled(true);
    }
  }, [params, resource.data, handled, kind]);
  const set = (key: keyof Draft, value: string | number[]) =>
    setDraft((d) => ({ ...d, [key]: value }));
  const fieldError = (key: string) =>
    errors[key] ||
    errors[key.charAt(0).toUpperCase() + key.slice(1)] ||
    errors[key.toLowerCase()];
  const input = (
    key: keyof Draft,
    label: string,
    options: {
      required?: boolean;
      max?: number;
      type?: string;
      full?: boolean;
      area?: boolean;
    } = {},
  ) => (
    <label className={`field ${options.full ? "full" : ""}`} key={key}>
      {label}
      {options.area ? (
        <textarea
          value={String(draft[key])}
          onChange={(e) => set(key, e.target.value)}
          required={options.required}
          maxLength={options.max}
        />
      ) : (
        <input
          type={options.type || "text"}
          value={String(draft[key])}
          onChange={(e) => set(key, e.target.value)}
          required={options.required}
          maxLength={options.max}
        />
      )}
      <span className="field-error">{fieldError(key)?.join(" ")}</span>
    </label>
  );
  const select = (
    key: keyof Draft,
    label: string,
    options: { value: string; label: string }[],
    placeholder?: string,
  ) => (
    <label className="field" key={key}>
      {label}
      <select
        aria-label={label}
        required
        value={String(draft[key])}
        onChange={(e) => set(key, e.target.value)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="field-error">{fieldError(key)?.join(" ")}</span>
    </label>
  );
  const enums = (values: string[]) =>
    values.map((label, value) => ({ label, value: String(value) }));
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const validation: Record<string, string[]> = {};
    const key =
      kind === "tasks"
        ? "title"
        : kind === "tags"
          ? "tagName"
          : kind === "projects"
            ? "projectName"
            : "departmentName";
    if (!draft[key].trim()) validation[key] = ["This field is required."];
    if (kind === "departments" && !draft.departmentDescription.trim())
      validation.departmentDescription = ["Description is required."];
    if (kind === "projects" && draft.endDate && draft.endDate < draft.startDate)
      validation.endDate = ["End date must not be before start date."];
    if (kind === "tags" && draft.color && !/^#[0-9a-f]{6}$/i.test(draft.color))
      validation.color = ["Use a color such as #3B82F6."];
    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }
    const payload =
      kind === "departments"
        ? {
            departmentName: draft.departmentName.trim(),
            departmentDescription: draft.departmentDescription.trim(),
          }
        : kind === "projects"
          ? {
              projectName: draft.projectName.trim(),
              description: draft.description || null,
              startDate: draft.startDate,
              endDate: draft.endDate || null,
              status: Number(draft.status),
              departmentId: Number(draft.departmentId),
            }
          : kind === "tasks"
            ? {
                title: draft.title.trim(),
                description: draft.description || null,
                status: Number(draft.status),
                priority: Number(draft.priority),
                dueDate: draft.dueDate || null,
                projectId: Number(draft.projectId),
                tagIDs: draft.tagIDs,
              }
            : { tagName: draft.tagName.trim(), color: draft.color || null };
    setBusy(true);
    try {
      await api(`/${kind}${editing ? `/${idOf(kind, editing)}` : ""}`, {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      toast.success(`${singular[kind]} ${editing ? "updated" : "created"}.`);
      setOpen(false);
      resource.reload();
      if (kind === "tags") tags.reload();
      if (kind === "projects") projects.reload();
      if (kind === "departments") departments.reload();
    } catch (e) {
      if (e instanceof ApiError) setErrors(e.errors);
      toast.error(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!deleting) return;
    setBusy(true);
    try {
      await api(`/${kind}/${idOf(kind, deleting)}`, { method: "DELETE" });
      toast.success(
        kind === "tasks"
          ? "Task moved to trash."
          : `${singular[kind]} deleted.`,
      );
      setDeleting(null);
      resource.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete.");
    } finally {
      setBusy(false);
    }
  }
  async function restore(item: Entity) {
    setBusy(true);
    try {
      await api(`/tasks/${idOf(kind, item)}/restore`, { method: "POST" });
      toast.success("Task restored.");
      resource.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not restore.");
    } finally {
      setBusy(false);
    }
  }
  const filtered = (resource.data || []).filter((item) =>
    nameOf(kind, item).toLowerCase().includes(query.toLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * 10, current * 10);
  const lookupError =
    kind === "projects"
      ? departments.error
      : kind === "tasks"
        ? projects.error || tags.error
        : "";
  const lookupLoading =
    kind === "projects"
      ? !departments.data
      : kind === "tasks"
        ? !projects.data || !tags.data
        : false;
  return (
    <>
      <PageHeading
        eyebrow="KEEP WORK MOVING"
        title={`${kind.charAt(0).toUpperCase() + kind.slice(1)} management`}
        description={`Create, organize, and maintain your ${kind}.`}
        action={
          <button className="button" onClick={() => begin(null)}>
            <Plus size={16} />
            Create {singular[kind]}
          </button>
        }
      />
      <div className="toolbar">
        <Search size={17} color="#87939d" />
        <input
          aria-label={`Search ${kind}`}
          placeholder={`Search ${kind} by name…`}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
        {kind === "tasks" && (
          <button
            className={`button ${trash ? "" : "secondary"}`}
            onClick={() => {
              setTrash(!trash);
              setPage(1);
            }}
          >
            <Trash2 size={14} />
            {trash ? "Show active tasks" : "View trash"}
          </button>
        )}
      </div>
      {trash && (
        <div className="notice">
          Tasks in trash remain in the database. Restore a task to return it to
          active lists.
        </div>
      )}
      {resource.error ? (
        <ErrorState message={resource.error} retry={resource.reload} />
      ) : resource.loading ? (
        <Loading />
      ) : (
        <div className="panel">
          {!rows.length ? (
            <Empty
              title={
                query
                  ? "No matching results"
                  : trash
                    ? "Trash is empty"
                    : `No ${kind} yet`
              }
            />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    {kind === "departments" ? (
                      <>
                        <th>Projects</th>
                        <th>Description</th>
                      </>
                    ) : kind === "projects" ? (
                      <>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Timeline</th>
                      </>
                    ) : kind === "tasks" ? (
                      <>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Due date</th>
                      </>
                    ) : (
                      <th>Color</th>
                    )}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item) => (
                    <tr key={idOf(kind, item)}>
                      <td className="title-cell">
                        {kind !== "tags" && !trash ? (
                          <Link href={`/${kind}/${idOf(kind, item)}`}>
                            {nameOf(kind, item)}
                          </Link>
                        ) : (
                          nameOf(kind, item)
                        )}
                        {"projectName" in item && "title" in item && (
                          <div className="table-subtitle">
                            {item.projectName}
                          </div>
                        )}
                      </td>
                      {"departmentDescription" in item ? (
                        <>
                          <td>{item.projectCount}</td>
                          <td style={{ maxWidth: 360, whiteSpace: "normal" }}>
                            {item.departmentDescription}
                          </td>
                        </>
                      ) : "taskCount" in item ? (
                        <>
                          <td>{item.departmentName}</td>
                          <td>
                            <Badge type="project" value={item.status} />
                          </td>
                          <td>
                            {dateLabel(item.startDate)} —{" "}
                            {dateLabel(item.endDate)}
                          </td>
                        </>
                      ) : "title" in item ? (
                        <>
                          <td>
                            <Badge value={item.status} />
                          </td>
                          <td>
                            <Badge type="priority" value={item.priority} />
                          </td>
                          <td>{dateLabel(item.dueDate)}</td>
                        </>
                      ) : (
                        <td>
                          <TagChip tag={item as Tag} />
                        </td>
                      )}
                      <td>
                        <div className="actions">
                          {trash ? (
                            <button
                              className="button secondary"
                              disabled={busy}
                              onClick={() => restore(item)}
                            >
                              <RotateCcw size={14} />
                              Restore
                            </button>
                          ) : (
                            <>
                              <button
                                className="icon-button"
                                aria-label={`Edit ${nameOf(kind, item)}`}
                                onClick={() => begin(item)}
                              >
                                <Pencil size={15} />
                              </button>
                              {kind === "tasks" && (
                                <button
                                  className="icon-button"
                                  aria-label={`Duplicate ${nameOf(kind, item)}`}
                                  onClick={() => duplicate(item as Task)}
                                >
                                  <Copy size={15} />
                                </button>
                              )}
                              <button
                                className="icon-button"
                                aria-label={`Delete ${nameOf(kind, item)}`}
                                onClick={() => setDeleting(item)}
                              >
                                <Trash2 size={15} />
                              </button>
                              {kind !== "tags" && (
                                <Link
                                  className="icon-button"
                                  aria-label={`View ${nameOf(kind, item)}`}
                                  href={`/${kind}/${idOf(kind, item)}`}
                                >
                                  <ExternalLink size={15} />
                                </Link>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="pagination">
            <span>
              {filtered.length} {kind} · Page {current} of {pages}
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
      <Modal
        open={open}
        onOpenChange={(v) => {
          if (!busy) setOpen(v);
        }}
        title={`${editing ? "Edit" : "Create"} ${singular[kind]}`}
        description="Keep the details clear so your team can move forward."
      >
        {lookupError ? (
          <ErrorState
            message={lookupError}
            retry={() => {
              departments.reload();
              projects.reload();
              tags.reload();
            }}
          />
        ) : lookupLoading ? (
          <Loading />
        ) : (
          <form onSubmit={save}>
            <div className="form-grid">
              {kind === "departments" && (
                <>
                  {input("departmentName", "Department name *", {
                    required: true,
                    max: 100,
                    full: true,
                  })}
                  {input("departmentDescription", "Description *", {
                    required: true,
                    max: 300,
                    full: true,
                    area: true,
                  })}
                </>
              )}
              {kind === "projects" && (
                <>
                  {input("projectName", "Project name *", {
                    required: true,
                    max: 200,
                    full: true,
                  })}
                  {input("description", "Description", {
                    full: true,
                    area: true,
                  })}
                  {select(
                    "departmentId",
                    "Department *",
                    (departments.data || []).map((d) => ({
                      value: String(d.departmentId),
                      label: d.departmentName,
                    })),
                    "Choose a department",
                  )}
                  {select("status", "Status", enums(projectStatuses))}
                  {input("startDate", "Start date *", {
                    type: "date",
                    required: true,
                  })}
                  {input("endDate", "End date", { type: "date" })}
                </>
              )}
              {kind === "tasks" && (
                <>
                  {input("title", "Title *", {
                    required: true,
                    max: 300,
                    full: true,
                  })}
                  {input("description", "Description", {
                    full: true,
                    area: true,
                  })}
                  {select(
                    "projectId",
                    "Project *",
                    (projects.data || []).map((p) => ({
                      value: String(p.projectId),
                      label: p.projectName,
                    })),
                    "Choose a project",
                  )}
                  {input("dueDate", "Due date", { type: "date" })}
                  {select("status", "Status", enums(taskStatuses))}
                  {select("priority", "Priority", enums(priorities))}
                  <fieldset className="field full">
                    <legend>Tags</legend>
                    <div className="checkbox-list">
                      {tags.data?.map((tag) => (
                        <label key={tag.tagId}>
                          <input
                            type="checkbox"
                            checked={draft.tagIDs.includes(tag.tagId)}
                            onChange={(e) =>
                              set(
                                "tagIDs",
                                e.target.checked
                                  ? [...draft.tagIDs, tag.tagId]
                                  : draft.tagIDs.filter(
                                      (id) => id !== tag.tagId,
                                    ),
                              )
                            }
                          />
                          {tag.tagName}
                        </label>
                      ))}
                    </div>
                    <span className="field-error">
                      {(fieldError("tagIDs") || fieldError("tagIds"))?.join(
                        " ",
                      )}
                    </span>
                  </fieldset>
                </>
              )}
              {kind === "tags" && (
                <>
                  {input("tagName", "Tag name *", {
                    required: true,
                    max: 50,
                    full: true,
                  })}
                  {input("color", "Hex color", { max: 7, full: true })}
                </>
              )}
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="button secondary"
                onClick={() => setOpen(false)}
                disabled={busy}
              >
                Cancel
              </button>
              <button className="button" type="submit" disabled={busy}>
                {busy && <LoaderCircle size={14} className="spin" />}
                {editing ? "Save changes" : `Create ${singular[kind]}`}
              </button>
            </div>
          </form>
        )}
      </Modal>
      <Modal
        open={!!deleting}
        onOpenChange={(v) => {
          if (!busy && !v) setDeleting(null);
        }}
        title={`Delete ${singular[kind]}?`}
        description={
          kind === "tasks"
            ? "This task will move to trash and can be restored."
            : "This action cannot be undone. Items with linked records cannot be deleted."
        }
      >
        <p style={{ marginTop: 20, fontWeight: 600 }}>
          {deleting && nameOf(kind, deleting)}
        </p>
        <div className="form-actions">
          <button
            className="button secondary"
            disabled={busy}
            onClick={() => setDeleting(null)}
          >
            Cancel
          </button>
          <button className="button danger" disabled={busy} onClick={remove}>
            {busy ? "Deleting…" : "Confirm delete"}
          </button>
        </div>
      </Modal>
    </>
  );
}

"use client";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useResource } from "@/lib/use-resource";
import { Modal } from "./ui";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "./primitives/dropdown-menu";
export type WorkspacePreferences = {
  name: string;
  description: string;
  icon: string;
  dark: boolean;
  collapsed: boolean;
};
export const defaultWorkspace: WorkspacePreferences = {
  name: "Team workspace",
  description: "Projects, priorities & teams.",
  icon: "TT",
  dark: false,
  collapsed: false,
};
function WorkspaceCounts() {
  const departments = useResource<unknown[]>("/departments");
  const projects = useResource<unknown[]>("/projects");
  const tasks = useResource<unknown[]>("/tasks");
  const error = departments.error || projects.error || tasks.error;
  if (error)
    return (
      <div className="workspace-summary">
        <p role="alert">Workspace counts unavailable.</p>
        <button
          className="button secondary"
          onClick={() => {
            departments.reload();
            projects.reload();
            tasks.reload();
          }}
        >
          Retry
        </button>
      </div>
    );
  return (
    <div className="workspace-counts" aria-label="Workspace statistics">
      {[
        ["Departments", departments],
        ["Projects", projects],
        ["Tasks", tasks],
      ].map(([label, resource]) => {
        const value = resource as typeof departments;
        return (
          <div key={label as string}>
            <strong>{value.loading ? "…" : (value.data?.length ?? "—")}</strong>
            <small>{label as string}</small>
          </div>
        );
      })}
    </div>
  );
}
export function WorkspaceMenu({
  value,
  update,
}: {
  value: WorkspacePreferences;
  update: (value: WorkspacePreferences) => void;
}) {
  const [settings, setSettings] = useState(false);
  const [draft, setDraft] = useState(value);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="workspace-profile" aria-label="Manage workspace">
            <span className="avatar">{value.icon}</span>
            <span>
              <strong>{value.name}</strong>
              <small>Public workspace</small>
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="atlas-menu workspace-menu"
          collisionPadding={12}
        >
          <DropdownMenuLabel>
            {value.icon} {value.name}
          </DropdownMenuLabel>
          <p className="workspace-summary">{value.description}</p>
          <WorkspaceCounts />
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Quick access</DropdownMenuLabel>
          {[
            ["/departments", "Departments"],
            ["/projects", "Projects"],
            ["/calendar", "Calendar"],
            ["/reports", "Reports"],
          ].map(([href, label]) => (
            <DropdownMenuItem asChild key={href}>
              <Link href={href}>{label}</Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={value.dark}
            onCheckedChange={(dark) => update({ ...value, dark })}
          >
            Dark mode
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={value.collapsed}
            onCheckedChange={(collapsed) => update({ ...value, collapsed })}
          >
            Collapse sidebar
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              setDraft(value);
              setSettings(true);
            }}
          >
            Workspace settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Modal
        open={settings}
        onOpenChange={setSettings}
        title="Workspace settings"
        description="Personalize this workspace on this browser. These preferences do not change shared workspace data."
      >
        <form
          className="workspace-settings"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.name.trim()) return;
            update({
              ...value,
              name: draft.name.trim(),
              description: draft.description.trim(),
              icon: draft.icon,
            });
            setSettings(false);
            toast.success("Workspace preferences saved");
          }}
        >
          <label>
            Workspace name
            <input
              required
              maxLength={48}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </label>
          <label>
            Description
            <textarea
              maxLength={160}
              rows={3}
              value={draft.description}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
            />
          </label>
          <label>
            Workspace icon
            <select
              value={draft.icon}
              onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
            >
              {["TT", "🚀", "🌿", "⭐", "🎯", "💼"].map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
          </label>
          <div className="workspace-actions">
            <button
              type="button"
              className="button secondary"
              onClick={() => setSettings(false)}
            >
              Cancel
            </button>
            <button className="button" type="submit">
              Save preferences
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

"use client";
import { AlertCircle, Inbox, RefreshCw, X } from "lucide-react";
import { Skeleton } from "@/components/primitives/skeleton";
import * as Dialog from "@radix-ui/react-dialog";
import { priorities, projectStatuses, taskStatuses, Tag } from "@/lib/types";

// ─── Status / Priority Badge ───────────────────────────────────────────────
export function Badge({
  value,
  type = "task",
}: {
  value: number;
  type?: "task" | "project" | "priority";
}) {
  const labels =
    type === "priority"
      ? priorities
      : type === "project"
        ? projectStatuses
        : taskStatuses;
  return (
    <span className={`badge ${type}-${value}`}>
      <span aria-hidden="true" />
      {labels[value] ?? "Unknown"}
    </span>
  );
}

// ─── Tag chip ─────────────────────────────────────────────────────────────
export function TagChip({ tag }: { tag: Tag }) {
  const hex = /^#[0-9a-f]{6}$/i.test(tag.color || "") ? tag.color! : "#64748b";
  return (
    <span className="tag-chip">
      <i style={{ backgroundColor: hex }} aria-hidden="true" />
      {tag.tagName}
    </span>
  );
}

// ─── Loading skeleton ──────────────────────────────────────────────────────
export function Loading({
  variant = "table",
}: {
  variant?: "table" | "cards" | "dashboard";
}) {
  return (
    <div
      role="status"
      aria-label="Loading workspace"
      className={`loading-skeleton skeleton-${variant}`}
    >
      <span className="sr-only">Loading your workspace…</span>

      {variant === "dashboard" && (
        <>
          {/* Stats row skeleton */}
          <div className="stats-grid" style={{ marginBottom: 20 }}>
            {Array.from({ length: 4 }, (_, i) => (
              <div className="stat-card" key={i}>
                <div className="stat-top">
                  <Skeleton className="skeleton-line" style={{ width: "60%" }} />
                </div>
                <Skeleton className="skeleton-number" />
                <Skeleton className="skeleton-line short" />
              </div>
            ))}
          </div>
          {/* Overview grid skeleton */}
          <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 16 }}>
            <div className="panel skeleton-panel" style={{ minHeight: 240 }}>
              {Array.from({ length: 4 }, (_, i) => (
                <div className="skeleton-row" key={i}>
                  <Skeleton className="skeleton-line" />
                  <Skeleton className="skeleton-line short" />
                  <Skeleton className="skeleton-line short" />
                </div>
              ))}
            </div>
            <div className="panel skeleton-panel" style={{ minHeight: 240 }}>
              {Array.from({ length: 3 }, (_, i) => (
                <div className="skeleton-row" key={i} style={{ gridTemplateColumns: "1fr 2fr" }}>
                  <Skeleton className="skeleton-line short" />
                  <Skeleton className="skeleton-line" />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {variant !== "dashboard" && (
        <div className={variant === "cards" ? "project-grid" : "panel skeleton-panel"}>
          {Array.from({ length: variant === "cards" ? 6 : 5 }, (_, i) => (
            <div
              className={
                variant === "cards" ? "project-card skeleton-card" : "skeleton-row"
              }
              key={i}
            >
              <Skeleton className="skeleton-line" />
              <Skeleton className="skeleton-line short" />
              <Skeleton className="skeleton-line short" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Error state ───────────────────────────────────────────────────────────
export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div role="alert" className="state error-state">
      <AlertCircle size={28} />
      <h3>Something needs attention</h3>
      <p>{message}</p>
      {retry && (
        <button className="button secondary" onClick={retry}>
          <RefreshCw size={15} />
          Try again
        </button>
      )}
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────
export function Empty({
  title = "Nothing here yet",
  description = "Create your first item to get started.",
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="state">
      <Inbox size={28} strokeWidth={1.5} />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

// ─── Page heading ──────────────────────────────────────────────────────────
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal">
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description className="muted">
            {description}
          </Dialog.Description>
          <Dialog.Close
            className="modal-close icon-button"
            aria-label="Close dialog"
          >
            <X size={18} />
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

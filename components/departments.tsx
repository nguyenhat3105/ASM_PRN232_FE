"use client";
import Link from "next/link";
import { useState } from "react";
import { Building2, ArrowUpRight, Plus, Search } from "lucide-react";
import { useResource } from "@/lib/use-resource";
import { Department } from "@/lib/types";
import { PageHeading, Loading, ErrorState, Empty } from "./ui";

export function Departments() {
  const r = useResource<Department[]>("/departments");
  const [query, setQuery] = useState("");
  const filtered = r.data?.filter((d) =>
    d.departmentName.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      <PageHeading
        eyebrow="WORKSPACE"
        title="Departments"
        description="Find your teams and see what they are building."
        action={
          <Link href="/departments/manage?create=1" className="button">
            <Plus size={14} />
            New department
          </Link>
        }
      />

      {/* Search toolbar */}
      <div className="toolbar">
        <Search size={15} strokeWidth={1.8} style={{ color: "#9aabbb" }} />
        <input
          aria-label="Search departments"
          placeholder="Search departments…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Link href="/departments/manage" className="button secondary">
          Manage
        </Link>
      </div>

      {r.error ? (
        <ErrorState message={r.error} retry={r.reload} />
      ) : !r.data ? (
        <Loading variant="cards" />
      ) : !filtered?.length ? (
        <Empty
          title={query ? "No departments found" : "No departments yet"}
          description={
            query
              ? "Try a different name or clear the search."
              : "Create your first department to get started."
          }
          action={
            !query ? (
              <Link href="/departments/manage?create=1" className="button">
                <Plus size={14} />
                Create department
              </Link>
            ) : undefined
          }
        />
      ) : (
        /* Department list panel */
        <div className="panel">
          {filtered.map((d, idx) => (
            <Link
              href={`/departments/${d.departmentId}`}
              key={d.departmentId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 20px",
                borderBottom:
                  idx < filtered.length - 1 ? "1px solid #edf0f5" : "none",
                transition: "background 160ms",
              }}
              className="dept-list-row"
            >
              {/* Icon */}
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 38,
                  height: 38,
                  borderRadius: 9,
                  background: "#edf2ff",
                  color: "#355ae2",
                  flexShrink: 0,
                }}
              >
                <Building2 size={18} strokeWidth={1.6} />
              </span>

              {/* Name + description */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    marginBottom: 3,
                    color: "#121313",
                  }}
                >
                  {d.departmentName}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#6a7589",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {d.departmentDescription || "No description"}
                </div>
              </div>

              {/* Project count */}
              <span
                style={{
                  fontSize: 12,
                  color: "#6e7e95",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {d.projectCount}{" "}
                {d.projectCount === 1 ? "project" : "projects"}
              </span>

              {/* Status badge */}
              <span
                className="badge task-2"
                style={{ flexShrink: 0 }}
                aria-label="Active"
              >
                <span aria-hidden="true" />
                Active
              </span>

              {/* Arrow */}
              <ArrowUpRight
                size={16}
                strokeWidth={1.8}
                style={{ color: "#9aabbb", flexShrink: 0 }}
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .dept-list-row:hover {
          background: #fafcff;
        }
      `}</style>
    </>
  );
}

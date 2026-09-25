export type Tag = { tagId: number; tagName: string; color: string | null };
export type Department = {
  departmentId: number;
  departmentName: string;
  departmentDescription: string;
  isActive: boolean;
  projectCount: number;
  projects?: Project[];
};
export type Project = {
  projectId: number;
  projectName: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  status: number;
  departmentId: number;
  departmentName: string;
  isActive: boolean;
  createdDate: string;
  taskCount: number;
  completedTaskCount: number;
  tasks?: Task[];
};
export type Task = {
  taskId: number;
  title: string;
  description: string | null;
  status: number;
  priority: number;
  dueDate: string | null;
  projectId: number;
  projectName: string;
  isActive: boolean;
  createdDate: string;
  modifiedDate: string | null;
  tags: Tag[];
};
export type Kind = "departments" | "projects" | "tasks" | "tags";
export type Entity = Department | Project | Task | Tag;
export const taskStatuses = ["To Do", "In Progress", "Done", "Cancelled"];
export const projectStatuses = [
  "Not Started",
  "In Progress",
  "Completed",
  "On Hold",
];
export const priorities = ["Low", "Medium", "High", "Critical"];
export function today() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: process.env.NEXT_PUBLIC_BUSINESS_TIME_ZONE || "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function overdue(t: Task) {
  return t.isActive && t.status < 2 && !!t.dueDate && t.dueDate < today();
}
export function dateLabel(value?: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value.slice(0, 10) + "T12:00:00"));
}

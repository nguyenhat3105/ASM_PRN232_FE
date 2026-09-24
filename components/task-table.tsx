'use client';
import Link from 'next/link';
import { Task, dateLabel, overdue } from '@/lib/types';
import { Badge, TagChip, Empty } from './ui';
export function TaskTable({tasks}:{tasks:Task[]}) { if (!tasks.length) return <Empty title="No tasks to show" description="Tasks matching this view will appear here."/>; return <div className="table-wrap"><table><thead><tr><th>Task name</th><th>Status</th><th>Priority</th><th>Tags</th><th>Due date</th></tr></thead><tbody>{tasks.map(t=><tr key={t.taskId}><td className="title-cell"><Link href={`/tasks/${t.taskId}`}>{t.title}</Link><div className="table-subtitle">{t.projectName}</div></td><td><Badge value={t.status}/></td><td><Badge type="priority" value={t.priority}/></td><td><div className="tag-list">{t.tags.map(tag=><TagChip key={tag.tagId} tag={tag}/>)}</div></td><td className={overdue(t)?'overdue':''}>{dateLabel(t.dueDate)}</td></tr>)}</tbody></table></div>; }

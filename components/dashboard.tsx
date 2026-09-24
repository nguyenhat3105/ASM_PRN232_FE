'use client';
import Link from 'next/link';
import { Plus, ArrowRight, Building2, FolderKanban, CheckCheck, Clock3 } from 'lucide-react';
import { useResource } from '@/lib/use-resource';
import { Department, Project, Task, overdue } from '@/lib/types';
import { PageHeading, Loading, ErrorState, Empty } from './ui';
import { ProjectCard } from './project-card';
import { TaskTable } from './task-table';
export function Dashboard() {
  const departments=useResource<Department[]>('/departments'), projects=useResource<Project[]>('/projects'), tasks=useResource<Task[]>('/tasks');
  const error=departments.error||projects.error||tasks.error;
  if(error)return <ErrorState message={error} retry={()=>{departments.reload();projects.reload();tasks.reload();}}/>;
  if(!departments.data||!projects.data||!tasks.data)return <Loading/>;
  const all=tasks.data; const done=all.filter(t=>t.status===2).length; const late=all.filter(overdue);
  const stats=[{name:'Departments',value:departments.data.length,Icon:Building2,note:'Teams making things happen'},{name:'Active projects',value:projects.data.length,Icon:FolderKanban,note:`${projects.data.filter(p=>p.status===1).length} currently in progress`},{name:'Tasks completed',value:done,Icon:CheckCheck,note:`Out of ${all.length} active tasks`},{name:'Overdue tasks',value:late.length,Icon:Clock3,note:'A little attention needed'}];
  return <><PageHeading eyebrow="YOUR WORK, AT A GLANCE" title="Room for great work." description="A clear view of your projects, priorities, and what comes next." action={<Link href="/tasks/manage?create=1" className="button"><Plus size={16}/>Create task</Link>}/><div className="stats-grid">{stats.map(s=><div key={s.name} className="stat-card"><div className="stat-top"><span>{s.name}</span><span className="stat-icon"><s.Icon size={16}/></span></div><div className="stat-value">{s.value.toString().padStart(2,'0')}</div><div className="stat-bottom">{s.note}</div></div>)}</div>
  <div className="section-heading"><h2>Projects in motion <span className="count-label">{projects.data.length} projects</span></h2><Link href="/projects/manage">View all projects <ArrowRight size={14}/></Link></div>{projects.data.length?<div className="project-grid">{projects.data.slice(0,6).map(p=><ProjectCard key={p.projectId} project={p}/>)}</div>:<div className="panel"><Empty title="Your next project starts here"/></div>}
  <div className="section-heading"><h2>Needs your attention</h2><Link href="/search?overdue=true">Explore tasks <ArrowRight size={14}/></Link></div><div className="panel"><TaskTable tasks={[...late].sort((a,b)=>b.priority-a.priority || (a.dueDate||'').localeCompare(b.dueDate||'')).slice(0,5)}/></div></>;
}

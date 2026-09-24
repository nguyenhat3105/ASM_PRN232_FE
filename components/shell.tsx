'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, Building2, FolderKanban, ListTodo, Tags, Search, Columns3, CalendarDays, Menu, X, ArrowUpRight, Layers } from 'lucide-react';
const sections = [
  { title: 'WORKSPACE', links: [['/', 'Overview', LayoutDashboard], ['/departments', 'Departments', Building2], ['/search', 'All tasks', Search], ['/board', 'Board', Columns3], ['/calendar', 'Calendar', CalendarDays]] },
  { title: 'MANAGE', links: [['/projects/manage', 'Projects', FolderKanban], ['/tasks/manage', 'Tasks', ListTodo], ['/departments/manage', 'Departments', Building2], ['/tags/manage', 'Tags', Tags]] }
] as const;
export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); const [open,setOpen] = useState(false);
  return <div className="app-shell"><button className="mobile-menu icon-button" aria-label="Open navigation" onClick={()=>setOpen(true)}><Menu/></button>{open && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={()=>setOpen(false)}/>}
    <aside className={`sidebar ${open?'open':''}`}><Link href="/" className="brand"><span className="brand-icon"><Layers size={22}/></span>tasktrack<span className="brand-dot">.</span></Link><button className="mobile-close icon-button" aria-label="Close navigation" onClick={()=>setOpen(false)}><X/></button>
    <div className="workspace-label"><span className="workspace-avatar">T</span><div><strong>Team workspace</strong><small>Make good work happen</small></div><span className="online-dot"/></div>
    {sections.map(s=><nav key={s.title} aria-label={s.title}><p className="nav-heading">{s.title}</p>{s.links.map(([href,label,Icon])=><Link key={href} href={href} onClick={()=>setOpen(false)} className={`nav-link ${pathname===href?'active':''}`}><Icon size={18}/>{label}{pathname===href&&<span className="active-dot"/>}</Link>)}</nav>)}
    <div className="sidebar-footer"><div className="tiny-label">A LITTLE FOCUS GOES A LONG WAY</div><p>One task at a time.<br/>One step forward.</p><Link href="/tasks/manage">Create something <ArrowUpRight size={15}/></Link></div></aside>
    <div className="main-shell"><header className="topbar"><span>Workspace <span className="breadcrumb-divider">/</span> <strong>{pathname==='/'?'Overview':pathname.split('/')[1]?.replace(/^./, c=>c.toUpperCase())}</strong></span><div className="topbar-right"><span className="public-pill"><span className="online-dot"/> Public workspace</span><span className="avatar">TT</span></div></header><main>{children}</main><footer className="page-footer">TaskTrack <span>Built for a clearer workday.</span></footer></div>
  </div>;
}

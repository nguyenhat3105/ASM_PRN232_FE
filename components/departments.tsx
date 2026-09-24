'use client';
import Link from 'next/link';
import { Building2, ArrowUpRight, Settings2 } from 'lucide-react';
import { useResource } from '@/lib/use-resource';
import { Department } from '@/lib/types';
import { PageHeading, Loading, ErrorState, Empty } from './ui';
export function Departments(){ const r=useResource<Department[]>('/departments'); return <><PageHeading eyebrow="BETTER TOGETHER" title="Our departments" description="Find your team and see what they are building." action={<Link href="/departments/manage" className="button secondary"><Settings2 size={16}/>Manage departments</Link>}/>{r.error?<ErrorState message={r.error} retry={r.reload}/>:!r.data?<Loading/>:!r.data.length?<Empty/>:<div className="department-grid">{r.data.map(d=><Link href={`/departments/${d.departmentId}`} key={d.departmentId} className="department-card"><span className="project-symbol"><Building2 size={20}/></span><h2>{d.departmentName}</h2><p>{d.departmentDescription}</p><div className="card-footer"><span>{d.projectCount} active projects</span><ArrowUpRight size={16}/></div></Link>)}</div>}</>;}

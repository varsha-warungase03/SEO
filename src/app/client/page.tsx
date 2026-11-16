import {listAudits} from '@/lib/db';
export const dynamic='force-dynamic';
export default async function Client(){
 let audits:any[]=[];let error='';
 try{audits=await listAudits()}catch(e:any){error=e.message}
 return <main className="max-w-5xl mx-auto p-8"><a href="/" className="text-blue-700">← Home</a><h1 className="text-3xl font-bold mt-4">Client dashboard</h1>
 <p className="text-slate-600 mt-2">Demo client view of recent SEO audits.</p>{error&&<p className="card mt-5 text-red-700">Database not connected: {error}</p>}
 <div className="grid gap-4 mt-6">{audits.map(a=><article className="card" key={a.id}><div className="flex justify-between gap-4"><div><h2 className="font-bold">{a.url}</h2><p className="text-sm text-slate-500 mt-1">{a.status} · {a.progress}% complete</p></div>{a.report_path&&<a className="text-blue-700" href={`/api/reports/${a.id}`}>Download PDF</a>}</div>
 {a.result&&<><div className="text-3xl font-bold mt-4">{a.result.overall_score}/100</div><p className="mt-2 text-sm">{a.result.executive_summary}</p><h3 className="font-bold mt-4">Recommendations</h3><ul className="list-disc pl-5 text-sm mt-2">{(a.result.recommendations||[]).slice(0,5).map((r:any,i:number)=><li key={i} className="mt-1"><b>{r.priority}:</b> {r.finding} — {r.fix}</li>)}</ul></>}
 </article>)}</div></main>
}
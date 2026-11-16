'use client';
import {useState} from 'react';
export default function Admin(){
 const [form,setForm]=useState({url:'https://example-dental-clinic.com',businessType:'Dental clinic',city:'Pune',state:'Maharashtra',clientName:'Demo Dental Clinic'});
 const [busy,setBusy]=useState(false); const [msg,setMsg]=useState('');
 const [audits,setAudits]=useState<any[]>([]);
 async function submit(e:any){e.preventDefault();setBusy(true);setMsg('Queueing audit…');
  try{const r=await fetch('/api/audits',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(form)});
   const j=await r.json();if(!r.ok)throw new Error(j.error||'Could not queue audit');setMsg(`Audit queued. ID: ${j.auditId}`);load();
  }catch(e:any){setMsg(e.message)}finally{setBusy(false)}}
 async function load(){try{const r=await fetch('/api/audits');const j=await r.json();setAudits(j.audits||[])}catch{}}
 return <main className="max-w-5xl mx-auto p-8"><a href="/" className="text-blue-700">← Home</a><h1 className="text-3xl font-bold mt-4">Admin portal</h1>
 <form onSubmit={submit} className="card grid md:grid-cols-2 gap-4 mt-6">
 {Object.entries(form).map(([k,v])=><label className="text-sm font-semibold capitalize" key={k}>{k}<input className="input mt-2 font-normal" value={v} onChange={e=>setForm({...form,[k]:e.target.value})} required /></label>)}
 <div className="md:col-span-2"><button className="btn" disabled={busy}>{busy?'Starting…':'Start SEO audit'}</button><button type="button" className="ml-3 border rounded-lg px-4 py-2" onClick={load}>Refresh audits</button></div>
 {msg&&<p className="md:col-span-2 text-sm">{msg}</p>}</form>
 <section className="mt-8"><h2 className="text-xl font-bold">Recent audits</h2><div className="card mt-3 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left"><th className="p-2">ID</th><th>URL</th><th>Status</th><th>Progress</th><th>Report</th></tr></thead><tbody>{audits.map(a=><tr key={a.id} className="border-t"><td className="p-2">{a.id}</td><td>{a.url}</td><td>{a.status}</td><td>{a.progress}%</td><td>{a.report_path?<a className="text-blue-700" href={`/api/reports/${a.id}`}>Download</a>:'—'}</td></tr>)}</tbody></table></div></section>
 </main>
}
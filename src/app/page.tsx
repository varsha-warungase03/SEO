import Link from 'next/link';
export default function Home(){return <main className="max-w-5xl mx-auto p-8">
 <div className="text-sm font-bold tracking-widest text-blue-700">EDGELINK · SEO AUTOMATION</div>
 <h1 className="text-4xl font-bold mt-4">SEO Audit Workspace</h1>
 <p className="text-slate-600 mt-3">Run website audits, inspect AI recommendations and download client reports.</p>
 <div className="grid md:grid-cols-2 gap-5 mt-9">
  <Link className="card hover:border-blue-400" href="/admin"><h2 className="text-xl font-bold">Admin portal →</h2><p className="text-slate-600 mt-2">Create clients, start audits and track processing.</p></Link>
  <Link className="card hover:border-blue-400" href="/client"><h2 className="text-xl font-bold">Client dashboard →</h2><p className="text-slate-600 mt-2">Review audit scores, issues and PDF reports.</p></Link>
 </div><p className="text-xs text-slate-500 mt-8">Assessment demo. Add authentication and tenant-level authorization before production use.</p>
 </main>}
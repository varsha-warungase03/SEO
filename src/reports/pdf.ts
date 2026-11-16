import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

const esc = (s:any) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export async function generatePdf(auditId:string, data:any) {
  const dir = path.join(process.cwd(),'reports'); await fs.mkdir(dir,{recursive:true});
  const file = path.join(dir,`${auditId}.pdf`);
  const recs = (data.recommendations || []).map((r:any)=>`<tr><td>${esc(r.priority)}</td><td>${esc(r.category)}</td><td>${esc(r.finding)}</td><td>${esc(r.fix)}</td><td>${esc(r.estimated_impact)}</td><td>${esc(r.effort)}</td><td>${esc(r.falsifiability_check)}</td></tr>`).join('');
  const scores = Object.entries(data.score_breakdown || {}).map(([k,v])=>`<div class="score"><b>${esc(k.replaceAll('_',' '))}</b><strong>${esc(v)}/100</strong></div>`).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  body{font:12px Arial;color:#172033;margin:34px}h1{font-size:25px}h2{margin-top:28px;color:#263b63}
  .muted{color:#667085}.hero{background:#f1f5fb;padding:20px;border-radius:12px}
  .big{font-size:48px;font-weight:bold;color:#244b88}.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
  .score{background:#f5f7fa;padding:12px;border-radius:8px}.score strong{display:block;font-size:20px;margin-top:8px}
  table{border-collapse:collapse;width:100%;font-size:10px}td,th{border:1px solid #d9e0ea;padding:7px;text-align:left;vertical-align:top}th{background:#edf2f8}
  </style></head><body><h1>SEO Audit Report</h1><p class="muted">${esc(data.url)} · ${new Date().toLocaleString()}</p>
  <div class="hero"><div class="muted">Overall SEO score</div><div class="big">${esc(data.overall_score)}/100</div><p>${esc(data.executive_summary)}</p></div>
  <h2>Score breakdown</h2><div class="grid">${scores}</div>
  <h2>Critical issues</h2><ul>${(data.critical_issues||[]).map((x:any)=>`<li>${esc(typeof x==='string'?x:x.finding||JSON.stringify(x))}</li>`).join('')||'<li>None reported</li>'}</ul>
  <h2>Important issues</h2><ul>${(data.important_issues||[]).map((x:any)=>`<li>${esc(typeof x==='string'?x:x.finding||JSON.stringify(x))}</li>`).join('')||'<li>None reported</li>'}</ul>
  <h2>Recommendations</h2><table><thead><tr><th>Priority</th><th>Category</th><th>Finding</th><th>Fix</th><th>Impact</th><th>Effort</th><th>Verification</th></tr></thead><tbody>${recs}</tbody></table>
  <p class="muted">Assessment note: external integrations may contain mock data when USE_MOCKS=true.</p></body></html>`;
  const browser = await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox']});
  try { const page = await browser.newPage(); await page.setContent(html, { waitUntil: "load" }); await page.pdf({path:file,format:'A4',printBackground:true,landscape:true,margin:{top:'15mm',bottom:'15mm',left:'10mm',right:'10mm'}}); }
  finally { await browser.close(); }
  return file;
}
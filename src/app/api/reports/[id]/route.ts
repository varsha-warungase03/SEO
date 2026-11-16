import {NextResponse} from 'next/server';
import {getAudit} from '@/lib/db';
import fs from 'node:fs/promises';
export const runtime='nodejs';
export async function GET(_:Request,{params}:{params:{id:string}}){
 try{const audit=await getAudit(params.id);if(!audit?.report_path)return NextResponse.json({error:'Report not ready'},{status:404});
 const bytes=await fs.readFile(audit.report_path);return new NextResponse(bytes,{headers:{'content-type':'application/pdf','content-disposition':`attachment; filename="seo-audit-${params.id}.pdf"`}});
 }catch(e:any){return NextResponse.json({error:e.message},{status:500})}
}
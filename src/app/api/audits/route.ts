import { NextRequest, NextResponse } from 'next/server';
import { auditQueue } from '@/lib/queue';
import { auditInput } from '@/lib/validation';
import { db } from '@/lib/db';
import { randomUUID } from 'node:crypto';

export const runtime='nodejs';
export async function POST(req:NextRequest){
 try{
  const body=await req.json();const parsed=auditInput.safeParse(body);
  if(!parsed.success)return NextResponse.json({error:parsed.error.flatten()}, {status:400});
  const input=parsed.data;const id=randomUUID();
  await db().query(`INSERT INTO audits(id,client_id,url,status,progress,metadata) VALUES($1,$2,$3,'queued',0,$4::jsonb)`,
   [id,id,input.url,JSON.stringify(input)]);
  await auditQueue.add('run-audit',{auditId:id,...input},{jobId:id,attempts:2,backoff:{type:'exponential',delay:3000},removeOnComplete:100,removeOnFail:100});
  return NextResponse.json({auditId:id,status:'queued'});
 }catch(e:any){return NextResponse.json({error:e.message},{status:500})}
}
export async function GET(){
 try{const {rows}=await db().query('SELECT id,url,status,progress,result,report_path,created_at FROM audits ORDER BY created_at DESC LIMIT 50');return NextResponse.json({audits:rows})}
 catch(e:any){return NextResponse.json({error:e.message},{status:500})}
}
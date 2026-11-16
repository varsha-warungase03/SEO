import {NextResponse} from 'next/server';
import {getAudit} from '@/lib/db';
export const runtime='nodejs';
export async function GET(_:Request,{params}:{params:{id:string}}){
 try{const audit=await getAudit(params.id);if(!audit)return NextResponse.json({error:'Not found'},{status:404});return NextResponse.json({audit})}
 catch(e:any){return NextResponse.json({error:e.message},{status:500})}
}
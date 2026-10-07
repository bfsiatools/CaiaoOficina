import { parseClickPayload,type ClickPayload } from './schema';
import { isAutomated } from './context';
export interface CollectDependencies {origin:string;enabled:boolean;appEnv:'preview'|'production';allow:(request:Request)=>boolean;record:(event:ClickPayload,quality:'test'|'accepted')=>Promise<string>}
export async function collectRequest(request:Request,deps:CollectDependencies){
 const response=(status:number)=>new Response(null,{status,headers:{'Cache-Control':'no-store'}});
 if(request.method!=='POST')return response(405);
 if(!deps.enabled||isAutomated(request))return response(204);
 if(!deps.origin||request.headers.get('origin')!==deps.origin)return response(403);
 if(!/^application\/json(?:;|$)/i.test(request.headers.get('content-type')??''))return response(415);
 if(!deps.allow(request))return response(429);
 let event:ClickPayload;
 try{
  const reader=request.body?.getReader();if(!reader)return response(400);let length=0;const chunks:Uint8Array[]=[];
  for(;;){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>4096){await reader.cancel();return response(413);}chunks.push(value);}
  const body=new Uint8Array(length);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.byteLength;}
  event=parseClickPayload(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(body)));if(event.placement==='redirect')return response(400);
 }catch{return response(400);}
 try{const result=await deps.record(event,deps.appEnv==='production'?'accepted':'test');return response(result==='invalid_reference'?422:result==='conflict'?409:202);}catch{return response(503);}
}

import 'server-only';
import { createHash,randomBytes } from 'node:crypto';
// Process-local backstop. Configure edge WAF before production; this is not distributed.
const salt=randomBytes(32),windows=new Map<string,{count:number;until:number}>();
export function allowEvent(request:Request,now=Date.now()){
 const raw=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()??'unknown';
 const key=createHash('sha256').update(salt).update(raw.slice(0,128)).digest('hex');
 if(windows.size>=5000){for(const [id,value] of windows)if(value.until<=now)windows.delete(id);if(windows.size>=5000&&!windows.has(key))return false;}
 const current=windows.get(key);if(!current||current.until<=now){windows.set(key,{count:1,until:now+60000});return true;}
 current.count++;return current.count<=60;
}

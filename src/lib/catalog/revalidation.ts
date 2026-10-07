import { timingSafeEqual } from 'node:crypto';
export async function handleRevalidation(request:Request,secret:string|undefined,invalidate:()=>void){
 if(request.method!=='POST')return new Response(null,{status:405,headers:{Allow:'POST'}});
 const supplied=request.headers.get('authorization')?.replace(/^Bearer /,'');
 if(!secret||!supplied||Buffer.byteLength(supplied)!==Buffer.byteLength(secret)||!timingSafeEqual(Buffer.from(supplied),Buffer.from(secret)))return new Response(null,{status:401});
 invalidate();return new Response(null,{status:204});
}

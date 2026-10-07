import './lib/admin-env';
export async function revalidateCatalog(){
 const url=process.env.SITE_URL,secret=process.env.CATALOG_REVALIDATION_SECRET;if(!url||!secret)return false;
 try{return (await fetch(new URL('/api/internal/revalidate',url),{method:'POST',headers:{Authorization:`Bearer ${secret}`},signal:AbortSignal.timeout(3000)})).status===204;}catch{return false;}
}
if(process.argv[1]?.endsWith('revalidate-catalog.ts'))revalidateCatalog().then(ok=>{console.log(ok?'Catálogo invalidado':'Invalidação pendente: aplicação indisponível ou configuração ausente');if(!ok)process.exitCode=1;});

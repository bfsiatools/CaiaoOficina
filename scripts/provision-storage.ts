import { adminClient } from './lib/admin-env';
export async function provisionStorage(){
 const client=adminClient();const {data,error}=await client.storage.getBucket('product-images');
 if(error){if(!/not found/i.test(error.message))throw Error('Falha ao consultar bucket');const created=await client.storage.createBucket('product-images',{public:true,fileSizeLimit:2*1024*1024,allowedMimeTypes:['image/webp']});if(created.error)throw Error('Falha ao criar bucket');}
 else if(!data?.public||data.file_size_limit!==2*1024*1024||data.allowed_mime_types?.join(',')!=='image/webp')throw Error('Bucket existente diverge da configuração aprovada');
 return client;
}
if(process.argv[1]?.endsWith('provision-storage.ts'))provisionStorage().then(()=>console.log('Bucket validado')).catch(()=>{console.error('Falha de configuração/Storage');process.exitCode=1;});

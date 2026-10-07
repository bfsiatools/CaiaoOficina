import sharp from 'sharp';
import { createHash } from 'node:crypto';
export async function prepareImage(input:Buffer,id:string,reported?:{width:number;height:number}) {
  if(input.length>10*1024*1024||! /^[0-9a-f-]{36}$/.test(id))throw Error('Imagem ou identidade inválida');
  const instance=sharp(input,{limitInputPixels:40000000});const metadata=await instance.metadata();
  if(!['png','jpeg','webp'].includes(metadata.format||'')||!metadata.width||!metadata.height)throw Error('Formato de imagem inválido');
  if(reported&&(metadata.width!==reported.width||metadata.height!==reported.height))throw Error('Dimensões divergentes do relatório');
  const {data,info}=await instance.rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toBuffer({resolveWithObject:true});
  if(data.length>2*1024*1024)throw Error('Imagem final acima de 2 MiB');
  return {bytes:data,width:info.width,height:info.height,path:`${id}/${createHash('sha256').update(data).digest('hex')}.webp`};
}
export const prepareReportedImage=(input:Buffer,id:string,reported:{width:number;height:number})=>prepareImage(input,id,reported);

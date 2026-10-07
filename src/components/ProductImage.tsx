'use client';
import Image from 'next/image';
import { useState } from 'react';
import type { ProductImage as ImageData } from '@/lib/catalog/types';
export function ProductImage({image}:{image:ImageData}){const [failed,setFailed]=useState(false);return failed?<span role="img" aria-label={image.alt}>Imagem indisponível</span>:<Image src={image.url} alt={image.alt} width={image.width} height={image.height} quality={85} sizes="(max-width: 640px) 90vw, 300px" style={{maxWidth:300,height:'auto',width:'100%'}} onError={()=>setFailed(true)}/>;}

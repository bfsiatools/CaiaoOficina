'use client';
import type { ReactNode,MouseEvent } from 'react';
import type { ProductCard } from '@/lib/catalog/types';
import { trackClick } from '@/lib/tracking/client';
export function TrackedAnchor({href,product,placement='catalog_card',redirect=false,children}:{href:string;product?:ProductCard;placement?:'catalog_card'|'product_detail'|'whatsapp_cta';redirect?:boolean;children:ReactNode}){
 function track(event:MouseEvent<HTMLAnchorElement>){
  if(redirect||event.button>1)return;
  trackClick({eventType:product?'product_click':'whatsapp_click',...(product?{productId:product.id,affiliateLinkId:product.offer.id}:{}),placement,ctaId:product?'buy':'whatsapp'});
 }
 return <a href={href} rel="nofollow sponsored" onClick={track} onAuxClick={track}>{children}</a>;
}

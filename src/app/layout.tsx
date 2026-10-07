import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
export const metadata:Metadata={title:'Caião da Oficina',description:'Produtos e ferramentas selecionados pelo Caião da Oficina.'};
export default function Layout({children}:{children:ReactNode}){return <html lang="pt-BR"><body><header><Link href="/" prefetch={false}>Caião da Oficina</Link></header><main>{children}</main><footer><p>Links de afiliado: posso receber comissão pelas compras realizadas pelos links deste site.</p></footer></body></html>;}

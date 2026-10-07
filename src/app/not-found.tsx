import Link from 'next/link';
export default function NotFound(){return <><h1>Produto ou categoria não encontrado</h1><Link href="/" prefetch={false}>Voltar ao catálogo</Link></>;}

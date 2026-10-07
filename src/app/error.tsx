'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <><h1>Catálogo temporariamente indisponível</h1><p>Tente novamente em instantes.</p><button onClick={reset}>Tentar novamente</button></>;}

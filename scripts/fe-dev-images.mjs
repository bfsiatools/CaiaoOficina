// SÓ DESENVOLVIMENTO: copia as WebP reais preparadas pelo Codex para public/__dev (ignorado pelo Git),
// para o QA visual com `?__state=local` enquanto o Storage não está populado.
import { cp, mkdir } from 'node:fs/promises';

const source = process.argv[2] ?? 'C:/dev/CaiaoOficina/private/imports/v1/prepared';
await mkdir('public/__dev', { recursive: true });
await cp(source, 'public/__dev', { recursive: true });
console.log(`copiado de ${source} para public/__dev`);

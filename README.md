# Caião da Oficina — backend V1

Checkout de implementação: `C:\dev\CaiaoOficina`, branch `codex/backend-v1`. Os materiais originais no OneDrive foram preservados. Node 24, Next.js App Router e Supabase; sem painel administrativo ou autenticação na V1.

## Estado em 2026-10-07

47 produtos reais **ativos** no Supabase, com 47 versões de link e 47 WebP no Storage. Importação e segunda execução aplicadas; repetição sem alterações. Catálogo e três redirects conferidos em localhost; navegação sem JavaScript validada. Esta entrega prepara o backend; lançamento público e interface definitiva são etapas seguintes.

## Configuração

Copie `.env.example` para `.env.local` e preencha as credenciais do projeto `lyhybytsfbdiodtsytqc`. A chave privada pertence somente ao servidor e aos scripts. Nunca use prefixo `NEXT_PUBLIC_` para ela. Não envie chaves pelo chat ou pelo Git.

Bernardo inicia o servidor no próprio terminal:

```powershell
cd C:\dev\CaiaoOficina
npm ci
npm run dev
```

Para homologar `/go`, use `APP_ENV=preview`, `AFFILIATE_REDIRECT_ENABLED=true` e `TRACKING_ENABLED=true`. Eventos serão `test`. Em produção, a flag de redirect começa desligada até confirmar compatibilidade com o programa de afiliados. Configure o WAF antes de habilitar tracking em produção.

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Playwright não inicia servidor. Na primeira instalação, execute `npx playwright install chromium`. Os testes de catálogo exigem 47 produtos ativos com imagens enviadas e redirect habilitado. Os testes HTTP de fronteiras podem rodar antes disso.

## Documentação

- [Modelo, RLS e RPCs](docs/data-model.md)
- [Importação, preservação e rollback](docs/importing-products.md)
- [Tracking e redirect](docs/tracking.md)
- [Operação e lançamento](docs/operations.md)
- [Contrato para o frontend](docs/frontend-handoff.md)
- [Evidência e limitações da validação](docs/validation.md)
- [Plano original aprovado](docs/superpowers/plans/2026-10-07-caiao-oficina-backend.md)

`private/` contém entradas reais, manifesto com checkpoint editorial, imagens e relatórios operacionais. É ignorado pelo Git; faça backup privado. Fixtures aparecem apenas nos testes, nunca no catálogo final.

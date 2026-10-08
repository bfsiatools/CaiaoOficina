# Caion da Oficina — frontend e backend V1

Fonte oficial: `C:\dev\CaiaoOficina`, branch `main`. A integração preserva o frontend do Claude e o backend do Codex. As branches/worktrees originais permanecem como referências históricas; não são versões oficiais de execução. Os materiais originais no OneDrive foram preservados. Node 24, Next.js App Router e Supabase; sem painel administrativo ou autenticação na V1.

## Estado em 2026-10-07

47 produtos reais **ativos** no Supabase, com 47 versões de link e 47 WebP no Storage. Após a integração, Bernardo substituiu permanentemente a direção anterior por vitrine comercial clara: hero, carrossel, amarelo/grafite, Manrope + DM Sans e CTAs de preço. Busca/chips, editorial e páginas usam a DAL existente e um único coletor. Ver [redesign e validação](docs/storefront-2026-10-07.md) e [auditoria da integração anterior](docs/integration-2026-10-07.md). Lançamento público e teste em aparelho/navegador interno continuam pendentes.

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
- [Integração das branches e reconciliação dos 47 produtos](docs/integration-2026-10-07.md)
- [Plano original aprovado](docs/superpowers/plans/2026-10-07-caiao-oficina-backend.md)

`private/` contém entradas reais, manifesto com checkpoint editorial, imagens e relatórios operacionais. É ignorado pelo Git; faça backup privado. Fixtures aparecem apenas nos testes, nunca no catálogo final.

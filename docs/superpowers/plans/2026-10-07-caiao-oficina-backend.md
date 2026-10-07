# Caião da Oficina — Implementation Plan

> **Para agentes executores:** executar tarefa por tarefa usando `superpowers:executing-plans`. Se Bernardo escolher execução com subagentes no Prompt 3, usar `superpowers:subagent-driven-development`. Nenhum método está autorizado nesta etapa.

**Objetivo:** preparar o backend de um catálogo de aproximadamente 50 produtos, com importação segura, dados públicos tipados e tracking independente da navegação.

**Arquitetura:** Next.js concentra data access e endpoints. Supabase armazena catálogo, categorias, versões dos links e eventos. O visitante utiliza o link oficial de afiliado diretamente.

**Stack:** Node.js 24, Next.js 16, React 19, TypeScript strict, Supabase, Zod, Vitest 4.1, PGlite e Playwright. Versões exatas serão verificadas e fixadas no lockfile durante a preparação.

**Spec:** brainstorming anterior desta conversa, com os ajustes explicitados neste plano.

**Restrições globais:**

- Não implementar, gravar arquivos, aplicar migrations ou fazer commits nesta etapa.
- Imagens e links serão fornecidos no Prompt 3.
- Não iniciar servidores; Bernardo controla localhost.
- Não definir design visual.
- Não construir checkout, autenticação de visitantes ou painel próprio.
- Não inserir credenciais privilegiadas no cliente.
- Não usar scraping nem modificar parâmetros dos links oficiais.
- Preservar nomes e IDs dos recursos existentes.

**Foco da revisão:**

1. Reimportação deve preservar alterações editoriais.
2. Trocas simultâneas de link não podem gerar duas versões vigentes.
3. Clique de aba antiga deve manter a versão apresentada.
4. Falha do tracking não pode bloquear a navegação.
5. Falha do catálogo não pode ser apresentada como catálogo vazio.

O documento está no chat porque seu briefing proíbe alterar arquivos. O caminho previsto para sua futura materialização é `docs/superpowers/plans/2026-10-07-caiao-oficina-backend.md`.

# 1. Resumo executivo

A execução terá oito fases, com checkpoints antes das operações seguintes.

| Fase | Resultado verificável |
|---|---|
| 0 — Preparação | Ambiente, recursos, entradas e contratos identificados |
| 1 — Banco | Schema, permissões e operações transacionais testados |
| 2 — Importação | Dry-run aprovado e produtos importados sem duplicação |
| 3 — Data access | Catálogo público tipado, com cache e erros explícitos |
| 4 — Tracking | Eventos validados e navegação independente |
| 5 — Frontend | Contrato entregue e integração funcional |
| 6 — Homologação | Segurança, desempenho e fluxos exercitados |
| 7 — Documentação | Operação, recuperação e estado final registrados |

Três ajustes refinam o brainstorming:

- **`/go/[slug]` será uma alternativa condicionada**, não o caminho habilitado da V1. A restrição da cláusula 1.8 permanece relevante. [Termos do Mercado Livre](https://www.mercadolivre.com.br/ajuda/30228).
- **Revalidação de 60 segundos não é prazo rígido de atualização.** Haverá invalidação administrativa e tratamento explícito de dados antigos.
- **O link apresentado acompanha o evento.** O backend não substituirá esse identificador pela versão atualmente vigente.

# 2. Decisões arquiteturais finais

As escolhas abaixo formam a proposta consolidada para aprovação.

| Decisão | Escolha e motivo | Impacto e limitação aceita |
|---|---|---|
| D01 — Produtos | Identidade editorial estável em `products` | Trocar anúncio não troca o produto; mudanças materiais de produto exigem novo registro |
| D02 — Categorias | Many-to-many com `product_categories` | Um compressor pode aparecer em duas categorias; totais por categoria podem se sobrepor |
| D03 — Taxonomia | Ferramentas e reparos; Automotivo; Casa e organização; Limpeza e cuidados | Ajustar com a lista real; sem árvore hierárquica |
| D04 — Links | Versões em `affiliate_links` | Uma versão vigente por produto; sem ofertas simultâneas na V1 |
| D05 — Histórico | URL e identidade da versão imutáveis | Restaurar destino antigo cria nova versão |
| D06 — Publicação | Quatro estados: `active`, `inactive`, `out_of_stock`, `archived` | Importação começa oculta; catálogo só retorna produtos publicáveis |
| D07 — Destaques | `featured_rank` nullable | Sem boolean redundante |
| D08 — Achados | Data editorial e posição | Sem afirmar desconto ou menor preço |
| D09 — Collections | Sem tabelas próprias | Evoluir quando houver várias coleções independentes |
| D10 — Imagens | Supabase Storage com arquivos versionados | Uso autorizado precisa ser confirmado; bucket público não protege imagens de rascunhos |
| D11 — Importação | TXT + manifest enriquecido + dry-run | Sem publicação automática de dados incompletos |
| D12 — Deduplicação | `import_key` imutável | Nome e slug não são identidade |
| D13 — Tracking | Evento do navegador → API → RPC restrita | Contagem parcial, sem pessoas únicas ou fingerprinting |
| D14 — Redirect | Link oficial direto | `/go` exige autorização específica antes de habilitação |
| D15 — Segurança | RLS, grants mínimos e RPCs administrativas restritas | Servidor privilegiado exige validação própria |
| D16 — Administração | Dashboard + scripts | Troca de link passa pela operação transacional |
| D17 — Runtime | Route Handlers em Node.js | Sem Edge Functions na V1 |
| D18 — Cache | Catálogo compartilhado; contexto de campanha fora do cache | Revalidação normal em 60 s, sem garantia de atualização de abas abertas |
| D19 — Tipagem | Tipos do banco separados dos DTOs públicos | Frontend não acompanha alterações internas do schema |
| D20 — Analytics | Relatórios administrativos/CSV | Sem dashboard, impressões ou atribuição de vendas |

**Administração direta:** o Dashboard pode editar informações editoriais. As operações que preservam histórico — importação e troca de link — usam os scripts/RPCs definidos aqui.

# 3. Estado atual relevante

A inspeção anterior permanece a referência. Uma conferência pontual nesta etapa confirmou **zero tabelas de negócio, policies, usuários e buckets**.

| Item | Estado | Tratamento |
|---|---|---|
| Organização | `jwldvpgfkutrqisimgzr` | **REAPROVEITAR** |
| Projeto | `CaiaoOficina`, `lyhybytsfbdiodtsytqc`, `sa-east-1` | **REAPROVEITAR** |
| GitHub | [bfsiatools/CaiaoOficina](https://github.com/bfsiatools/CaiaoOficina), ID `1409174704`, público | **REAPROVEITAR** |
| Repositório remoto | Vazio na inspeção anterior | **CRIAR NOVO**: estrutura da aplicação |
| Pasta local | Sem checkout; contém apenas um TXT vazio | **IGNORAR** o TXT como entrada de produtos |
| Schemas da plataforma | `auth`, `extensions`, `graphql`, `graphql_public`, `realtime`, `storage`, `vault` | **REAPROVEITAR**, sem modificar objetos internos |
| Schema `public` | Sem tabelas de negócio | **CRIAR NOVO**: objetos da aplicação |
| Migrations | Nenhuma na inspeção anterior | **CRIAR NOVO** |
| Edge Functions | Nenhuma na inspeção anterior | **IGNORAR** nesta V1 |
| Tipos e helpers | Inexistentes | **CRIAR NOVO** |
| `rls_auto_enable()` | Event trigger da plataforma | **REAPROVEITAR**; revisar grants sem alterar seu corpo |
| Variáveis de ambiente | Ausentes no processo atual | **CRIAR NOVO** na execução, sem expor valores |
| Recursos a remover | Nenhum identificado | **NÃO REMOVER** |

Node.js observado: `24.14.0`. Git observado: `2.53.0.windows.2`.

Variáveis previstas:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`, ou alternativa legada `SUPABASE_SERVICE_ROLE_KEY`
- `SITE_URL`
- `CATALOG_REVALIDATION_SECRET`
- `APP_ENV`: `preview` ou `production`
- `TRACKING_ENABLED`: inicialmente `false`

O checkout recomendado é `C:\dev\CaiaoOficina`, conforme a preferência registrada de manter código fora do OneDrive. Nada será movido ou criado agora.

# 4. Schema final da V1

**Convenções:** `NN` = NOT NULL; campos sem default precisam ser fornecidos. Datas e horários persistidos usam UTC.

## 4.1 `products`

| Coluna | Tipo | Nullable/default | Constraints |
|---|---|---|---|
| `id` | `uuid` | NN; `gen_random_uuid()` | PK |
| `import_key` | `text` | NN | UNIQUE; 1–128 caracteres; imutável |
| `slug` | `text` | NN | UNIQUE; 1–100 caracteres; formato lowercase com hífens |
| `name` | `text` | NN | 1–200 caracteres após trim |
| `short_description` | `text` | Sim | 1–500 caracteres quando preenchida |
| `image_path` | `text` | Sim | Caminho interno do bucket |
| `image_alt` | `text` | Sim | 1–250 caracteres quando preenchido |
| `image_width` | `integer` | Sim | Positivo quando preenchido |
| `image_height` | `integer` | Sim | Positivo quando preenchido |
| `status` | `text` | NN; `inactive` | CHECK dos quatro estados |
| `sort_order` | `integer` | NN; `0` | ≥ 0 |
| `featured_rank` | `integer` | Sim | ≥ 0 quando preenchido |
| `daily_pick_date` | `date` | Sim | Data editorial |
| `daily_pick_rank` | `integer` | NN; `0` | ≥ 0 |
| `created_at` | `timestamptz` | NN; `now()` | — |
| `updated_at` | `timestamptz` | NN; `now()` | Atualização por trigger |

CHECK adicional: `status='active'` exige descrição, caminho de imagem, alt e dimensões preenchidos.

Índices: PK, unicidade de `import_key` e de `slug`. Nenhum índice isolado em status ou destaque inicialmente.

## 4.2 `categories`

| Coluna | Tipo | Nullable/default | Constraints |
|---|---|---|---|
| `id` | `uuid` | NN; `gen_random_uuid()` | PK |
| `slug` | `text` | NN | UNIQUE; mesmo formato de slug |
| `name` | `text` | NN | 1–80 caracteres |
| `sort_order` | `integer` | NN; `0` | ≥ 0 |
| `is_active` | `boolean` | NN; `true` | — |

As quatro categorias iniciais entram na migration por slug; relacionamentos posteriores consultam seus IDs, sem IDs fixos presumidos.

## 4.3 `product_categories`

| Coluna | Tipo | Nullable/default | Constraints |
|---|---|---|---|
| `product_id` | `uuid` | NN | FK → `products.id`; DELETE CASCADE |
| `category_id` | `uuid` | NN | FK → `categories.id`; DELETE RESTRICT |

PK: `(product_id, category_id)`.

Índice inverso: `(category_id, product_id)`.

## 4.4 `affiliate_links`

| Coluna | Tipo | Nullable/default | Constraints |
|---|---|---|---|
| `id` | `uuid` | NN; `gen_random_uuid()` | PK |
| `product_id` | `uuid` | NN | FK → `products.id`; DELETE RESTRICT |
| `marketplace` | `text` | NN; `mercado_livre` | CHECK: `mercado_livre` |
| `affiliate_url` | `text` | NN | HTTPS; até 4.096 caracteres; sem caracteres de controle |
| `marketplace_item_id` | `text` | Sim | Até 80 caracteres |
| `marketplace_catalog_id` | `text` | Sim | Até 80 caracteres |
| `seller_id` | `text` | Sim | Até 80 caracteres |
| `created_at` | `timestamptz` | NN; `now()` | — |
| `ended_at` | `timestamptz` | Sim | ≥ `created_at` quando preenchido |

Constraints e índices:

- UNIQUE `(id, product_id)` para a FK composta dos eventos.
- UNIQUE parcial `(product_id)` onde `ended_at IS NULL`.
- Índice `(product_id, created_at DESC)`.

Trigger impede editar produto, URL, marketplace, IDs externos ou criação de uma versão existente. `ended_at` só pode mudar de `null` para uma data; não pode ser reaberto ou reescrito.

A allowlist de hostnames fica no validador compartilhado, testada e fixada após receber os formatos reais. Não serão presumidos hostnames de encurtadores.

## 4.5 `click_events`

| Coluna | Tipo | Nullable/default | Constraints |
|---|---|---|---|
| `event_id` | `uuid` | NN; fornecido | PK |
| `schema_version` | `smallint` | NN; `1` | CHECK = 1 |
| `event_type` | `text` | NN | `product_click` ou `whatsapp_click` |
| `received_at` | `timestamptz` | NN; `now()` | Relógio do banco |
| `product_id` | `uuid` | Sim | FK → produto; DELETE RESTRICT |
| `affiliate_link_id` | `uuid` | Sim | FK composta com `product_id` |
| `category_snapshot` | `jsonb` | NN; `[]` | Array com ID, slug e nome |
| `page_path` | `text` | NN | Caminho interno; até 256 caracteres; sem query/hash |
| `placement` | `text` | NN | Enum definido abaixo |
| `cta_id` | `text` | NN | 1–64 caracteres |
| `utm_source` | `text` | Sim | Até 64 caracteres |
| `utm_medium` | `text` | Sim | Até 64 caracteres |
| `utm_campaign` | `text` | Sim | Até 128 caracteres |
| `utm_content` | `text` | Sim | Até 128 caracteres |
| `content_id` | `text` | Sim | Até 80 caracteres |
| `referrer_host` | `text` | Sim | Hostname; até 253 caracteres |
| `attribution_method` | `text` | NN; `unknown` | `utm`, `referrer`, `unknown` |
| `quality` | `text` | NN; `accepted` | `accepted`, `suspected`, `test` |

`placement`: `catalog_card`, `featured`, `daily_pick`, `product_detail`, `whatsapp_cta`. A alternativa condicional de redirect acrescentaria `redirect` por migration própria.

CHECK por tipo:

- `product_click`: produto e versão obrigatórios.
- `whatsapp_click`: ambos nulos e `placement='whatsapp_cta'`.

Índices adicionais:

- `(received_at)`
- `(product_id, received_at)`
- `(content_id, received_at)`

**Precisão do snapshot:** representa as categorias lidas pelo servidor ao aceitar o evento. Não demonstra quais categorias estavam visíveis numa aba aberta anteriormente.

A versão do link, por sua vez, é a versão apresentada pelo frontend, validada contra o produto. Versões encerradas continuam elegíveis para registrar cliques vindos de abas antigas.

## 4.6 `site_settings`

| Coluna | Tipo | Nullable/default | Constraints |
|---|---|---|---|
| `id` | `smallint` | NN; `1` | PK; CHECK = 1 |
| `whatsapp_url` | `text` | Sim | HTTPS; até 2.048 caracteres |
| `whatsapp_enabled` | `boolean` | NN; `false` | Habilitado exige URL |
| `updated_at` | `timestamptz` | NN; `now()` | Atualização por trigger |

Uma linha inicial será criada com WhatsApp desabilitado.

## 4.7 Regras entre tabelas

A escrita por importação verifica, na mesma transação, se cada produto a ativar possui:

- Dados editoriais completos.
- Pelo menos uma categoria ativa.
- Uma versão vigente de link.
- URL aprovada pelo validador.
- Imagem preparada e previamente enviada.

A leitura pública também exige essas condições relacionais. Um registro marcado `active`, mas sem associação válida por edição manual, **não entra no catálogo**; a auditoria administrativa aponta a pendência.

Isso evita acrescentar uma rede de triggers para todas as alterações de categorias. A garantia de publicação fica na operação administrativa e na consulta pública.

# 5. Plano fase a fase

Todos os passos abaixo são para o Prompt 3. Os arquivos citados são futuros.

Cada tarefa de comportamento seguirá: **teste → falha esperada → implementação mínima → teste passando → revisão**. Configurações simples serão verificadas pelos comandos que as utilizam.

## Fase 0 — Preparação e segurança

**Objetivo:** estabelecer a base sem misturar trabalho existente ou usar o projeto errado.  
**Pré-requisitos:** Prompt 3 autorizando execução e materiais recebidos.

### Tarefa 0.1 — Checkout, entradas e base técnica

**CRIAR:** checkout em `C:\dev\CaiaoOficina`, configurações Node/Next/TypeScript, `.gitignore`, `.env.example`, scripts de validação e testes.

**Interfaces:** produz os comandos `test`, `typecheck`, `lint`, `build` e a estrutura descrita na seção 11.

- [ ] Conferir repo, branch, alterações existentes e novos `AGENTS.md`.
- [ ] Reutilizar eventual implementação criada pelo Claude; não sobrescrever scaffolding.
- [ ] Verificar IDs Supabase e drift desde esta inspeção.
- [ ] Fixar dependências e lockfile.
- [ ] Separar materiais originais em diretório ignorado pelo Git.
- [ ] Verificar configuração por presença e origem das variáveis, sem imprimir valores.
- [ ] Materializar o plano aprovado e a referência ao brainstorming.

**Validação:** `npm run typecheck`, `npm run lint`, testes da configuração e confirmação do projeto esperado.

**Rollback:** reverter somente os arquivos desta tarefa. Não remover a pasta ou alterações preexistentes.

### Tarefa 0.2 — Contratos e validação de fronteira

**CRIAR:** `src/lib/catalog/types.ts`, `src/lib/tracking/schema.ts`, `src/lib/affiliate/urls.ts`, `src/lib/env/server.ts`.

**Interfaces produzidas:**

- `validateAffiliateUrl(input: string): ValidatedAffiliateUrl`
- `parseClickPayload(input: unknown): ClickPayload`
- `readServerEnv(): ServerEnv`

**Testes:** URLs de domínio enganoso, protocolo inválido, excesso de tamanho, campos extras, UUID inválido e configuração ausente.

**Validação:** `npm run test -- tests/affiliate-urls.test.ts tests/tracking-schema.test.ts tests/env.test.ts`.

**Rollback:** reversão dos módulos; nenhum recurso remoto alterado.

**Saída da fase:** entradas conhecidas e validação pura funcionando.

## Fase 1 — Banco e migrations

**Objetivo:** estabelecer dados, permissões e transações.  
**Dependência:** fase 0.

### Tarefa 1.1 — Schema e políticas

**CRIAR:** migrations M01 e M02; `tests/db/schema.test.ts`; `tests/db/rls.test.ts`.

- [ ] Escrever testes de constraints e acesso para `anon`, `authenticated` e `service_role`.
- [ ] Aplicar migrations no PGlite com papéis de teste.
- [ ] Verificar a falha dos testes antes dos objetos correspondentes.
- [ ] Implementar schema, RLS e grants definidos nas seções 4 e 8.
- [ ] Executar novamente os testes.

**Validação:** insert válido aceito; duplicações e FK inválida recusadas; escrita pública bloqueada.

**Rollback:** antes de dados reais, reverter a migration de teste. No remoto, seguir a estratégia aditiva da seção 18.

### Tarefa 1.2 — Operações transacionais

**CRIAR:** M03 e `tests/db/operations.test.ts`.

**Interfaces SQL previstas:**

| Função | Retorno | Quem executa |
|---|---|---|
| `get_public_catalog()` | `jsonb` | `anon`, `authenticated`, servidor |
| `apply_product_batch(p_batch_id uuid, p_rows jsonb)` | `jsonb` | `service_role` |
| `replace_affiliate_link(p_product_id uuid, p_expected_link_id uuid, p_link jsonb)` | `uuid` | `service_role` |
| `record_click_event(p_event jsonb)` | `text` | `service_role` |

Operações usam `SECURITY INVOKER`, nomes qualificados e `search_path` restrito.

`record_click_event` retorna `inserted`, `duplicate` ou `invalid_reference`. Um ID repetido com conteúdo diferente deve ser detectado como conflito, sem substituir o evento original.

**Regras transacionais:**

- Importação: até 100 registros por lote; tudo confirma ou tudo é desfeito.
- Produtos existentes: detectar conflito de edição pela versão `updated_at`.
- Campos iguais: no-op, inclusive após retry de resposta perdida.
- Troca de link: bloquear o produto, conferir versão esperada, encerrar e criar.
- Escritores administrativos relacionados usam o mesmo bloqueio de produto.
- Eventos: congelar categorias e inserir na mesma operação.

**Validação:** duas trocas concorrentes resultam em uma aplicada e outra recusada por conflito; falha no registro 50 não deixa 49 registros confirmados.

### Tarefa 1.3 — Aplicação e conferência remota

- [ ] Capturar baseline dos objetos e grants relevantes.
- [ ] Aplicar migrations pelo MCP no projeto identificado.
- [ ] Conferir migrations registradas, constraints, policies e privilégios efetivos.
- [ ] Executar asserções remotas com fixtures em transação e rollback.
- [ ] Conferir ausência de fixtures persistidas.
- [ ] Gerar `src/lib/supabase/database.types.ts`.

**Validação:** testes locais e remotos consistentes; nenhum grant público inesperado.

**Saída da fase:** banco funcional, fechado para escrita pública.

## Fase 2 — Importação e imagens

**Objetivo:** transformar os materiais em catálogo revisável.  
**Dependências:** schema e materiais do Prompt 3.

### Tarefa 2.1 — Parser, manifest e planejamento

**CRIAR:** `scripts/lib/parse-products.ts`, `scripts/lib/import-plan.ts`, `scripts/import-products.ts`.

**Interfaces:**

- `parseProductsTxt(text: string): ParsedProducts`
- `buildImportPlan(input: ImportManifest, existing: ImportState): ImportPlan`
- `applyImportPlan(plan: ImportPlan): Promise<ImportReport>`

O CLI exige `--apply` para escrever; sem essa opção, apenas dry-run.

**Testes:** BOM, CRLF, linhas vazias, URL inválida, duplicata, colisão de slug, segunda execução, alteração manual preservada e conflito detectado.

**Validação:** dry-run produz zero operações de escrita.

### Tarefa 2.2 — Preparação e upload de imagens

**CRIAR:** `scripts/lib/images.ts`, `scripts/provision-storage.ts`; recurso `product-images`.

- [ ] Associar cada imagem ao produto por manifest, sem depender da ordem dos anexos.
- [ ] Verificar extensão, assinatura do arquivo, dimensões e tamanho.
- [ ] Preparar imagem conforme seção 6.
- [ ] Provisionar o bucket; se existente, comparar a configuração antes de alterar.
- [ ] Enviar arquivos por caminho versionado.
- [ ] Verificar leitura HTTP e dimensões.

**Validação:** nenhuma imagem ambígua é associada automaticamente; upload repetido do mesmo conteúdo não cria outra identidade.

**Rollback:** upload falho não altera o banco. Arquivos enviados e ainda não usados ficam listados para limpeza posterior.

### Tarefa 2.3 — Aplicação do lote

- [ ] Executar dry-run completo.
- [ ] Gerar relatório antes/depois e IDs estáveis.
- [ ] Conferir pendências de publicação.
- [ ] Aplicar o lote por RPC.
- [ ] Reexecutar o mesmo manifest.
- [ ] Conferir que a segunda execução é no-op.

**Rollback:** restauração seletiva pelo relatório, com verificação de alterações posteriores; destinos antigos são restaurados como novas versões.

**Saída da fase:** produtos importados, com relatório e identidade estável.

## Fase 3 — Data access layer

**Objetivo:** entregar o contrato público ao frontend.  
**Dependência:** banco e fixtures/importação.

### Tarefa 3.1 — Catálogo tipado e cache

**CRIAR:** `src/lib/catalog/server.ts`, `src/lib/catalog/queries.ts`, `src/lib/supabase/public-server.ts`, `tests/catalog.test.ts`.

- [ ] Implementar os helpers da seção 10.
- [ ] Validar o JSON da RPC antes de produzir DTOs.
- [ ] Implementar uma leitura compartilhada do catálogo.
- [ ] Aplicar revalidação e tratamento de idade conforme seção 9.
- [ ] Diferenciar vazio legítimo, não encontrado e falha operacional.

**Validação:** produto oculto não aparece; ordenação é estável; helpers derivados não multiplicam consultas.

### Tarefa 3.2 — Invalidação administrativa

**CRIAR:** `src/app/api/internal/revalidate/route.ts`, `scripts/revalidate-catalog.ts`, teste correspondente.

**Contrato:** POST autenticado por Bearer secret; tag fixa `catalog-v1`; não aceitar tag arbitrária.

A rota usa invalidação imediata da tag para que a próxima leitura não receba o valor antigo. [Referência de `revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag).

**Validação:** sem token = `401`; token correto = `204`; o próximo catálogo é atualizado.

**Rollback:** desabilitar a rota; revalidação periódica permanece.

**Saída da fase:** DAL pronta para consumo, sem acoplamento visual.

## Fase 4 — Tracking

**Objetivo:** medir ações sem condicionar a navegação.  
**Dependência:** contratos, banco e DAL.

### Tarefa 4.1 — Endpoint de eventos

**CRIAR:** `src/lib/tracking/server.ts`, `src/lib/tracking/handler.ts`, `src/app/api/events/route.ts`, testes.

**Interface interna:** `recordClick(payload: ClickPayload, context: ServerEventContext): Promise<ClickWriteResult>`.

- [ ] Validar método, origem, formato, tamanho e campos.
- [ ] Definir `quality` no servidor.
- [ ] Resolver referências sem substituir a versão informada.
- [ ] Gravar por RPC com timeout.
- [ ] Mapear respostas HTTP.
- [ ] Registrar falhas sem dados pessoais ou payload integral.

**Validação:** repetição do evento não duplica; produto A + link B é recusado; timeout resulta em `503`.

### Tarefa 4.2 — Cliente e contexto de atribuição

**CRIAR:** `src/lib/tracking/client.ts`, `src/lib/tracking/context.ts`, testes.

**Interfaces:**

- `readAttributionContext(url: URL, referrer: string): AttributionContext`
- `buildTrackedInternalHref(path: string, context: AttributionContext): string`
- `trackClick(input: ClickInput): void`

**Validação:** envio não é aguardado; falha não lança erro para o fluxo da UI; UTMs permanecem apenas nas URLs internas e no evento.

Não implementar `/go` nesta tarefa.

**Saída da fase:** tracking funcional e independente.

## Fase 5 — Integração com frontend

**Objetivo:** conectar o trabalho do Claude ao contrato.  
**Dependência:** DAL e tracking.

### Tarefa 5.1 — Handoff e testes de integração

**CRIAR:** `docs/frontend-contract.md`; testes de integração.  
**ALTERAR:** somente pontos de consumo acordados no frontend existente.

- [ ] Entregar o bloco da seção 15.
- [ ] Integrar helpers em Server Components.
- [ ] Integrar captura de eventos aos links normais.
- [ ] Testar teclado, nova aba, ausência de JavaScript e falha do tracking.
- [ ] Implementar tratamento de imagem quebrada no componente responsável, sem definir estética.

**Validação:** catálogo e links utilizam a mesma oferta; nenhum componente cliente importa módulo privilegiado.

**Rollback:** reverter os pontos de integração; backend permanece utilizável.

## Fase 6 — Homologação

**Objetivo:** comprovar comportamento, segurança e limites.  
**Dependência:** integração disponível em ambiente de teste.

### Tarefa 6.1 — Gate completo

**CRIAR:** testes E2E, scripts de smoke e relatório de validação.

- [ ] Executar `npm run test`.
- [ ] Executar `npm run typecheck`.
- [ ] Executar `npm run lint`.
- [ ] Executar `npm run build`.
- [ ] Validar acessos PostgREST com papéis públicos.
- [ ] Validar desempenho conforme seção 9.
- [ ] Exercitar frontend na URL de homologação.
- [ ] Confirmar regra de proteção do endpoint na hospedagem.

Eventos de homologação recebem `quality='test'`, definido pelo ambiente de servidor, e ficam fora dos relatórios comerciais.

**Rollback:** retirar a versão de homologação ou desativar tracking; sem apagar histórico comercial.

## Fase 7 — Documentação e entrega

**Objetivo:** permitir operação e recuperação sem contexto oral.  
**Dependência:** gates anteriores.

### Tarefa 7.1 — Documentação, revisão e versionamento

- [ ] Consolidar os documentos da seção 14.
- [ ] Registrar o que foi exercitado e o que permanece pendente.
- [ ] Revisar diff, entradas ignoradas e ausência de secrets.
- [ ] Fazer commits dos arquivos explícitos concluídos.
- [ ] Atualizar o Segundo Cérebro quando a execução estiver autorizada.
- [ ] Entregar status do backend separado do status de lançamento.

**Saída final:** backend validado e contrato entregue. Lançamento depende também do frontend e das condições de divulgação.

# 6. Importação dos 50 produtos

## Entradas esperadas

Dentro do futuro checkout:

```text
private/imports/v1/
  products.txt
  manifest.json
  images/
```

Diretório ignorado pelo Git. Os anexos originais permanecem preservados.

Formato do TXT:

```text
Nome do produto | URL oficial de afiliado
```

Regras:

- UTF-8, com ou sem BOM.
- LF ou CRLF.
- Uma entrada por linha.
- Separação no primeiro `|`.
- Nome e URL com espaços externos removidos.
- Nenhuma reordenação ou reconstrução da URL.
- Linha vazia ignorada.
- Linha inválida identificada pelo número.

## Identidade e deduplicação

Na primeira carga:

```text
import_key = "txt-sha256:" + SHA-256(URL original após trim externo)
```

A chave é conservada no manifest enriquecido.

Consequências:

- Repetir a URL original identifica o registro.
- Trocar nome não muda identidade.
- Trocar URL exige conservar `import_key` no manifest.
- URL nova em TXT sem chave é uma candidata nova; não será fundida por semelhança.
- Mesmo link com nomes divergentes gera conflito de entrada.
- Links diferentes para possível mesmo produto geram aviso para revisão.

Slug: normalizar nome para lowercase ASCII com hífens. Em colisão entre registros novos, acrescentar sufixo de oito caracteres derivado da `import_key`; se ainda houver colisão, interromper aquele registro. Slug existente é preservado.

## Fluxo exato

1. Ler TXT e manifest.
2. Normalizar apenas o formato.
3. Validar URLs contra allowlist oficial.
4. Detectar duplicações e ambiguidades.
5. Associar imagens.
6. Ler estado existente.
7. Planejar inserts, updates e no-ops.
8. Exibir dry-run.
9. Preparar e enviar imagens.
10. Aplicar lote transacional.
11. Gravar relatório local.
12. Invalidar cache.
13. Reexecutar para comprovar idempotência.

Comandos futuros:

```text
npm run import:products -- --file private/imports/v1/products.txt --manifest private/imports/v1/manifest.json
npm run import:products -- --manifest private/imports/v1/manifest.json --apply
```

O primeiro comando não grava no banco nem no Storage.

## Updates e erros

- Campo ausente: preservar valor.
- Campo nullable explicitamente `null`: tentativa explícita de limpar.
- Campo vazio indevido: erro.
- Alteração concorrente: abortar o lote.
- Link alterado: criar versão.
- Produto ausente do arquivo: não excluir nem desativar automaticamente.
- Erro de validação: exit code `2`.
- Conflito de edição: exit code `3`.
- Erro operacional: exit code `1`.
- Sucesso, inclusive no-op: exit code `0`.

Relatório: `batch_id`, quantidades, ações por produto, avisos e estado antes/depois. URLs e dados completos ficam no relatório privado, não nos logs gerais.

## Estratégia de imagens

| Alternativa | Avaliação |
|---|---|
| URL externa | Menos upload, mas depende de disponibilidade e política de terceiros |
| Imagem local no Git | Simples, porém cada edição exige deploy e aumenta o repositório |
| Supabase Storage | **Escolhida:** atualização independente e caminhos versionados |
| CDN separada | Desnecessária agora; usar a entrega do Storage/hospedagem |

Preparação proposta:

- Entrada JPEG, PNG ou WebP; até 10 MiB.
- Verificar formato real, não apenas extensão.
- Saída WebP, sem recorte, maior lado até 1.600 px, sem ampliar imagens pequenas.
- Remover metadados não necessários.
- Limite de saída: 2 MiB.
- Caminho: `<product_id>/<sha256-do-arquivo-final>.webp`.
- Bucket público `product-images`, restrito a `image/webp`.

Fallback local: `public/images/product-placeholder.svg`, sem fingir representar o produto.

Se a imagem quebrar, o frontend usa o fallback e mantém nome/CTA. A homologação detecta o problema antes da publicação.

Migrar de estratégia apenas quando transformação, volume ou custo justificarem outro serviço.

# 7. Redirect e tracking

## Caminho ativo da V1

O CTA usa `affiliateUrl` como `href` normal. O evento é uma tentativa independente.

**Se o tracking falhar, o usuário continua para o Mercado Livre.** O objetivo comercial não deve depender da disponibilidade da telemetria.

UTMs próprias não são adicionadas ao link oficial.

## Fluxo do evento

1. Usuário ativa o CTA.
2. Cliente cria UUID para aquela ação.
3. Cliente reúne IDs, posição e contexto permitido.
4. Tenta `sendBeacon`; fallback com `fetch` e `keepalive`.
5. Navegação ocorre sem aguardar.
6. API valida.
7. RPC insere uma vez.
8. Backend responde.

Payload máximo: **4 KiB**. Timeout de persistência: **1,5 segundo**.

| Situação | HTTP |
|---|---|
| Inserido ou repetição equivalente | `204` |
| Payload/referência inválida | `400` |
| ID repetido com conteúdo diferente | `409` |
| Origem recusada | `403` |
| Payload excessivo | `413` |
| Limite de frequência | `429` |
| Banco indisponível/timeout | `503` |
| Método diferente de POST | `405` |

Sem retry automático infinito ou fila no navegador. O mesmo ID é reutilizado apenas quando se repete o envio da mesma ação.

## MUST HAVE

Produto, versão do link, horário do servidor, pathname, posição, CTA, UTMs disponíveis, `content_id`, método de atribuição e deduplicação.

`video_id` fica representado pelo `content_id` interno. Não presumir correspondência com o ID externo da plataforma.

## NICE TO HAVE

Visualizações importadas, impressões dos cards, tendências, sessões e relatórios visuais. Nenhum desses itens entra na execução inicial.

## Mínimo contra spam

- Eventos somente por POST.
- Origem correspondente ao site.
- Body e campos limitados.
- IDs existentes e relacionados.
- Repetição deduplicada.
- Previews, crawlers e reload não geram eventos apenas por visitar páginas.
- Bots conhecidos podem ter envio descartado, sem impedir navegação.
- Regra de hospedagem: **60 POSTs por minuto por IP para `/api/events`**, sem CAPTCHA.
- Kill switch `TRACKING_ENABLED` para interromper coleta mantendo links.

A proteção na hospedagem deve ser verificada no plano efetivamente disponível; não assumir gratuidade nem habilitar cobrança automaticamente. [Rate limiting da Vercel](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting).

Essas medidas reduzem ruído. Não comprovam que todos os eventos sejam humanos.

## Plano condicional completo de `/go/[slug]`

**Fora da execução padrão.** Só entra mediante autorização específica do programa e atualização do plano.

Arquivo: `src/app/go/[slug]/route.ts`.

Responsabilidade: resolver produto e oferta vigente, validar destino e emitir redirect temporário.

| Condição | Comportamento |
|---|---|
| Produto publicado e URL válida | `302` para a URL original |
| Slug inexistente | `404`, sem destino externo |
| Produto oculto/inativo | `404`, sem destino externo |
| URL inválida | `503`, sem `Location`; log sanitizado |
| Consulta excede 2 s | `503`, sem destino inventado |
| Tracking falha após resolver destino | Redirect continua |
| `HEAD` | Não registrar clique |
| Prefetch identificado | Não registrar clique |
| Método diferente de GET/HEAD | `405` |

Resposta: `Cache-Control: no-store`; não usar cache CDN do redirect. Consulta do destino atual sem o cache editorial de 60 segundos.

**Código escolhido: `302`.** O destino pode mudar. `308` é permanente e inadequado; `307` preserva método, mas não oferece benefício para uma rota limitada a GET/HEAD.

Registro após resposta pode usar `after()` com runtime compatível. É best-effort, não fila durável. Nunca deixar uma Promise solta esperando sobreviver ao término da execução.

O modo `/go` substitui a coleta daquele CTA pelo servidor, evitando dupla contagem navegador + redirect.

# 8. Segurança e RLS

## Matriz de acesso

Todas as seis tabelas terão RLS.

| Tabela | Leitura `anon`/`authenticated` | Escrita pública |
|---|---|---|
| `products` | Linhas `active`; colunas editoriais permitidas | Bloqueada |
| `categories` | Apenas ativas | Bloqueada |
| `product_categories` | Produto ativo e categoria ativa | Bloqueada |
| `affiliate_links` | Vigente e produto ativo | Bloqueada |
| `click_events` | Bloqueada | Bloqueada |
| `site_settings` | Configuração pública | Bloqueada |

`authenticated` não significa administrador. Login futuro não recebe escrita automaticamente.

Grants públicos de produto excluem `import_key`. Queries usam projeção explícita; `SELECT *` não é o contrato.

Policies de produto não consultam links. Policies de links e associações consultam produto/categoria. Isso evita dependência circular de RLS.

O catálogo publicado é filtrado adicionalmente pela RPC de leitura.

## Funções

- RPC pública de catálogo: `SECURITY INVOKER`, somente leitura.
- RPCs de escrita: execução restrita a `service_role`.
- Revogar explicitamente de `PUBLIC`, `anon` e `authenticated`.
- Conferir com `has_function_privilege`, além do advisor.
- Triggers utilitários também não terão execução pública.
- Revisar grants de `rls_auto_enable` sem modificar seu funcionamento.

A documentação do Supabase exige atenção aos privilégios das funções; não basta confiar em RLS das tabelas. [Database functions](https://supabase.com/docs/guides/database/functions).

## Credenciais

| Variável | Uso permitido |
|---|---|
| URL Supabase | Servidor e scripts; não é secret |
| Publishable key | Leitura pública; pode ser pública, mas não precisa entrar no bundle |
| Secret/service role | Servidor de eventos e scripts administrativos |
| Revalidation secret | Script administrativo e rota interna |
| IDs de produto/link | DTO público |

Módulos privilegiados usam `server-only`. Scripts administrativos têm configuração separada e não são importados pela aplicação cliente.

## Storage

Bucket público para download de imagens. Não conceder upload, alteração, exclusão ou listagem administrativa aos visitantes.

Provisionar pela API do Storage; não criar estruturas internas `storage.*` manualmente.

## Dados pessoais

Não persistir IP, fingerprint, e-mail ou user-agent integral em eventos. O IP usado pela proteção de hospedagem não passa a integrar a tabela de analytics.

Logs da hospedagem podem ter retenção própria; verificar isso antes de publicar o aviso de privacidade.

# 9. Performance

## Cache

- Uma RPC para o snapshot do catálogo.
- `unstable_cache`, tag `catalog-v1`, revalidação de **60 segundos**.
- Deduplicação dos helpers dentro da mesma renderização.
- UTMs, referrer e dados do visitante fora do cache.
- Erros lançados, nunca convertidos em catálogo vazio.
- Cache com `generatedAt`.
- Ao encontrar snapshot com mais de **300 segundos**, tentar leitura fresca com timeout de 2 s; se falhar, retornar erro de disponibilidade.
- Após importação/edição relevante, invalidar a tag.

A implementação de cache possui comportamento de revalidação que pode servir dados antigos; o controle de idade complementa esse mecanismo. [Documentação de cache](https://nextjs.org/docs/app/api-reference/functions/unstable_cache).

Para não contradizer o controle de idade, o frontend não deve acrescentar cache de HTML com duração maior sem revisão. A base é renderização no servidor com DAL em cache; assets continuam usando CDN.

Abas já abertas podem continuar exibindo links antigos. O tracking aceita essa condição sem reatribuir a versão.

## Índices necessários

| Índice | Finalidade |
|---|---|
| `products` PK | Identidade e relacionamentos |
| `products(import_key)` UNIQUE | Reimportação |
| `products(slug)` UNIQUE | Navegação |
| `categories` PK e slug UNIQUE | Associação e filtros |
| `product_categories` PK composta | Evitar vínculo repetido |
| `product_categories(category_id, product_id)` | Filtro por categoria |
| `affiliate_links` PK | Identidade da versão |
| `affiliate_links(id, product_id)` UNIQUE | FK composta |
| `affiliate_links(product_id)` UNIQUE parcial | Uma versão vigente |
| `affiliate_links(product_id, created_at DESC)` | Histórico |
| `click_events` PK | Idempotência |
| `click_events(received_at)` | Períodos e retenção |
| `click_events(product_id, received_at)` | Interesse por produto |
| `click_events(content_id, received_at)` | Interesse por conteúdo |
| `site_settings` PK | Singleton |

Sem índices isolados em boolean, JSON ou cada UTM na V1.

## Validação proposta

Valores abaixo são **metas de homologação**, não desempenho já comprovado.

| Medida | Meta |
|---|---|
| Consulta SQL de catálogo com 50 produtos | p95 ≤ 100 ms |
| Leitura sem cache, incluindo rede | p95 ≤ 500 ms em ambiente aquecido |
| DAL com cache | p95 ≤ 50 ms |
| Endpoint de eventos | p95 ≤ 500 ms; timeout em 1,5 s |
| Catálogo serializado, sem imagens | ≤ 150 KiB |
| HTML com 50 produtos | TTFB p95 ≤ 800 ms em homologação aquecida |
| Página final | LCP ≤ 2,5 s no cenário móvel definido com o frontend |
| Redirect condicional | p95 ≤ 500 ms em ambiente aquecido |

Procedimento:

- 30 consultas para medir banco e rede.
- 100 leituras do catálogo, concorrência 10.
- 20 eventos simultâneos de teste.
- Teste separado da regra de 60 requisições/minuto.
- Cinco medições de página móvel.
- Cold starts registrados separadamente.
- Navegação com API de eventos forçada a falhar.

Não executar carga elevada contra o banco real sem necessidade.

# 10. Interface com frontend

Arquivo dos helpers: `src/lib/catalog/server.ts`.  
Arquivo dos tipos: `src/lib/catalog/types.ts`.

## Tipos públicos

| Tipo | Conteúdo |
|---|---|
| `Category` | `id`, `slug`, `name` |
| `ProductImage` | `url`, `alt`, `width`, `height` |
| `AffiliateOffer` | `id`, `marketplace`, `affiliateUrl` |
| `ProductCard` | Identidade, descrição, imagem, categorias, oferta, posições editoriais |
| `Product` | Mesmo conteúdo da V1; sem detalhes privados |
| `CatalogSnapshot` | Produtos, categorias, WhatsApp público e `generatedAt` |
| `AttributionContext` | UTMs, `contentId`, referrer host e método |
| `ClickInput` | IDs, CTA, posição, pathname e contexto |
| `CatalogUnavailableError` | Falha operacional de consulta ou validação |

Não haverá tipo `Collection` sem entidade ou comportamento correspondente.

## Helpers

| Assinatura | Retorno e comportamento |
|---|---|
| `getCatalog(): Promise<CatalogSnapshot>` | Snapshot público |
| `getProducts(): Promise<readonly ProductCard[]>` | Ordenação geral |
| `getCategories(): Promise<readonly Category[]>` | Categorias ativas com produtos publicados |
| `getFeaturedProducts(limit?: number): Promise<readonly ProductCard[]>` | Padrão 8; limite inteiro entre 1 e 50 |
| `getProductsByCategory(slug: string): Promise<readonly ProductCard[]>` | Categoria desconhecida retorna `[]` |
| `getProductBySlug(slug: string): Promise<Product \| null>` | Ausente/oculto retorna `null` |
| `getDailyPicks(date?: string): Promise<readonly ProductCard[]>` | Data ISO; padrão: data atual em São Paulo |

Todos são de servidor e derivam da mesma leitura em cache.

Parâmetro inválido produz erro de validação. Falha do banco produz `CatalogUnavailableError`. Lista vazia é reservada ao resultado legítimo.

Ordenação: posição aplicável, `sort_order` quando necessário e `id` como desempate.

## Server versus Client

| Local | Responsabilidade |
|---|---|
| Server Components | Catálogo e páginas de produto |
| Route Handlers | Eventos e invalidação protegida |
| Client Components | Interação, contexto de atribuição e envio best-effort |
| Edge | Proteção/CDN da hospedagem; sem lógica de banco própria |

Não haverá cliente Supabase no navegador por necessidade desta V1.

# 11. Estrutura de arquivos

Todos os caminhos são relativos ao **futuro checkout** em `C:\dev\CaiaoOficina`.

```text
src/
  app/
    api/
      events/route.ts
      internal/revalidate/route.ts
    layout.tsx
    page.tsx
    produto/[slug]/page.tsx
  lib/
    env/server.ts
    affiliate/urls.ts
    supabase/
      public-server.ts
      admin-server.ts
      database.types.ts
    catalog/
      types.ts
      queries.ts
      server.ts
    tracking/
      schema.ts
      context.ts
      client.ts
      server.ts
      handler.ts
    observability/logger.ts

scripts/
  import-products.ts
  replace-affiliate-link.ts
  provision-storage.ts
  revalidate-catalog.ts
  rollback-import.ts
  maintain-events.ts
  lib/
    parse-products.ts
    import-plan.ts
    images.ts
    admin-env.ts

supabase/
  migrations/
    20261007000100_catalog.sql
    20261007000200_click_events.sql
    20261007000300_catalog_operations.sql

tests/
  affiliate-urls.test.ts
  tracking-schema.test.ts
  env.test.ts
  import-products.test.ts
  images.test.ts
  catalog.test.ts
  tracking-handler.test.ts
  tracking-client.test.ts
  revalidation.test.ts
  db/
    harness.ts
    schema.test.ts
    rls.test.ts
    operations.test.ts
  e2e/
    catalog.spec.ts
    outbound-click.spec.ts
    tracking-failure.spec.ts

public/
  images/product-placeholder.svg

docs/
  backend.md
  product-import.md
  frontend-contract.md
  operations.md
  validation.md
  ESTADO_ATUAL.md
  superpowers/plans/2026-10-07-caiao-oficina-backend.md

private/
  imports/
  reports/

.env.example
.gitignore
package.json
package-lock.json
tsconfig.json
next.config.ts
vitest.config.ts
playwright.config.ts
```

`layout.tsx`, `page.tsx` e página de produto pertencem ao frontend. Se o Claude já os tiver criado, serão reaproveitados.

O arquivo `src/app/go/[slug]/route.ts` **não faz parte da árvore padrão**.

# 12. Migrations

Os nomes abaixo são propostos porque ainda não existe convenção no repositório. Antes de criar, verificar se surgiu histórico novo.

| Migration | Objetos | Dependência | Risco e rollback |
|---|---|---|---|
| M01 — `catalog` | Cinco tabelas do catálogo, categorias iniciais, singleton, índices, triggers utilitários, RLS e grants | Nenhuma de negócio | Baixo no banco vazio; após dados, correção aditiva |
| M02 — `click_events` | Eventos, FKs, checks, índices e bloqueio público | M01 | Baixo antes de uso; não apagar eventos para reverter |
| M03 — `catalog_operations` | Quatro RPCs, privilégios e revisão dos grants aplicáveis | M01 e M02 | Médio; conferir funções e restaurar versão anterior por migration corretiva |

Cada migration aplica objetos e segurança na mesma transação. Nenhuma tabela passa por uma etapa pública de escrita.

Bucket é um recurso provisionado pela API, não uma criação manual de tabelas do Storage.

Migrations aplicadas não serão editadas retrospectivamente.

# 13. Plano de testes

| Área | Caso | Resultado obrigatório |
|---|---|---|
| Banco | Produto inativo mínimo válido | Aceito |
| Banco | Slug/import key duplicado | Recusado |
| Banco | FK inexistente | Recusado |
| Banco | Ativo sem imagem/descrição | Recusado |
| Banco | Segundo link vigente | Recusado |
| Banco | Editar URL de versão existente | Recusado |
| Banco | Produto A com link B | Recusado |
| Banco | Duas trocas concorrentes | Uma aplica; outra acusa conflito |
| Importador | Arquivo válido | Plano correto |
| Importador | BOM, CRLF e vazios | Interpretados corretamente |
| Importador | URL inválida/domínio enganoso | Nenhuma escrita |
| Importador | Duplicata idêntica | Não cria segundo produto |
| Importador | Segunda execução | No-op |
| Importador | Nome igual, URL diferente | Ambiguidade sinalizada |
| Importador | Falha no último item | Lote inteiro desfeito |
| Importador | Edição concorrente | Não sobrescrita |
| Catálogo | Produto oculto | Não aparece |
| Catálogo | Ativo sem vínculo publicável | Não aparece |
| Catálogo | Banco falha | Erro, sem lista vazia falsa |
| Catálogo | Cache muito antigo + banco falha | Indisponibilidade |
| Tracking | Mesmo evento repetido | Uma linha |
| Tracking | Link encerrado da mesma identidade | Versão antiga preservada |
| Tracking | Referência incompatível | `400` |
| Tracking | Timeout | `503` |
| Tracking | Payload > 4 KiB | `413` |
| Segurança | INSERT/UPDATE/DELETE com papel público | Bloqueado |
| Segurança | RPC administrativa com papel público | Bloqueada |
| Segurança | Invalidação sem secret | `401` |
| Segurança | Secret no bundle | Gate falha |
| Frontend | API de eventos indisponível | Link continua navegável |
| Frontend | JavaScript desativado | Link continua navegável |
| Frontend | Teclado/nova aba | Navegação correta, sem contagem duplicada |
| Frontend | Reload/preview | Não gera clique |
| Imagens | Arquivo inválido ou associação ambígua | Publicação bloqueada |
| Imagens | Imagem quebrada | Fallback |
| `/go`, condicional | Casos da seção 7 | Executados somente se a alternativa for aprovada |

Testes de navegação interceptam a saída externa para não gerar cliques artificiais nos links reais.

PGlite cobre banco localmente. PostgREST e SQL remoto confirmam comportamento específico do Supabase; fixtures SQL ficam em transação com rollback.

# 14. Documentação

| Documento | Conteúdo |
|---|---|
| `backend.md` | Schema, RPCs, RLS, ambiente e limites |
| `product-import.md` | TXT, manifest, dry-run, códigos de saída e exemplos |
| `frontend-contract.md` | DTOs, helpers, eventos, cache e erros |
| `operations.md` | Edição cotidiana, troca de link, invalidação, retenção e rollback |
| `validation.md` | Comandos, resultados, medições e pendências |
| `ESTADO_ATUAL.md` | Fonte única do estado; `[VALIDADO]`, `[NÃO VALIDADO]`, `[PENDENTE]` |
| Plano aprovado | Ordem e checkpoints da execução |

Logs mínimos:

- `import.completed`: batch, criados, alterados, ignorados e pendências.
- `catalog.failed`: classe/código do erro e duração.
- `tracking.failed`: código, request ID e duração.
- `cache.revalidated`: sucesso/falha.
- `affiliate_link.replaced`: IDs, sem URL integral.
- `maintenance.completed`: janela e quantidades.

Não registrar body integral, secrets, IP, referrer completo ou cada clique bem-sucedido.

**Retenção:** eventos brutos por 90 dias. `maintain-events.ts` terá dry-run padrão, exportação administrativa antes de limpeza e execução manual mensal na V1. Arquivos exportados também precisam de prazo de descarte. Não será alegada limpeza automática sem agendador.

# 15. Handoff para Claude Code

## CONTRATO PARA O AGENTE DE FRONTEND

> **Projeto:** Caião da Oficina. A V1 exibe aproximadamente 50 produtos e encaminha ao Mercado Livre.
>
> **Estado:** este contrato está planejado. Os arquivos e funções só estarão disponíveis após a execução do backend.
>
> **Importar do servidor:** `src/lib/catalog/server.ts`.
>
> **Tipos públicos:** `src/lib/catalog/types.ts`.
>
> **Helpers:** `getCatalog`, `getProducts`, `getCategories`, `getFeaturedProducts`, `getProductsByCategory`, `getProductBySlug`, `getDailyPicks`.
>
> **Produto público:** ID, slug, nome, descrição curta, imagem com dimensões, categorias, posições editoriais e oferta vigente com ID da versão e URL oficial.
>
> **Navegação:** usar `<a>` normal para `affiliateUrl`. Não esperar a resposta do tracking. Não acrescentar parâmetros próprios ao link oficial.
>
> **Tracking:** usar `trackClick` de `src/lib/tracking/client.ts`. Informar produto, versão exibida, CTA, posição e contexto permitido. Não enviar URL arbitrária nem escolher `quality`.
>
> **Rotas backend:** `POST /api/events`. A rota interna de invalidação é administrativa e não deve ser utilizada pelo navegador.
>
> **Redirect:** `/go/[slug]` não estará disponível na V1 padrão.
>
> **Página de produto:** rota prevista `/produto/[slug]`; o helper retorna `null` para ausente/oculto. Falha operacional é um erro separado.
>
> **Cache:** compartilhar a DAL; não criar fetches duplicados nem cache adicional de HTML que invalide o controle de idade.
>
> **Campanhas:** preservar contexto em navegação interna. Não presumir vídeo de origem para acesso genérico da bio.
>
> **Imagens:** usar dimensões fornecidas, lazy loading apropriado e fallback em caso de erro.
>
> **Pode alterar:** componentes visuais, estilos, animações, responsividade, layout e apresentação das mensagens.
>
> **Não alterar sem coordenação:** migrations, policies, RPCs, DTOs, semântica dos estados, URLs oficiais, configuração de secrets ou campos de tracking.
>
> **Não importar no cliente:** `admin-server.ts`, ambiente de servidor ou módulos administrativos.
>
> **Critério essencial:** tracking indisponível não interrompe navegação.

Esse bloco pode ser encaminhado por você; nenhum outro chat será contatado automaticamente.

# 16. Ordem exata de execução

1. Receber o Prompt 3 e os materiais.
2. Confirmar checkout, instruções locais e alterações recentes.
3. Conferir IDs, schema remoto e migrations atuais.
4. Preparar/reaproveitar a base Next.js no local correto.
5. Fixar dependências, configuração e comandos de teste.
6. Implementar contratos e validadores puros.
7. Escrever testes de schema e permissões.
8. Criar M01 e M02.
9. Validar migrations no PGlite.
10. Escrever testes das operações transacionais.
11. Criar M03 e validar concorrência/idempotência.
12. Capturar baseline e aplicar migrations pelo MCP.
13. Conferir segurança remota com rollback das fixtures.
14. Gerar tipos do banco.
15. Implementar parser e planejamento do importador.
16. Preparar manifest, associação de imagens e dry-run.
17. Provisionar Storage e enviar arquivos validados.
18. Aplicar lote e comprovar segunda execução sem alterações.
19. Implementar DAL e cache.
20. Implementar invalidação administrativa.
21. Implementar endpoint de eventos.
22. Implementar captura e propagação do contexto no cliente.
23. Entregar contrato ao frontend.
24. Integrar pontos funcionais sem definir design.
25. Configurar/verificar proteção do endpoint na hospedagem.
26. Executar gates de testes, tipos, lint e build.
27. Homologar navegação, segurança e desempenho.
28. Consolidar documentação e relatório.
29. Revisar diff e ausência de credenciais.
30. Fazer commits explícitos das entregas concluídas.
31. Registrar decisões/status no Segundo Cérebro.
32. Entregar prontidão do backend e pendências de lançamento.

A alternativa `/go` não entra silenciosamente nessa sequência.

# 17. Checkpoints

| Checkpoint | Exigência | Não avançar quando |
|---|---|---|
| A — Preparação | Recursos corretos, contratos e entradas identificados | Projeto errado, drift desconhecido ou material ambíguo |
| B — Banco local | Constraints, RLS e transações passando | Escrita pública possível ou histórico mutável |
| C — Banco remoto | Schema e grants efetivos conferidos | Divergência do que foi testado |
| D — Importação | Dry-run completo e imagens associadas | Duplicatas/conflitos não resolvidos |
| E — Catálogo | DTO consistente e publicação filtrada | Dados incompletos expostos ou erro confundido com vazio |
| F — Tracking | Eventos corretos e link independente | Navegação depende da telemetria |
| G — Homologação | Gates verdes e proteção de endpoint validada | Secret exposto, eventos duplicados ou falha crítica |
| H — Entrega | Documentação e estado verificáveis | Comportamento declarado validado sem ter sido exercitado |

Pendências de material impedem a publicação dos registros afetados; não justificam inventar links ou imagens.

# 18. Rollback

| Mudança | Recuperação segura |
|---|---|
| Arquivos | Reverter somente commits/arquivos da tarefa, preservando trabalho externo |
| Migration ainda não aplicada | Corrigir antes de aplicar |
| Migration aplicada, sem dados | Reversão controlada se realmente necessária |
| Migration com dados/histórico | Migration corretiva aditiva; não apagar tabelas |
| Grants/policies | Restaurar baseline por migration; fechar acesso antes de diagnosticar vazamento |
| RPC | Restaurar corpo anterior por migration, mantendo assinatura compatível |
| Produtos novos importados | Desativar os registros do lote; não apagar identidades utilizadas |
| Produtos alterados | Restaurar campos somente se não houver edição posterior |
| Link alterado | Criar nova versão com destino anterior; manter todas as versões |
| Upload falho | Não alterar referência no produto |
| Imagem nova já referenciada | Restaurar `image_path` anterior; limpar arquivo só depois de verificar referências |
| Cache | Invalidar novamente após restaurar dados |
| Tracking | `TRACKING_ENABLED=false`; navegação continua |
| Eventos de teste | Excluir apenas registros identificados como teste e listados no relatório |
| Endpoint com abuso | Limitar/desativar coleta, preservando catálogo e links |

Não existe rollback seguro universal baseado em “apagar tudo”. O relatório antes/depois e os IDs do lote são parte obrigatória da importação.

# 19. Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Implementação concorrente do Claude | Média | Alto | Conferir arquivos antes de criar e delimitar ownership |
| Imagem associada ao produto errado | Média | Alto | Manifest explícito; sem associação pela ordem dos anexos |
| Link oficial incompatível com allowlist presumida | Média | Médio | Derivar formatos dos materiais reais |
| Uso de `/go` sem autorização aplicável | Alta se habilitado sem revisão | Crítico | Alternativa desabilitada |
| Edição direta quebrar publicação | Média | Médio | Consulta publicável e auditoria de pendências |
| Reimportação sobrescrever edição recente | Média | Alto | Dry-run e controle de versão |
| Tracking receber spam válido em formato | Média | Médio | Rate limit, limites de payload, qualidade e kill switch |
| Banco/hosting sem capacidade para rajada | Média | Alto | Cache, homologação e verificação do plano disponível |
| Credencial de servidor indisponível | Indeterminada | Alto para operação da API | Conferir acesso seguro na preparação |
| Falha de cache/invalidação | Média | Médio | Controle de idade, teste e operação administrativa |
| Permissões locais diferirem do Supabase | Média | Alto | Conferência remota e PostgREST |
| Código dentro do OneDrive | Alta se mantido ali | Médio | Checkout em `C:\dev` |
| UI não concluída ao entregar backend | Possível | Alto para lançamento | Separar conclusão do backend de publicação do produto |

# 20. Itens que dependem de mim

Os materiais já anunciados por você serão aguardados no Prompt 3:

- Imagens e links dos produtos.
- Aprovação ou ajustes deste plano.
- URL/modalidade do WhatsApp, se o CTA entrar no lançamento.
- Associação de imagens somente quando não puder ser determinada pelos materiais.
- Confirmação de uso autorizado das imagens e informações fornecidas.
- Domínio final e situação das mídias no programa, antes da divulgação.
- Caso a credencial de servidor não esteja acessível na execução, disponibilizá-la pelo mecanismo seguro do ambiente, sem colar secret no chat.
- Autorização específica do programa apenas se você desejar habilitar `/go`.

Não será solicitado que você rode migrations, crie tabelas, gere tipos ou execute o importador: essas ações cabem à execução autorizada.

# 21. Confirmação final de prontidão

**AINDA NÃO PRONTO PARA EXECUÇÃO.**

O plano está pronto para revisão. A execução depende do **Prompt 3**, da aprovação desta proposta e dos materiais que você informou que enviará. Credenciais e configuração operacional serão verificadas na preparação.

Nenhum arquivo, tabela, migration, função, configuração ou commit foi criado ou alterado. **Aguardo o próximo prompt com as imagens e os links.**

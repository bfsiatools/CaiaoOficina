# Banco e fronteiras de acesso

Projeto exclusivo: `CaiaoOficina`, ref `lyhybytsfbdiodtsytqc`, região `sa-east-1`, org `jwldvpgfkutrqisimgzr`. Tabelas preexistentes: zero. Recursos de outros projetos não foram alterados.

Cinco migrations versionadas em `supabase/migrations/`, com os mesmos timestamps do histórico remoto. As três primeiras criam schema, eventos e operações; a quarta adiciona `redirect`; a quinta incorpora categorias à revisão do produto e retorna prova atômica do lote. Tipos gerados em `src/lib/supabase/database.types.ts`; DTO público independente em `src/lib/catalog/types.ts`.

| Tabela | Responsabilidade |
|---|---|
| products | UUID e import_key estáveis; slug editorial único; estado, ordem e dados de imagem |
| categories | Categorias publicáveis; quatro categorias iniciais |
| product_categories | Associação N:N, PK composta e índice reverso |
| affiliate_links | Versões imutáveis de URL e IDs disponíveis; uma versão atual por produto |
| site_settings | Linha singleton; WhatsApp desabilitado até URL real ser informada |
| click_events | UUID do evento, versão do link, contexto e categorias no recebimento |

Ativar produto exige descrição, imagem/alt/dimensões. O snapshot exige também categoria ativa e link atual. Não há preço ou comissão fictícios. `marketplace_item_id` usa apenas os IDs presentes no relatório recebido; catalog/seller IDs ausentes continuam null.

RLS habilitado nas seis tabelas. `anon`/`authenticated` só leem produtos/categorias/associações ativos e links atuais de produtos ativos; colunas administrativas não têm grants públicos. Não escrevem tabelas nem leem eventos. `service_role` realiza manutenção pelo servidor. Grants de RPC são explícitos e removidos também de anon/authenticated, não só de PUBLIC.

| RPC | Acesso e contrato |
|---|---|
| get_public_catalog() | Público; snapshot consistente em um comando, SECURITY INVOKER |
| apply_product_batch(uuid,jsonb) | Serviço; transação de até 100 linhas; created/updated/ignored, after e changed_keys atômicos; conflitos de versão abortam o lote |
| replace_affiliate_link(uuid,uuid,jsonb) | Serviço; bloqueia produto, verifica versão esperada, encerra anterior e cria nova |
| record_click_event(jsonb) | Serviço; recebimento no relógio do DB, snapshot de categorias, deduplicação por event_id |

A FK `(affiliate_link_id, product_id)` impede cruzar link de outro produto. Cliques de aba antiga mantêm a versão antiga. Repetição idêntica de event_id retorna duplicate; payload divergente retorna conflito. Índices cobrem unicidade de identidade/slug/link atual, relações e tempo/produto/content_id dos eventos.

Trigger de product_categories atualiza a revisão do produto em INSERT/UPDATE/DELETE, inclusive no Dashboard. Writers disputam a trava do produto; conflitos/deadlocks abortam a transação em vez de apagar silenciosamente a edição. after é capturado antes do commit enquanto a trava está mantida; changed_keys identifica somente linhas efetivamente alteradas.

O advisor INFO `rls_enabled_no_policy` em click_events é intencional: nenhuma policy pública e nenhum grant público. [Descrição do linter](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy). O event trigger existente `rls_auto_enable()` foi preservado, com grants de execução desnecessários revogados.

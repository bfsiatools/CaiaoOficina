# Caião da Oficina — execução do plano aprovado

**Goal:** executar o plano integral arquivado em `2026-10-07-caiao-oficina-backend.md`, atualizado pelos pedidos da Fase 3 e pela quantidade confirmada de 47 produtos.
**Architecture:** Next.js Node, seis tabelas Supabase, Storage, importador transacional e DTO público separado dos tipos gerados.
**Spec:** `../specs/2026-10-07-caiao-oficina-brainstorm.md` e briefing da Fase 3 fornecido por Bernardo.
**Global Constraints:** preservar URLs e dados reais; não subir servidores; não redesenhar frontend; nenhum secret no cliente; preservar recursos de outros projetos.
**Review Focus:** reimportação preservar edição; concorrência de links; clique de aba antiga preservar versão; analytics não bloquear redirect; erro de catálogo não virar vazio.

### Task 1: Preparação e fronteiras
Corresponde às tarefas 0.1 e 0.2 do plano aprovado. Fixar versões, validar URLs, ambiente e payloads; testes RED→GREEN. Expected: typecheck, lint e testes das fronteiras passando.
### Task 2: Schema e RLS
Corresponde a 1.1: M01/M02, seis tabelas, constraints, triggers e policies. Expected: PGlite verifica constraints e bloqueio público.
### Task 3: RPCs e banco remoto
Corresponde a 1.2/1.3: quatro RPCs, transações, grants explícitos; aplicar pelo MCP e conferir com rollback, gerar tipos. Expected: idempotência, histórico imutável e privilégio efetivo.
### Task 4: Assets e importação real
Corresponde a 2.1–2.3: adaptar parser ao TXT real `Nome:https://...`, manifest explícito, PNG→WebP, Storage, dry-run, aplicação, segunda execução. Expected: 47 produtos reais associados, zero duplicação.
### Task 5: DAL e cache
Corresponde a 3.1/3.2: DTO validado, snapshot, helpers, TTL/idade e invalidação administrativa. Expected: falhas explícitas e dados publicáveis.
### Task 6: Tracking e redirect
Corresponde à fase 4 e alternativa /go requisitada na Fase 3: coleta restrita, UTMs, /go seguro sem bloquear conversão, flag de habilitação. Expected: 302, 404, 503, HEAD sem evento e falha de tracking preservando redirect.
### Task 7: Integração e homologação
Corresponde às fases 5/6: base funcional mínima sem design, testes de rota e banco reais, E2E em localhost iniciado por Bernardo ou URL configurada. Expected: gates e evidência separados por nível de validação.
### Task 8: Documentação e entrega
Corresponde à fase 7: operação, rollback, retenção, handoff, revisão independente final, commits e memória. Expected: estado honesto e pendências reais registradas.

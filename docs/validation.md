# Evidência em 2026-10-07

## Estado real

| Medida | Resultado |
|---|---:|
| Produtos esperados | 47 |
| Produtos reais importados | 47 |
| Produtos ativos/publicados no catálogo | 47 |
| Links atuais sintaticamente válidos | 47 |
| Imagens locais válidas/preparadas | 47 |
| Imagens enviadas ao Storage | 47 |
| Duplicações | 0 |
| Erros na entrada/auditoria de assets | 0 |

TXT e relatório correspondem por URL; arquivos foram auditados por hash/dimensões e conferidos visualmente em quatro contact sheets privadas. Validação sintática de URL não confirma disponibilidade comercial do anúncio.

Banco: seis tabelas com RLS, quatro migrations aplicadas, quatro RPCs, grants públicos efetivos verificados. Teste remoto transacional com rollback confirmou insert/no-op, dedup, visibilidade e bloqueio de escrita/colunas/RPCs. Lote real em staging criou 47 registros e a repetição ignorou os mesmos 47. Não houve fixtures persistidas como catálogo final.

Dry-run de publicação no banco real: 0 created, 47 updated, 0 ignored, sem erros. Apply confirmado depois do upload; segundo apply: 0 created, 0 updated, 47 ignored. Zero duplicação de slug/link e zero produto apontando para objeto ausente. Bucket público, MIME image/webp, limite 2097152 bytes.

## Gates

- Testes Vitest: 48 testes locais, incluindo Postgres/PGlite, parser/imagens, CLI, handlers e cliente; executar novamente após revisão.
- Lint/typecheck/build: passaram antes da revisão; registrar novamente no fechamento.
- HTTP em localhost iniciado por Bernardo: catálogo real com 47 cards; quatro testes Playwright passaram. Três /go retornaram 302 e a URL exata do respectivo produto; desconhecido 404. Navegação no anchor sem JavaScript alcançou o handler real. Destino externo foi interrompido após verificar Location.
- Teste HTTP de eventos: primeira chamada 202, repetição 202, quality forjada 400; banco tem exatamente uma linha com quality test, link correto, UTM/content_id e snapshot de categoria. Eventos de homologação ficam separados por quality test.
- Bundle do cliente: verificar com `npx tsx scripts/check-client-bundle.ts` após build; busca nomes de variáveis privadas, não substitui gestão de segredos.
- `npm audit --omit=dev`: zero alertas. Audit completo: cinco entradas high na cadeia de lint (uma causa braces); fix sugerido exige downgrade incompatível de eslint-config-next. Vitest atualizado para 4.1.11 para corrigir advisory moderate.

Backend homologado em localhost, sem deploy público. O teste garante o destino salvo enviado pelo app, não disponibilidade/venda no Mercado Livre. Em uma navegação antes de corrigir a interceptação, o provedor mostrou página de erro; não substituir os links fornecidos por links inventados. Confirmar disponibilidade/comportamento do programa antes do lançamento. WhatsApp não informado continua desabilitado. Hosting/WAF/domínio e liberação comercial da flag de redirect são configurações de lançamento.

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

Banco: seis tabelas com RLS, cinco migrations aplicadas, quatro RPCs, grants públicos efetivos verificados. Teste remoto transacional com rollback confirmou insert/no-op, dedup, visibilidade e bloqueio de escrita/colunas/RPCs. Depois da revisão, outro rollback remoto comprovou snapshot atômico e rejeição de edição concorrente de categoria. Nenhuma fixture permaneceu no banco. Lote real em staging criou 47 registros e a repetição ignorou os mesmos 47.

Dry-run de publicação no banco real: 0 created, 47 updated, 0 ignored, sem erros. Apply confirmado depois do upload; segundo apply: 0 created, 0 updated, 47 ignored. Zero duplicação de slug/link e zero produto apontando para objeto ausente. Bucket público, MIME image/webp, limite 2097152 bytes.

## Gates

- Testes Vitest: 54 testes locais, incluindo Postgres/PGlite, parser/imagens, CLI, handlers, cliente e fronteira de segredo; regressões da revisão e do scanner observadas falhando e depois passando.
- Lint/typecheck/build: PASS depois das correções, com revisão independente concluída e cinco achados corrigidos.
- HTTP em localhost iniciado por Bernardo: catálogo real com 47 cards; quatro testes Playwright passaram. Três /go retornaram 302 e a URL exata do respectivo produto; desconhecido 404. Navegação no anchor sem JavaScript alcançou o handler real. Destino externo foi interrompido após verificar Location.
- Teste HTTP de eventos: primeira chamada 202, repetição 202, quality forjada 400; banco tem exatamente uma linha com quality test, link correto, UTM/content_id e snapshot de categoria. Eventos de homologação ficam separados por quality test.
- Bundle do cliente: scanner após build procura nomes e valores reais das variáveis privadas; nenhum encontrado. Não substitui gestão de segredos.

47 imagens também foram baixadas pela URL pública e tiveram SHA-256 comparado com o manifesto; 47 correspondências de produto/nome/link/imagem, zero erro. Navegador mobile: 47 cards, imagem real carregada, zero pageerror. A base visual é descartável para a implementação do Claude.

Revisão final por contexto independente encontrou cinco Important: concorrência de categorias, snapshot de rollback, identidade de nova URL, dimensões antes de resize e log sanitizado. Todos corrigidos em uma fix pass com RED→GREEN; nenhum minor adiado. Relatório novo a3c5a282-4395-4fcb-8240-615f511fe787 já usa proofVersion=1; apply permaneceu 47 ignored.

Latência em 20 amostras aquecidas, localhost dev: RPC pública incluindo rede p95 94ms; resposta HTML completa p95 536ms (não é medição isolada da DAL); HEAD /go p95 144ms; POST de eventos p95 108ms. SQL do catálogo: p95 3,320ms no executor administrativo, não SLA de hosting. Produção requer medição no ambiente final; cache/DAL isolados não foram medidos separadamente.
- `npm audit --omit=dev`: zero alertas. Audit completo: cinco entradas high na cadeia de lint (uma causa braces); fix sugerido exige downgrade incompatível de eslint-config-next. Vitest atualizado para 4.1.11 para corrigir advisory moderate.

Backend homologado em localhost, sem deploy público. O teste garante o destino salvo enviado pelo app, não disponibilidade/venda no Mercado Livre. Em uma navegação antes de corrigir a interceptação, o provedor mostrou página de erro; não substituir os links fornecidos por links inventados. Confirmar disponibilidade/comportamento do programa antes do lançamento. WhatsApp não informado continua desabilitado. Hosting/WAF/domínio e liberação comercial da flag de redirect são configurações de lançamento.

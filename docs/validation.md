# Evidência em 2026-10-07

## Vitrine comercial — direção permanente

Redesign solicitado por Bernardo e implementado em main: hero amarelo com produtos reais, wordmark Caião, Manrope + DM Sans, oito destaques no leque automático do 21st.dev, CTAs “Conferir preço” com destino Mercado Livre visível, Instagram @caiaodaoficina no rodapé e Home sem avatar/badge de IA/monograma C. Aparência clara independente do tema do sistema. Avisos repetidos nos cards removidos; aviso breve sobre comissão permanece no hero e no rodapé. [Escopo e pendências comerciais](storefront-2026-10-07.md).

Validação: lint/typecheck/build PASS; 284 testes em 17 arquivos PASS e 11 E2E PASS (27,4 segundos na rodada final), com o servidor iniciado por Bernardo. Os testes de contraste escuro/laser da direção anterior foram substituídos pelos requisitos aprovados da vitrine clara, mantendo AA nos pares de texto e painel. Auditoria Axe da Home sem violações nos critérios AA cobertos pela ferramenta; larguras 320/360/390/768/1280 sem overflow da página. Leque manual/automático/pausa, centralização física após animação, foco e movimento reduzido exercitados. GSAP permitido somente no componente solicitado. Busca/filtros, 47 produtos reais, imagens, produto/categoria, três redirects exatos, navegação sem JS, fronteiras HTTP e tracking único preservados. Scanner do build: 16 chunks, zero nomes/valores privados encontrados. Aparelho real/navegador interno continuam pendentes; automação não equivale a uma auditoria completa de acessibilidade.

Sem alteração/importação de dados nesta etapa: 47 produtos/links/imagens reais existentes. Preços, descontos, estoque e prazo não foram inventados; dependem de integração atualizada. Capturas privadas `storefront-desktop.png`, `storefront-mobile.png`, `storefront-catalog-*.png` e `fan-*.png`. Sem push/deploy.

## Integração anterior consolidada em main

Frontend do Claude e backend do Codex unidos: 295 testes locais e oito E2E PASS; lint/typecheck/build e scanner de 15 chunks PASS. Home/layout/CSS do Claude preservados integralmente. Busca, filtros, imagens, rotas de produto/categoria, /go e beacon delegado exercitados em localhost:3000 iniciado por Bernardo. Banco confirmou eventos test com parâmetros e referências corretas. Apply idempotente com 47 ignored; 47 imagens públicas baixadas e com hash/associação conferidos novamente. Detalhes em [integration-2026-10-07.md](integration-2026-10-07.md). A evidência abaixo descreve a entrega anterior do backend.

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

Backend homologado em localhost, sem deploy público. O teste garante o destino salvo enviado pelo app, não disponibilidade/venda no Mercado Livre. Em uma navegação antes de corrigir a interceptação, o provedor mostrou página de erro. Três consultas HEAD diretamente aos links meli.la retornaram 403, impedindo validar automaticamente os destinos externos. Isso não comprova que o link falha em navegador comum; conferir manualmente links/perfil e compatibilidade do programa antes do lançamento. URLs fornecidas foram preservadas. WhatsApp sem URL real segue desabilitado. Hosting/WAF/domínio e liberação comercial da flag de redirect são configurações de lançamento.

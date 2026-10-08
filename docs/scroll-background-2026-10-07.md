# Background controlado pelo scroll — 2026-10-07

## Implementação

Implementado na versão consolidada `main`, em `C:\dev\CaiaoOficina`, sobre a revisão `daf1386`. O único diff existente no início era o arquivo gerado `next-env.d.ts`; o build o reconciliou sem restaurar código autoral. Bernardo iniciou o localhost no VS Code. Nenhum servidor foi iniciado, parado ou reiniciado pelo agente.

Criados:

- `src/components/sections/scroll-video-background.tsx`: uma mídia pausada, três etapas de conteúdo e controle de seek isolado.
- `tests/e2e/frontend/scroll-background.spec.ts`: cinco testes de scroll, CPU limitada e fallbacks.
- `public/background/ABRINDOACAIXA.mp4`, `CAIXAFECHADA.jpeg` e `CAIXAABERTA.jpeg`.
- Este relatório.

Modificados:

- `src/app/page.tsx`: mensagem principal → categorias existentes → leque de produtos reais → catálogo.
- `src/app/globals.css`: sticky, composição por breakpoint, vidro e transição para o catálogo.
- `src/components/layout/site-header.tsx`: variante translúcida da navegação na abertura.
- `src/components/sections/caio-strip.tsx`: hero compacto em vidro, preservando a copy e o CTA.
- `src/components/product/product-grid.tsx`: primeira linha sem `content-visibility:auto`, corrigindo deslocamento da área de clique ao entrar no catálogo; os demais cards continuam otimizados.
- `src/content/copy.ts`: orientação de scroll e identificação dos percentuais ilustrativos.
- `tests/fe/motion-rules.test.ts`: vidro agora permitido na folha de estilos da experiência solicitada; GSAP continua restrito ao leque.
- `PRODUCT.md`, `README.md`, `docs/validation.md`, `docs/storefront-2026-10-07.md` e `docs/frontend-handoff.md`: direção e evidência atualizadas.

Supabase, schema, importação, IDs, links, tracking e `/go` preservados. Catálogo final continua com 47 produtos reais, sem reimportação.

## Assets

Originais preservados em `C:\Users\berna\OneDrive\Desktop\CAIAODAOFICINA\background`.

| Asset final | Tamanho | Tratamento |
|---|---:|---|
| `C:\dev\CaiaoOficina\public\background\ABRINDOACAIXA.mp4` | 1.873.228 bytes | Cópia otimizada para seek; original de 1.325.097 bytes preservado |
| `C:\dev\CaiaoOficina\public\background\CAIXAFECHADA.jpeg` | 461.566 bytes | Cópia idêntica, SHA-256 conferido |
| `C:\dev\CaiaoOficina\public\background\CAIXAABERTA.jpeg` | 525.098 bytes | Cópia idêntica, SHA-256 conferido |

Vídeo original: aproximadamente 6,02 segundos no container, stream visual de 6 segundos, 1280×720, H.264 High, yuv420p, 24 fps, áudio AAC. Havia apenas um keyframe no início, o que exigia decodificar desde esse ponto em cada seek. FFmpeg disponível em ferramenta privada de QA gerou a cópia sem áudio, com CRF 18, keyframes a cada seis frames (0,25 segundo) e `faststart`. Sem nova dependência no runtime. Comparação SSIM dos frames: **0,997401**; inspeção visual dos frames também realizada. JPEGs têm 1376×768. Nenhum asset novo foi gerado; o MP4 é derivado do arquivo fornecido, não outra animação.

## Scroll

Região normal de **300svh**, formada por três etapas com `min-height:100svh`; alturas pequenas ou conteúdo maior podem expandi-la. Fundo `sticky; top:0; height:100svh`. A posição real da seção determina a progressão:

```text
progress = clamp(-section.top / (section.height - sticky.height), 0, 1)
currentTime = progress * (video.duration - 1/24)
```

A subtração mantém o seek no último frame válido. A referência de [HTMLMediaElement.currentTime](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/currentTime) explica o seek por atribuição ao tempo da mídia.

Scroll, resize, mudança de visibilidade e `seeked` apenas agendam um `requestAnimationFrame`. Medições e escrita no DOM acontecem no frame agrupado. Nenhum estado React é atualizado durante o scroll. Um novo seek aguarda o anterior terminar e diferenças menores que meio frame são ignoradas. Sem `autoplay`, `loop` ou reprodução autônoma. Subir a página volta aos frames anteriores.

## Responsividade

| Largura | Scroll 0/25/50/75/100% e retorno | Crop inspecionado | Overflow |
|---:|---|---|---|
| 320 | PASS | PASS | Ausente |
| 360 | PASS | PASS | Ausente |
| 375 | PASS | PASS | Ausente |
| 390 | PASS | PASS | Ausente |
| 430 | PASS | PASS | Ausente |
| 768 | PASS | PASS | Ausente |
| 1024 | PASS | PASS | Ausente |
| 1440 | PASS | PASS | Ausente |

Desktop amplo usa `cover`; tablet e celular usam `contain` com enquadramento lateral e posição vertical ajustados. Isso evita o corte da caixa em uma viewport vertical e preserva a proporção. O fundo acompanha o tom do asset e termina em gradiente claro localizado. Os destaques chegam sobre a caixa aberta; o catálogo assume a prioridade depois. Não há scroll hijacking nem bloqueio da entrada direta pelo CTA.

Capturas privadas `private/scroll-tools/qa-{largura}-{0,0.5,1}.png`: 24 combinações, inspecionadas individualmente ou nos contact sheets. Nos cinco tamanhos mobile, o hero ocupa a parte superior e a caixa a inferior; na etapa de categorias a caixa e os percentuais ficam expostos. Na etapa dos destaques os produtos assumem prioridade, com a caixa ainda ao fundo.

## Performance

- Um vídeo; sem biblioteca adicional para scrub, sem canvas ou sequência de imagens.
- Keyframes frequentes, áudio removido, cabeçalho MP4 antecipado e busca agrupada pelo decoder.
- Listeners passivos; cleanup de listeners, observer, frame agendado e mídia ao desmontar.
- Aba oculta não executa seek; ao retornar, a posição atual é reconciliada.
- Blur de 10px somente nos painéis principais; os sete cards do leque usam superfície translúcida sem sete filtros adicionais. Imagens dos produtos permanecem opacas.
- Reduced motion não baixa o MP4 e encurta as etapas.
- Viewport 390×844 com CPU limitada a 4×: wheel para baixo e para cima PASS. Duas amostras de seek no Chromium: 11,3ms e 4,6ms, registradas em `private/scroll-tools/seek-cpu4.json`. São amostras de seek, não benchmark de FPS nem prova de desempenho de aparelho real.

## Fallback

| Situação | Comportamento |
|---|---|
| Inicial/loading | `CAIXAFECHADA.jpeg` sob o vídeo e como poster; dimensões reservadas |
| Final | `CAIXAABERTA.jpeg`, com vídeo oculto no último estado |
| Erro de vídeo | Imagem fechada; imagem aberta ao fim do scroll; interface funcional |
| Reduced motion | Imagem aberta, sem fonte de vídeo; mudança de preferência em runtime exercitada |
| Sem JavaScript | Imagem fechada, hero/CTA e links normais do catálogo disponíveis |
| Sem suporte a backdrop-filter | Vidro recebe maior opacidade para legibilidade |

Camadas claras reais permanecem sob o vídeo; não existe estado de fundo vazio entre a carga e a primeira decodificação. Falha da DAL continua usando o estado de erro existente do catálogo, sem inventar produtos.

## Visual

Hero/header em vidro claro com opacidade de 78%/72%, blur de 10px, borda branca translúcida e sombra de 5%. O painel de categorias usa a mesma gramática. Cards de produto sobrepostos recebem 96% de opacidade para que os textos dos cards de trás não interfiram na leitura; o fundo continua aparente entre as superfícies e durante as etapas anteriores. Escala de z-index local: fundo 0, foreground 1; controles permanecem no componente do leque. Nenhuma camada preta pesada foi aplicada.

Os percentuais já estão nos assets fornecidos. A copy esclarece: “Percentuais ilustrativos. Confira as condições reais no anúncio.” Não representam descontos verificados dos 47 produtos e não alimentam preços, badges ou alegações de oferta no catálogo.

## QA e build

- Scroll para baixo: **PASS**, cinco pontos nas oito larguras.
- Scroll para cima: **PASS**, mesma sequência invertida, incluindo wheel com CPU limitada.
- Ausência de autoplay/loop e permanência pausada: **PASS**.
- Falha de vídeo, sem JS, reduced motion e mudança de preferência: **PASS**.
- Busca/filtros, produto/categoria, 47 produtos reais, links sem JS, três redirects, tracking único e fronteiras HTTP: **PASS**.
- Navegação adicional no browser por `/como-escolho` e `/privacidade`, em 390 e 1440 px: títulos corretos e sem overflow. Wheel no browser de inspeção avançou a mídia para 3,002s e retornou a 0s, sempre pausada.
- Axe: sem violações nos critérios AA exercitados pela automação da Home; não substitui auditoria completa.
- Lint: **PASS**.
- Typecheck: **PASS**.
- Testes locais: **284 PASS**, 17 arquivos.
- Playwright: **16 PASS**, rodada completa.
- Build: **PASS**.
- Scanner do cliente: **16 chunks**, nenhum nome ou valor privado encontrado.

## Pendências

- Testar em aparelho físico e no navegador interno do Instagram, incluindo Safari/iOS: Chromium emulado e CPU limitada não equivalem ao hardware real.
- Os dados de preço/desconto/estoque e a liberação comercial/domínio continuam pendências anteriores de lançamento; a animação não resolve esses dados.

Sem push ou deploy.

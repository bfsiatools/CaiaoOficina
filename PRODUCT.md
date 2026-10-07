# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pessoas no Brasil que acabaram de ver um vídeo curto (Instagram Reels, TikTok, YouTube Shorts) do Caio mostrando uma ferramenta, um item para o carro ou uma utilidade de casa/oficina. Chegam quase sempre pelo celular, pelo link da bio, dentro do navegador interno do app, com intenção específica ("quero aquele compressor") e pouca paciência. Um grupo menor chega sem produto em mente, querendo saber quem é o Caio e se dá para confiar.

## Product Purpose

Portal de curadoria do Caio da Oficina: reúne os produtos que o Caio mostra nos vídeos e leva o visitante ao anúncio no Mercado Livre por link de afiliado. Sucesso = o visitante reconhece o produto do vídeo em segundos e toca em "Ver no Mercado Livre". Objetivo secundário: trazer a audiência para o WhatsApp para os próximos achados.

## Positioning

Uma marca de creator, não uma loja: um personagem com rosto e voz seleciona poucos produtos úteis de ferramenta, carro e casa e mostra cada um em vídeo. O site é a bancada onde ficam os achados que ele já mostrou, em ordem de data, sem preço inventado e sem urgência.

## Operating Context

- Funil: vídeo -> perfil -> link da bio (um só) -> site -> CTA -> Mercado Livre (link de afiliado) -> compra.
- O visitante não traz contexto do vídeo pela bio; o vídeo do dia é marcado no banco (`daily_pick_date`). Links rastreáveis (Stories, YouTube, WhatsApp) podem levar `?p=<slug>` e UTMs.
- Bernardo opera tudo pelo computador com apoio de agentes: catálogo editado no Supabase Dashboard e em scripts; backend do Codex no mesmo repositório.
- Tráfego em rajadas logo após cada vídeo.

## Capabilities and Constraints

- Next.js 16 (App Router), React 19, Supabase. Acesso a dados só pela camada do Codex (`src/lib/catalog/server.ts`); tracking pelo endpoint do Codex.
- 47 produtos reais (confirmado). Cada um com 1 imagem de até 500 px (fundo branco do Mercado Livre), nome longo do anúncio, categoria e link oficial `meli.la`.
- Saída para o Mercado Livre por link oficial direto ou por `/go/[slug]`, conforme a flag `AFFILIATE_REDIRECT_ENABLED` (decisão de Bernardo; a cláusula 1.8 do programa restringe modificar o link).
- Termos do programa (ML 1.8, 1.10, 2.3, 5.3, 5.4): sem pop-up nem redirecionamento involuntário; sem comparação entre produtos; só informações presentes no anúncio; sem preço, estoque ou prazo que não estejam ativos na plataforma; domínio precisa ser aprovado como mídia.
- Sem checkout, conta, avaliações, preços ou recomendação automática.
- Undecided: responsável legal exibido (nome/CNPJ/e-mail); URL e tipo do WhatsApp; aprovação do domínio no programa; autorização de uso das imagens.

## Brand Commitments

- Nome exibido: **Caio da Oficina**. Instagram `@caiodaoficina`.
- O Caio é um personagem virtual criado com IA, brasileiro, ~32 anos, barba curta, camiseta escura, oficina organizada. A imagem canônica não é redesenhada nem regerada.
- Transparência: selo "Personagem criado com IA" visível na primeira tela; disclosure de afiliado visível junto do primeiro CTA.
- Verdade nas alegações: o site diz que os produtos são **selecionados**; **nunca** usa "testado", "melhor", comparações ou números inventados.
- Vetos visuais explícitos do dono: nada de preto+amarelo de construção, oficina suja, industrial pesado, tuning, marketplace, dropshipping, Linktree, SaaS genérico.

## Evidence on Hand

- `src/assets/caio/` (derivados da foto canônica `FOTODOCAIAO.jpeg` e de `CAIAOCOMCOMPRESSOR.jpeg`, Caio segurando o compressor).
- Catálogo real via DAL do Codex (47 produtos, importação em andamento).
- Nenhum depoimento, avaliação, número de vendas, preço ou resultado de teste existe. Não fabricar.

## Product Principles

1. O produto do vídeo vem primeiro: nada fica entre o visitante e o CTA.
2. Só fatos verificáveis: o que não está no anúncio não aparece.
3. Transparência é parte da marca, não nota de rodapé.
4. Rápido no celular barato, dentro do navegador do Instagram.
5. Curadoria visível: poucos itens, ordem de data, voz do Caio.

## Accessibility & Inclusion

WCAG 2.2 AA. Alvos de toque de 44 px ou mais, uso com uma mão, `prefers-reduced-motion`, leitura correta por leitor de tela de cada link de produto ("Ver no Mercado Livre, nome do produto").

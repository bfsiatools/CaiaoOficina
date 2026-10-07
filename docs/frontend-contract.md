# Contrato canônico do backend V1

Após a integração de 2026-10-07, frontend e backend estão consolidados em `main`, no checkout `C:\dev\CaiaoOficina`. O contrato abaixo continua válido; o adapter e o listener do frontend já o consomem. Branches anteriores são referências históricas.

O contrato completo e os exemplos de integração estão em [frontend-handoff.md](frontend-handoff.md). Este arquivo mantém o caminho esperado pelo Gate G2 do plano de frontend.

Gate G1: 47 produtos reais ativos, 47 links atuais e 47 objetos no Storage. Gate G2: DAL em `src/lib/catalog/server.ts`, tipos em `src/lib/catalog/types.ts`. Gate G3: `src/lib/tracking/client.ts`, API de eventos e redirect implementados. Gate G4: configuração local e localhost iniciados por Bernardo; homologação descrita em validation.md.

`trackClick(input): void` em `@/lib/tracking/client` recebe eventType, placement, ctaId e, para produto, productId/affiliateLinkId; pagePath é opcional (pathname atual). Gera UUID e contexto da página. É best-effort, não espera rede nem retorna estado da conversão. `redirect:true` impede tracking de cliente ao usar `/go`. Não monte listener delegado junto com TrackedAnchor para o mesmo CTA: escolha uma única coleta.

`CatalogUnavailableError` é exportado de `@/lib/catalog/queries`, não de server.ts. A integração adapta nomes em `src/features/catalog/load.ts`; backend não possui campos editoriais de vídeo/spec/preço. Respeitar branches/worktrees paralelos; não editar outro checkout nem arquivos de backend ao construir a interface.

# Contrato para o Claude Code

Fonte oficial consolidada em `C:\dev\CaiaoOficina`, branch `main`. O frontend do Claude já está integrado ao backend do Codex; próximos ajustes visuais devem partir de `main`, evitando reconstruir a integração no worktree antigo. `codex/backend-v1` e `claude/frontend-v1` foram preservadas como referências. OneDrive contém os materiais originais. Banco: 47 produtos reais ativos, 47 links e 47 imagens no Storage. Ver [auditoria de integração](integration-2026-10-07.md).

```text
Construir a interface final do Caião da Oficina usando a DAL existente.
Não consultar Supabase no browser nem modificar schema, RLS, importação ou RPCs.
Não inventar preço, estoque comercial, comissão, social URLs ou WhatsApp.
Não usar fixtures no catálogo final. Produtos, links e imagens vêm do DTO.
```

Imports de servidor em `@/lib/catalog/server`:

```ts
getCatalog(): Promise<CatalogSnapshot>
getProducts(): Promise<ProductCard[]>
getCategories(): Promise<Category[]>
getProductBySlug(slug: string): Promise<ProductCard | null>
getProductsByCategory(slug: string): Promise<ProductCard[]>
getFeaturedProducts(limit?: number): Promise<ProductCard[]> // 1..50, default 8
getDailyPicks(date?: string): Promise<ProductCard[]> // YYYY-MM-DD; São Paulo
```

Tipos em `@/lib/catalog/types`:

```ts
type Category = { id:string; slug:string; name:string };
type ProductCard = {
 id:string; slug:string; name:string; shortDescription:string;
 image:{url:string;alt:string;width:number;height:number};
 categories:Category[];
 offer:{id:string;marketplace:'mercado_livre';affiliateUrl:string};
 sortOrder:number;featuredRank:number|null;
 dailyPickDate:string|null;dailyPickRank:number;
};
type Product = ProductCard;
type CatalogSnapshot = {
 products:ProductCard[];categories:Category[];
 whatsapp:{enabled:boolean;url:string|null};generatedAt:string;
};
```

Rotas: `/`, `/categoria/[slug]`, `/produto/[slug]`, `/go/[slug]`, `POST /api/events`. IDs de produto e `offer.id` são UUIDs distintos. Sempre passe ambos no CTA. Preserve a versão de offer exibida; não substitua silenciosamente pela atual no cliente.

Tracking reutilizável em `@/lib/tracking/client`: `trackClick(input): void`, com eventType, placement, ctaId e productId/affiliateLinkId no clique de produto. pagePath opcional, UUID/contexto automáticos; `redirect:true` pula coleta de cliente. Se usar listener delegado do frontend, remova handlers de tracking do TrackedAnchor no mesmo CTA. ProductImage, internalQuery e productHref são exemplos funcionais adaptáveis. CTA normal `<a>`; jamais Next Link/prefetch em `/go`. Link direto mantém affiliateUrl intacta. UTMs só em URLs internas. Next/Image usa dimensões e alt do DTO, qualidade 85, domínio/path restritos; fallback é estado de erro visual, não imagem inventada.

Dados iniciais não têm featuredRank/dailyPickDate; seções editoriais podem ficar vazias até curadoria. WhatsApp fica oculto quando disabled ou sem URL. Erro da DAL lança CatalogUnavailableError: mostrar indisponibilidade/retry, não “zero produtos”. Produto inexistente retorna null e usa notFound().

Variáveis ficam no servidor: SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY (ou SERVICE_ROLE_KEY), SITE_URL, APP_ENV, TRACKING_ENABLED, AFFILIATE_REDIRECT_ENABLED, CATALOG_REVALIDATION_SECRET. Não usar NEXT_PUBLIC_ para segredo ou importar admin-server/env/server em Client Component. Nenhum acesso do frontend ao endpoint interno de invalidação.

Validate: lint/typecheck/test/build; depois E2E com localhost iniciado por Bernardo, 47 ativos e flags de preview habilitadas. Manter disclosure de afiliado. Não redesenhar fluxos de backend durante a implementação visual.

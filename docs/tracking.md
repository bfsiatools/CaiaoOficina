# Tracking de intenção de clique

`POST /api/events` aceita JSON estrito de até 4096 bytes e Origin igual ao SITE_URL. Sem tracking ou para automação óbvia/prefetch, retorna 204. Validação ruim 400, Origin inválido 403, Content-Type inválido 415, limite 429, referência inexistente 422, event_id divergente 409, persistência indisponível 503; sucesso/dedup 202.

Campos públicos: eventId, eventType (`product_click`/`whatsapp_click`), productId e affiliateLinkId no clique de produto, pagePath sem query/hash, placement, ctaId, utmSource, utmMedium, utmCampaign, utmContent, contentId, referrerHost, attributionMethod. Alias `video_id` só é usado sem content_id. Campos longos/control characters são descartados no contexto e rejeitados se enviados diretamente no payload. Não armazenamos IP, user-agent ou URL completa de referrer.

UUID por ação, dedup no DB; schema_version=1, received_at e category_snapshot definidos pelo servidor/DB. quality=`test` em preview, `accepted` em production. Cliente não pode enviar quality. Isso mede intenção, não venda nem comissão. UTM/referrer são declarativos, não autenticação do visitante.

CTA é anchor normal; sendBeacon e fallback fetch keepalive não bloqueiam navegação. Clique com JavaScript desligado segue para afiliado mesmo sem evento de cliente. Middle-click usa onAuxClick. Produto usando `/go` não envia evento de cliente: só o servidor registra, evitando dupla contagem.

## /go/[slug]

GET/HEAD: consulta snapshot fresco no banco (sem cache compartilhado), valida produto publicável e URL oficial salva. Nunca usa URL recebida em query. GET retorna 302 com Location exatamente preservado e Cache-Control no-store. Inexistente/inativo: 404. DB/URL inválida ou flag desligada: 503. HEAD, bots e prefetch não registram evento. after() executa tracking com timeout de 1500ms após a resposta; falha de tracking mantém redirect.

UTMs limitadas são transportadas apenas em navegação interna; não são anexadas ao link de afiliado. Destino permanece `meli.la` ou `mercadolivre.com.br` permitido, HTTPS, sem credenciais/porta arbitrária/CRLF.

Flag `AFFILIATE_REDIRECT_ENABLED` permite homologar preview. Em produção, só habilite após confirmar compatibilidade com o programa de afiliados. Enquanto desligada, CTA usa o link direto e coleta via cliente.

Rate limit em memória: 60 eventos/minuto por chave derivada de IP, janela 60s, mapa limitado a 5000 entradas; sal aleatório e nenhum IP persistido. É proteção complementar por processo, não limite distribuído. O proxy precisa controlar x-forwarded-for. Configure WAF no hosting para `/api/events`; em `/go`, descartar analytics deve preservar a navegação. Não há Redis ou fila.

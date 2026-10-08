# Vitrine comercial — 2026-10-07

Bernardo rejeitou a primeira Home por parecer uma divulgação discreta de links e confirmou que a nova direção substitui permanentemente a anterior. A referência enviada inspira uma composição de e-commerce clara, com imagens, espaço e CTAs evidentes; não replica a identidade da loja de móveis.

## Resultado

- Wordmark tipográfico Caião da Oficina e Instagram `@caiaodaoficina`, corrigido explicitamente por Bernardo nesta revisão. Instagram fica no rodapé, sem bloco de avatar/@ na abertura.
- Hero comercial amarelo com três fotos dos produtos reais, CTA para o catálogo e aviso breve: “Links comerciais: podemos receber comissão nas compras.”
- Manrope nos títulos e DM Sans na leitura; branco/papel, grafite e amarelo. A aparência permanece clara em sistemas configurados em dark mode.
- Leque baseado no prompt do 21st.dev, com GSAP 3.15.0 e oito produtos reais em sequência; até sete ficam visíveis. Contexto `?p=` e curadoria cadastrada vêm primeiro; a seleção é completada com o catálogo disponível, sem inventar datas, descontos ou popularidade. O componente foi adaptado à estrutura TypeScript/Tailwind/components/ui já existente e aos CTAs do catálogo, sem imagens de demonstração.
- Movimento lateral automático a cada 3,6 segundos, controles anteriores/próximos e pausa. Hover/foco suspendem a rotação; navegação manual ou foco num card pausam e centralizam o produto. Movimento reduzido usa navegação manual sem animação. Sem JavaScript, os cartões e links continuam disponíveis por rolagem horizontal. GSAP fica restrito ao leque, com cleanup e recálculo ao redimensionar.
- Cards com fotos inteiras dos produtos e botão amarelo “Conferir preço”, com nome e destino Mercado Livre identificados para leitores de tela. Selo de IA retirado da Home; a página Sobre mantém a descrição verdadeira do personagem.
- Busca, filtros, links afiliados, parâmetros de campanha, tracking e rotas de produto/categoria preservados. Nenhuma alteração de schema ou reimportação foi necessária.

Bernardo dispensou o link do Dribbble e confirmou o uso da referência do 21st.dev. “Vale a sua atenção” foi substituído por “Destaques da oficina”. Os avisos repetidos “Publi · link de afiliado · sem custo extra” saíram dos cards; permanece informação breve e visível sobre comissão no hero e no rodapé. A aplicação ao site do [guia primário do CONAR de 2026](https://conar.wpenginepowered.com/wp-content/uploads/2026/05/260525_GUIA_INFLUENCIADORES_CONAR_v6.pdf), que inclui remuneração por links de afiliado e orienta identificação comercial clara, é uma decisão de design; não uma declaração de homologação jurídica.

## Dados comerciais

O catálogo tem 47 conjuntos reais de produto/link/imagem e não contém preços, descontos, prazo de promoção ou estoque comercial. A integração anterior conferiu os 47 registros e os hashes das imagens. O redesign consome esses mesmos dados pela DAL e não introduz fixtures.

Existe uma rota oficial de preço de venda com autenticação: [API de preços do Mercado Livre](https://developers.mercadolivre.com.br/devcenter/api-de-precos). Ainda falta uma integração autorizada e cobertura dos IDs reais dos anúncios: 25 dos 47 estão mapeados atualmente. Serão necessários atualização/cache, instante de verificação e tratamento de promoção expirada antes de mostrar valores ou percentuais. Nenhuma credencial de API de preços foi fornecida nesta tarefa.

A [documentação de itens do Mercado Livre](https://developers.mercadolivre.com.br/es_ar/es_ar/items-y-busquedas) explica que `available_quantity` público é referencial por faixas: não sustenta uma alegação de “só uma unidade”. Prazo de oferta deve vir de uma promoção real; não há countdown reiniciado nem escassez fictícia. O CTA permite conferir as condições atuais na plataforma enquanto essa integração estiver ausente.

## Validação

Registro final em [validation.md](validation.md). QA no localhost iniciado e controlado por Bernardo. Capturas privadas em `private/integration-20261007/storefront-*.png` e `fan-*.png` cobrem abertura, leque e catálogo em desktop e mobile. E2E cobre 320/360/390/768/1280 px, sistema escuro, contraste/acessibilidade automática, leque manual/automático/pausa, centralização física após animação, foco e movimento reduzido, imagens reais, 47 produtos, busca/filtros, links de afiliado sem JavaScript, três destinos `/go` e tracking sem duplicação. Navegação externa é interrompida depois de verificar o destino; não houve compra.

## Relatório do catálogo

| Medida | Resultado |
|---|---:|
| Produtos esperados | 47 |
| Produtos importados | 47 existentes, consumidos sem nova importação |
| Links válidos | 47 sintaticamente; disponibilidade comercial depende do provedor |
| Imagens válidas | 47 reais associadas |
| Duplicações | 0 na auditoria da integração |
| Erros | 0 na auditoria dos dados |
| Pendências | Integração de preços/promoções/estoque verificável, liberação comercial/domínio, responsável e WhatsApp real |

Sem push, deploy ou servidor iniciado/parado pelo agente. O worktree antigo permanece como referência histórica. Aparelho real e navegador interno do Instagram ainda exigem homologação própria.

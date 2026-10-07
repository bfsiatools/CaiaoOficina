/** Todo o texto da interface. Nenhum componente escreve frase própria. */
export const COPY = {
  strip: { line: 'Os achados que eu mostro nos vídeos, num lugar só.', ai: 'Personagem criado com IA' },
  today: { title: 'Achados de hoje', titleFallback: 'Em destaque', pinned: 'Do vídeo que você viu' },
  pickDate: (label: string) => `Achado de ${label}`,
  recent: { title: 'Dos últimos vídeos' },
  cta: { label: 'Ver no Mercado Livre', sr: (name: string) => `, ${name} (abre o Mercado Livre)` },
  disclosure: {
    short: 'Publi · link de afiliado',
    grid: 'Links de afiliado do Mercado Livre: se você comprar, o Caio da Oficina recebe comissão, sem custo extra.',
  },
  catalog: { title: 'Todos os achados', count: (shown: number, total: number) => (shown === total ? `${total} produtos` : `${shown} de ${total}`), all: 'Todos', none: 'Ainda não há produtos por aqui.', filterLabel: 'Filtrar por categoria' },
  search: { label: 'Buscar produto', placeholder: 'Buscar produto', clear: 'Limpar busca', clearAll: 'Limpar filtros' },
  empty: { title: (q: string) => (q ? `Não achei "${q}".` : 'Nada nesta categoria.'), hint: 'Tente "furadeira", "pneu" ou "trena".', wpp: 'Sugerir um produto pelo WhatsApp' },
  wpp: { title: 'Receber os próximos achados', body: 'Um aviso no WhatsApp quando sair vídeo novo.', button: 'WhatsApp', footer: 'Receber os próximos achados no WhatsApp' },
  unavailable: 'Indisponível no momento',
  error: { title: 'Não consegui carregar os achados agora.', body: 'Pode ser a conexão ou o servidor. Tente de novo em alguns segundos.', retry: 'Tentar de novo' },
  how: {
    title: 'Como o Caio escolhe',
    points: [
      { title: 'Selecionados um a um', body: 'Os produtos são escolhidos por quem faz o Caio da Oficina e aparecem aqui em ordem de data.' },
      { title: 'Dados do anúncio', body: 'Nome, foto e números de cada produto vêm do anúncio no Mercado Livre. Preço muda lá, então não mostramos aqui.' },
      { title: 'Personagem criado com IA', body: 'O Caio é um personagem virtual. Quem responde pelo site é uma pessoa real.' },
    ],
    more: 'Saber mais',
  },
  footer: {
    affiliate: 'Os links de produto são de afiliado do Mercado Livre. Quando você compra por eles, o Caio da Oficina recebe uma comissão, sem custo extra para você.',
    ai: 'O Caio é um personagem criado com inteligência artificial.',
    privacy: 'Privacidade',
  },
  skip: 'Ir para os produtos',
} as const;

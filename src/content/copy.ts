/** Todo o texto da interface. Nenhum componente escreve frase própria. */
export const COPY = {
  strip: { eyebrow: 'Ferramentas · Carro · Casa', line: 'Seu próximo achado começa aqui.', body: 'Do reparo na oficina às soluções para casa. Encontre produtos úteis e confira o preço direto no Mercado Livre.', button: 'Explorar os achados', disclosure: 'Links comerciais: podemos receber comissão nas compras.' },
  today: { title: 'Achados de hoje', titleFallback: 'Destaques da oficina', pinned: 'Do vídeo que você viu', subtitle: 'Conheça a seleção e confira o preço no Mercado Livre.' },
  pickDate: (label: string) => `Achado de ${label}`,
  recent: { title: 'Dos últimos vídeos' },
  cta: { label: 'Conferir preço', destination: 'no Mercado Livre', sr: (name: string) => `, ${name} (abre o Mercado Livre)` },
  disclosure: {
    short: 'Links comerciais: podemos receber comissão nas compras.',
    grid: 'Você compra no Mercado Livre. Confira preço, frete e disponibilidade no anúncio.',
  },
  catalog: { title: 'Encontre o seu próximo achado', count: (shown: number, total: number) => (shown === total ? `${total} produtos` : `${shown} de ${total}`), all: 'Todos', none: 'Ainda não há produtos por aqui.', filterLabel: 'Filtrar por categoria' },
  search: { label: 'Buscar produto', placeholder: 'Buscar produto', clear: 'Limpar busca', clearAll: 'Limpar filtros' },
  empty: { title: (q: string) => (q ? `Não achei "${q}".` : 'Nada nesta categoria.'), hint: 'Tente "furadeira", "pneu" ou "trena".', wpp: 'Sugerir um produto pelo WhatsApp' },
  wpp: { title: 'Receber os próximos achados', body: 'Um aviso no WhatsApp quando sair vídeo novo.', button: 'WhatsApp', footer: 'Receber os próximos achados no WhatsApp' },
  unavailable: 'Indisponível no momento',
  error: { title: 'Não consegui carregar os achados agora.', body: 'Pode ser a conexão ou o servidor. Tente de novo em alguns segundos.', retry: 'Tentar de novo' },
  how: {
    title: 'Do achado à sua próxima solução',
    points: [
      { title: 'Encontre o que precisa', body: 'Explore a seleção ou busque por produto. Ferramentas, carro, casa e limpeza em um lugar só.' },
      { title: 'Confira o anúncio', body: 'O botão leva ao Mercado Livre. Consulte lá o preço atualizado, o frete e a disponibilidade.' },
      { title: 'Compre no Mercado Livre', body: 'Pagamento, entrega e atendimento da compra acontecem na plataforma. Aqui você encontra os links.' },
    ],
    more: 'Sobre a seleção e os links',
  },
  footer: {
    affiliate: 'Podemos receber comissão pelas compras feitas pelos links deste site.',
    ai: 'O Caio é um personagem criado com inteligência artificial.',
    privacy: 'Privacidade',
  },
  skip: 'Ir para os produtos',
} as const;

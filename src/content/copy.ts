/** Todo o texto da interface. Nenhum componente escreve frase própria. */
export const COPY = {
  strip: { eyebrow: 'Ferramentas · Carro · Casa', line: 'Seu próximo achado começa aqui.', body: 'Do reparo na oficina às soluções para casa. Encontre produtos úteis e confira o preço direto no Mercado Livre.', button: 'Explorar os achados', disclosure: 'Publi · links de afiliado · sem custo extra para você' },
  today: { title: 'Achados de hoje', titleFallback: 'Vale a sua atenção', pinned: 'Do vídeo que você viu', subtitle: 'Uma seleção para facilitar seu próximo projeto.' },
  pickDate: (label: string) => `Achado de ${label}`,
  recent: { title: 'Dos últimos vídeos' },
  cta: { label: 'Conferir preço', destination: 'no Mercado Livre', sr: (name: string) => `, ${name} (abre o Mercado Livre)` },
  disclosure: {
    short: 'Publi · link de afiliado',
    grid: 'Publi · links de afiliado. Você compra no Mercado Livre e o Caion da Oficina recebe comissão, sem custo extra para você.',
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
    affiliate: 'Os links de produto são de afiliado do Mercado Livre. Quando você compra por eles, o Caion da Oficina recebe uma comissão, sem custo extra para você.',
    ai: 'O Caio é um personagem criado com inteligência artificial.',
    privacy: 'Privacidade',
  },
  skip: 'Ir para os produtos',
} as const;

const SHORT: Record<string, string> = {
  'ferramentas-e-reparos': 'Ferramentas',
  automotivo: 'Carro',
  'casa-e-organizacao': 'Casa',
  'limpeza-e-cuidados': 'Limpeza',
  'medir-e-testar': 'Medir',
};

export function categoryLabel(category: { slug: string; name: string }): string {
  return SHORT[category.slug] ?? (category.name.length <= 14 ? category.name : `${category.name.slice(0, 13).trimEnd()}…`);
}

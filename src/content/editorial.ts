import type { Editorial } from '@/features/catalog/types';
import frameCompressor from '@/assets/caio/frame-compressor.webp';

/**
 * Camada editorial dos 47 produtos (chave = slug real do catálogo do Codex).
 * Regras travadas por `tests/fe/editorial.test.ts`:
 *  - displayName <= 40, tagline <= 90, no máximo 2 specs;
 *  - toda spec aparece no nome do anúncio (ML 5.4); tagline só com fato do anúncio;
 *  - sem superlativo, "testado", comparação, preço ou oferta (ML 5.3/5.4, CDC, CONAR).
 * Status: [NÃO VALIDADO] até Bernardo aprovar o texto.
 */
export const EDITORIAL: Readonly<Record<string, Editorial>> = {
  'calibrador-compressor-bomba-de-air-portatil-recarregavel-digital-com-luz-de-emergencia-led-872bd504': {
    displayName: 'Compressor portátil digital 150 psi',
    tagline: 'Recarregável e sem fio, com luz de emergência em LED.',
    specs: ['150 PSI', 'Sem fio'],
    searchTerms: ['compressor', 'calibrador', 'bomba de pneu', 'encher pneu', 'pneu', 'bike', 'moto'],
    aliases: ['compressor', 'compressor-portatil'],
    frame: frameCompressor,
  },
  'furadeira-parafusadeira-de-impacto-2-baterias-21v-46-pecas': {
    displayName: 'Parafusadeira de impacto 21 V',
    tagline: 'Vem com 2 baterias e 46 peças.',
    specs: ['21 V', '2 baterias'],
    searchTerms: ['furadeira', 'parafusadeira', 'bateria', 'furar', 'parafusar'],
    aliases: ['parafusadeira'],
  },
  'mini-ar-soprador-turbo-jet-fan-130000-rpm-portatil-sem-fio': {
    displayName: 'Mini soprador turbo sem fio',
    tagline: 'Portátil, com motor de 130.000 rpm.',
    specs: ['130.000 RPM', 'Sem fio'],
    searchTerms: ['soprador', 'turbo', 'poeira', 'secar', 'jet fan'],
    aliases: ['soprador'],
  },
  'camera-de-endoscopio-boroscopio-industrial-automotivo-5m': {
    displayName: 'Câmera endoscópio automotiva 5 m',
    tagline: 'Boroscópio de uso industrial e automotivo.',
    specs: ['5 m'],
    searchTerms: ['endoscopio', 'boroscopio', 'camera', 'inspecao', 'motor'],
    aliases: ['endoscopio'],
  },
  'kit-chave-catraca-soquete-46-pecas-indufer-em-cromo-vanadio-para-manutencao': {
    displayName: 'Kit catraca e soquetes 46 peças',
    tagline: 'Em cromo vanádio, da Indufer, para manutenção.',
    specs: ['46 peças', 'Cromo vanádio'],
    searchTerms: ['catraca', 'soquete', 'chave', 'mecanica', 'jogo de chaves'],
  },
  'nivel-a-laser-verde-16-linhas-com-tripe-1-2m-profissional-360-graus': {
    displayName: 'Nível a laser verde 16 linhas',
    tagline: 'Projeta em 360 graus e vem com tripé de 1,2 m.',
    specs: ['16 linhas', '360 graus'],
    searchTerms: ['nivel', 'laser', 'prumo', 'medir', 'obra', 'parede'],
    aliases: ['nivel-laser'],
  },
  'pistola-de-pintura-e-pulverizadora-eletrica-portatil-hvlp-1-250l-c-5-bicos-e-acessorios-8a942eca': {
    displayName: 'Pistola de pintura elétrica HVLP',
    tagline: '600 W, reservatório de 1,25 l e 5 bicos.',
    specs: ['600 W', '5 bicos'],
    searchTerms: ['pintura', 'pistola', 'pulverizador', 'pintar', 'tinta'],
  },
  'extratora-de-sujeira-portatil-wap-spot-cleaner-w3-borrifa-esfrega-e-extrai-1450w-de-14c0fa79': {
    displayName: 'Extratora de sujeira portátil WAP',
    tagline: 'Borrifa, esfrega e extrai, com bico de autolimpeza.',
    specs: ['1450 W'],
    searchTerms: ['extratora', 'estofado', 'sofa', 'tapete', 'banco do carro', 'limpeza'],
    aliases: ['extratora'],
  },
  'lavadora-de-alta-pressao-wap-ousada-plus-2200-1500w-de-potencia-1750-psi': {
    displayName: 'Lavadora de alta pressão WAP Ousada',
    tagline: 'Modelo Ousada Plus 2200, com 1500 W de potência.',
    specs: ['1750 PSI', '1500 W'],
    searchTerms: ['lavadora', 'lava jato', 'alta pressao', 'lavar carro', 'quintal'],
    aliases: ['lavadora'],
  },
  'trena-laser-mileseey-s6-profissional-40m-com-medicao-de-area-e-volume': {
    displayName: 'Trena a laser Mileseey S6 40 m',
    tagline: 'Mede também área e volume.',
    specs: ['40 m'],
    searchTerms: ['trena', 'laser', 'medir', 'medida', 'distancia'],
  },
  'mini-retifica-lixadeira-180w-muitos-acessorios-6-velocidades-potente-para-lixar-polir-128140a6': {
    displayName: 'Mini retífica 180 W com acessórios',
    tagline: '6 velocidades para lixar, polir e cortar.',
    specs: ['180 W', '6 velocidades'],
    searchTerms: ['retifica', 'lixar', 'polir', 'cortar', 'artesanato', 'gravar'],
  },
  'aspirador-de-po-portatil-wap-eco-rapido-com-iluminacao-led-vertical-2-velocidades': {
    displayName: 'Aspirador de pó vertical WAP',
    tagline: 'Portátil, com iluminação em LED e 2 velocidades.',
    specs: ['2 velocidades', 'LED'],
    searchTerms: ['aspirador', 'po', 'limpeza', 'casa', 'vertical'],
  },
  'chave-de-impacto-a-bateria-21v-1-2-pol-2400-rpm-bivolt-com-acessorios-e-maleta-the-black-tools': {
    displayName: 'Chave de impacto a bateria 21 V',
    tagline: 'Encaixe de 1/2", bivolt, com acessórios e maleta.',
    specs: ['21 V', '2400 RPM'],
    searchTerms: ['chave de impacto', 'parafusadeira', 'roda', 'pneu', 'porca', 'parafuso de roda'],
  },
  'multimetro-digital-amperimetro-desencapador-caneta-tensao': {
    displayName: 'Multímetro digital com caneta de tensão',
    tagline: 'Com amperímetro e desencapador de fios.',
    specs: [],
    searchTerms: ['multimetro', 'eletrica', 'tensao', 'voltimetro', 'amperimetro'],
  },
  'serra-eletrica-tico-tico-einhell-tc-js-60-e-220v': {
    displayName: 'Serra tico-tico Einhell TC-JS 60',
    tagline: 'Serra elétrica para cortes em madeira e chapas.',
    specs: ['220 V'],
    searchTerms: ['serra', 'tico tico', 'madeira', 'cortar', 'marcenaria'],
  },
  'kit-eletrica-chave-teste-digital-caneta-detectora-tensao-1': {
    displayName: 'Chave teste digital e caneta de tensão',
    tagline: 'Kit de elétrica com caneta detectora de tensão.',
    specs: [],
    searchTerms: ['chave teste', 'caneta', 'tensao', 'eletricista', 'tomada'],
  },
  'lanterna-led-tatica-mais-forte-do-mundo-2km-militar-potente': {
    displayName: 'Lanterna LED tática',
    tagline: 'Alcance de 2 km informado pelo fabricante no anúncio.',
    specs: ['2 km'],
    searchTerms: ['lanterna', 'led', 'camping', 'emergencia', 'tatica'],
  },
  'calibrador-de-pneus-eletronico-stok-air-m4000-com-tela-lcd-precisao-0-1-prateado': {
    displayName: 'Calibrador de pneus Stok Air M4000',
    tagline: 'Eletrônico, com tela LCD e precisão de 0,1.',
    specs: ['Tela LCD', 'Precisão 0,1'],
    searchTerms: ['calibrador', 'pneu', 'manometro', 'pressao', 'carro'],
  },
  'grampeador-tapeceiro-madeira-estofado-profissional-tapecaria-alta-pressao-com-2000-grampos': {
    displayName: 'Grampeador tapeceiro de alta pressão',
    tagline: 'Para madeira e estofado, já com 2000 grampos.',
    specs: ['2000 grampos'],
    searchTerms: ['grampeador', 'tapecaria', 'estofado', 'grampo', 'madeira'],
  },
  'chave-de-catraca-eletrica-1-2-portatil-21v-2-baterias-110-220v-bivolt-kit-completo-6d5f8c4c': {
    displayName: 'Catraca elétrica 1/2" 21 V',
    tagline: '2 baterias, bivolt, em kit com soquetes.',
    specs: ['21 V', '2 baterias'],
    searchTerms: ['catraca', 'catraca eletrica', 'soquete', 'mecanica', 'parafuso'],
  },
  'kit-parafusadeira-eletrica-68-em-1-precisao-usb-c-manutencao': {
    displayName: 'Parafusadeira de precisão 68 em 1',
    tagline: 'Elétrica, carrega por USB-C, para manutenção.',
    specs: ['68 em 1', 'USB-C'],
    searchTerms: ['parafusadeira', 'precisao', 'chave de precisao', 'eletronicos', 'manutencao'],
  },
  'paquimetro-digital-inox-150mm-digitos-grandes-certificado': {
    displayName: 'Paquímetro digital inox 150 mm',
    tagline: 'Dígitos grandes e certificado.',
    specs: ['150 mm', 'Inox'],
    searchTerms: ['paquimetro', 'medir', 'medicao', 'precisao'],
  },
  'trena-laser-digital-completa-profissional-100m-mileseey-x5': {
    displayName: 'Trena a laser Mileseey X5 100 m',
    tagline: 'Trena laser digital, versão completa.',
    specs: ['100 m'],
    searchTerms: ['trena', 'laser', 'medir', 'medida', 'distancia'],
  },
  'alicate-amperimetro-digital-fluke-305-cat-iii-e-iv-corrente-1000a': {
    displayName: 'Alicate amperímetro Fluke 305',
    tagline: 'Digital, categorias CAT III e IV, corrente de até 1000 A.',
    specs: ['1000 A', 'CAT III e IV'],
    searchTerms: ['alicate', 'amperimetro', 'fluke', 'eletrica', 'corrente'],
  },
  'scanner-automotivo-bluetooth-obd2-eml-327-android-ios-obdii': {
    displayName: 'Scanner automotivo OBD2 Bluetooth',
    tagline: 'Modelo 327, compatível com Android e iOS.',
    specs: ['OBD2', 'Bluetooth'],
    searchTerms: ['scanner', 'obd', 'obd2', 'diagnostico', 'injecao', 'carro', 'luz do motor'],
    aliases: ['scanner-obd2'],
  },
  'macaco-hidraulico-tipo-garrafa-2-toneladas-com-valvula-de-alivio-titanium-platina': {
    displayName: 'Macaco hidráulico garrafa 2 t',
    tagline: 'Tipo garrafa, com válvula de alívio.',
    specs: ['2 toneladas'],
    searchTerms: ['macaco', 'pneu', 'troca de pneu', 'carro', 'hidraulico'],
  },
  'kit-14-extrator-quebrada-porca-espanada-ferramentas-parafuso': {
    displayName: 'Kit extrator de parafuso',
    tagline: 'Para parafuso quebrado e porca espanada.',
    specs: ['Kit 14'],
    searchTerms: ['extrator', 'parafuso', 'espanado', 'porca', 'quebrado'],
  },
  'rebitadeira-manual-avento-bt-606-com-6-bicos-e-175-porcas-de-rebite': {
    displayName: 'Rebitadeira manual Avento BT-606',
    tagline: 'Com 6 bicos e 175 porcas de rebite.',
    specs: ['6 bicos', '175 porcas'],
    searchTerms: ['rebitadeira', 'rebite', 'porca rebite'],
  },
  'furadeira-impacto-1-2-pol-550w-gsb550-re-kit-14-brocas-bosch': {
    displayName: 'Furadeira de impacto Bosch GSB 550',
    tagline: 'Encaixe de 1/2" e kit com 14 brocas.',
    specs: ['550 W', '14 brocas'],
    searchTerms: ['furadeira', 'bosch', 'furar', 'broca', 'parede'],
  },
  'esmerilhadeira-angular-7-pol-2000w-controle-velocidade-180mm': {
    displayName: 'Esmerilhadeira angular 7" 2000 W',
    tagline: 'Com controle de velocidade, 180 mm.',
    specs: ['2000 W', '180 mm'],
    searchTerms: ['esmerilhadeira', 'lixadeira', 'cortar', 'disco', 'metal'],
  },
  'serra-sabre-a-bateria-21v-profissional-portatil-3000-rpm': {
    displayName: 'Serra sabre a bateria 21 V',
    tagline: 'Portátil, com até 3000 rpm.',
    specs: ['21 V', '3000 RPM'],
    searchTerms: ['serra', 'sabre', 'poda', 'cortar', 'bateria'],
  },
  'lixadeira-orbital-de-lixa-btl150-10000-rpm-150w-preta-cor-preto-frequencia-60hz-220v-the-black-tools': {
    displayName: 'Lixadeira orbital BTL150',
    tagline: '150 W e 10.000 rpm, em 220 V.',
    specs: ['150 W', '10.000 RPM'],
    searchTerms: ['lixadeira', 'lixar', 'madeira', 'orbital'],
  },
  'politriz-angular-automotiva-7-polegadas-1200w-profissional-bpa1200-the-black-tools': {
    displayName: 'Politriz angular automotiva 7"',
    tagline: 'Modelo BPA1200, com 1200 W.',
    specs: ['1200 W'],
    searchTerms: ['politriz', 'polir', 'polimento', 'carro', 'pintura'],
  },
  '1l-snow-foam-canhao-de-espuma-wap-com-rapida-1-4-14mm-engate': {
    displayName: 'Canhão de espuma snow foam WAP',
    tagline: 'Reservatório de 1 l e engate rápido.',
    specs: ['1 l'],
    searchTerms: ['snow foam', 'espuma', 'lavar carro', 'lava jato', 'canhao'],
  },
  'lavadora-lava-jato-portatil-pressao-2-baterias-maleta': {
    displayName: 'Lava jato portátil a bateria',
    tagline: 'Vem com 2 baterias e maleta.',
    specs: ['2 baterias'],
    searchTerms: ['lava jato', 'lavadora', 'lavar carro', 'sem fio', 'bateria'],
  },
  'painel-ferramentas-organizador-perfurado-118x52-brindes': {
    displayName: 'Painel perfurado para ferramentas',
    tagline: 'Organizador de 118 x 52, com brindes.',
    specs: ['118x52'],
    searchTerms: ['painel', 'organizador', 'pegboard', 'parede', 'oficina'],
  },
  'bolsa-ferramentas-grande-reforcada-eletricista-mala-bolsos-cor-amarelo': {
    displayName: 'Bolsa de ferramentas grande',
    tagline: 'Reforçada, com bolsos, para eletricista.',
    specs: [],
    searchTerms: ['bolsa', 'mala', 'eletricista', 'organizar', 'ferramentas'],
  },
  'detector-scanner-de-fios-canos-pvc-metais-madeira-parede': {
    displayName: 'Detector de fios, canos e metais',
    tagline: 'Detecta PVC, metal e madeira dentro da parede.',
    specs: [],
    searchTerms: ['detector', 'parede', 'furar', 'cano', 'fio', 'scanner'],
  },
  'termometro-infravermelho-brasiliana-tech-digital-para-culinaria-e-industrial-ate-400-c-1bf0fb7d': {
    displayName: 'Termômetro infravermelho digital',
    tagline: 'Até 400 °C, com visor LCD, para cozinha e churrasco.',
    specs: ['400 °C', 'Visor LCD'],
    searchTerms: ['termometro', 'infravermelho', 'churrasco', 'cozinha', 'temperatura'],
  },
  'soprador-aspirador-portatil-com-2-baterias-22-000-rpm-saco-coletor-e-tubos-para-folhas-73e5fae6': {
    displayName: 'Soprador e aspirador a bateria',
    tagline: 'Com 2 baterias e saco coletor, para folhas e poeira.',
    specs: ['22.000 RPM', '2 baterias'],
    searchTerms: ['soprador', 'aspirador', 'folhas', 'jardim', 'quintal'],
  },
  'camera-termica-minie-96-96-hikimicro-ios-android': {
    displayName: 'Câmera térmica MiniE 96×96',
    tagline: 'Conecta em celulares iOS e Android.',
    specs: ['96×96'],
    searchTerms: ['camera termica', 'termografia', 'calor', 'vazamento', 'eletrica'],
  },
  'torquimetro-de-estalo-bidirecional-profissional-1-2-ajustavel-28-a-210-nm-para-mecanica': {
    displayName: 'Torquímetro de estalo 1/2"',
    tagline: 'Bidirecional e ajustável, para mecânica.',
    specs: ['28 a 210 Nm'],
    searchTerms: ['torquimetro', 'torque', 'roda', 'mecanica', 'motor'],
  },
  'jogo-chaves-combinadas-gedore-robust-s09105012-06-22mm-12-pecas-cromado': {
    displayName: 'Jogo de chaves combinadas Gedore',
    tagline: '12 peças cromadas, de 6 a 22 mm.',
    specs: ['12 peças'],
    searchTerms: ['chave combinada', 'jogo de chaves', 'gedore', 'mecanica'],
  },
  'jogo-serra-copo-16-pecas-19mm-a-127mm-para-madeira-gesso-pvc-mdf-compensado-kit-completo-28b834c0': {
    displayName: 'Jogo de serra copo 16 peças',
    tagline: 'De 19 a 127 mm, para madeira, gesso, PVC e MDF.',
    specs: ['16 peças'],
    searchTerms: ['serra copo', 'furar', 'madeira', 'gesso', 'furadeira'],
  },
  'maquina-inversora-de-solda-mma-max-tig-aco-inox-140a-start': {
    displayName: 'Máquina de solda inversora 140 A',
    tagline: 'MMA e TIG, para aço e inox.',
    specs: ['140 A'],
    searchTerms: ['solda', 'inversora', 'soldar', 'tig', 'eletrodo'],
  },
  'motosserra-eletrica-portatil-gm-bear-de-6-com-2-baterias-para-poda-e-jardinagem': {
    displayName: 'Motosserra elétrica portátil 6"',
    tagline: 'Com 2 baterias, para poda e jardinagem.',
    specs: ['2 baterias'],
    searchTerms: ['motosserra', 'poda', 'jardim', 'galho', 'serra'],
  },
  'kit-multimetro-alicate-amperimetro-desencapador-crimpar-6x1': {
    displayName: 'Kit multímetro e alicate amperímetro',
    tagline: 'Kit 6 em 1, com desencapador e alicate de crimpar.',
    specs: ['6x1'],
    searchTerms: ['multimetro', 'alicate', 'amperimetro', 'eletrica', 'crimpar'],
  },
};

/** Apelidos de `?p=` -> slug real (derivado de EDITORIAL). */
export const PRODUCT_ALIASES: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(EDITORIAL).flatMap(([slug, e]) => (e.aliases ?? []).map((alias) => [alias, slug])),
);

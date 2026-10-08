import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const alt = 'Caion da Oficina: achados em ferramentas, carro e casa';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

async function token(name: string): Promise<string> {
  const css = await readFile(join(process.cwd(), 'src/app/globals.css'), 'utf8');
  const match = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match) throw new Error(`Token --color-${name} não encontrado`);
  return match[1];
}

export default async function OpenGraph() {
  const [font, photo, ground, ink, ink2, plate, readout] = await Promise.all([
    readFile(join(process.cwd(), 'node_modules/@fontsource/archivo/files/archivo-latin-700-normal.woff')),
    readFile(join(process.cwd(), 'src/assets/caio/caio-og-560.jpg')),
    token('ground'), token('ink'), token('ink-2'), token('plate'), token('readout'),
  ]);
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: ground, color: ink, fontFamily: 'Archivo' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28, padding: '0 64px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: plate, color: readout, borderRadius: 999, padding: '10px 22px', fontSize: 26, alignSelf: 'flex-start' }}>
            Ferramentas · Carro · Casa
          </div>
          <div style={{ fontSize: 92, lineHeight: 1, letterSpacing: -2 }}>Caion da Oficina</div>
          <div style={{ fontSize: 36, lineHeight: 1.25, color: ink2 }}>Ferramentas, carro e casa, com link direto para o Mercado Livre.</div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/jpeg;base64,${photo.toString('base64')}`} width={560} height={630} alt="" style={{ objectFit: 'cover' }} />
      </div>
    ),
    { ...size, fonts: [{ name: 'Archivo', data: font, weight: 700, style: 'normal' }] },
  );
}

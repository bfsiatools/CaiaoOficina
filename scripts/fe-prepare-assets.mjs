// Rodado À MÃO quando a arte mudar. Os derivados vão para o Git. Rodar duas vezes sem mexer na arte dá o mesmo SHA-256.
// Fontes (fornecidas por Bernardo; personagem Caio, imagem canônica da marca, NÃO regerada aqui):
//   node scripts/fe-prepare-assets.mjs "C:\Users\berna\Downloads\FOTODOCAIAO.jpeg" "C:\Users\berna\Downloads\CAIAOCOMCOMPRESSOR.jpeg"
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const [photoPath, compressorPath] = process.argv.slice(2);
if (!photoPath || !compressorPath) throw new Error('Uso: node scripts/fe-prepare-assets.mjs <FOTODOCAIAO.jpeg> <CAIAOCOMCOMPRESSOR.jpeg>');

const out = 'src/assets/caio';
await mkdir(out, { recursive: true });
const css = await readFile('src/app/globals.css', 'utf8');
const token = (name) => { const m = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`)); if (!m) throw new Error(`Token --color-${name} não encontrado: atualize o script em vez de chutar uma cor`); return m[1]; };
const sha = (buffer) => createHash('sha256').update(buffer).digest('hex');

const face = () => sharp(photoPath).extract({ left: 180, top: 130, width: 420, height: 420 });
const outputs = {
  'caio-avatar-96.webp': await face().resize(96, 96).webp({ quality: 82 }).toBuffer(),
  'caio-avatar-192.webp': await face().resize(192, 192).webp({ quality: 82 }).toBuffer(),
  'caio-sobre-720.webp': await sharp(photoPath).resize({ width: 720 }).webp({ quality: 80 }).toBuffer(),
  'caio-og-560.jpg': await sharp(photoPath).extract({ left: 0, top: 0, width: 768, height: 864 }).resize(560, 630).jpeg({ quality: 82, mozjpeg: true }).toBuffer(),
  'frame-compressor.webp': await sharp(compressorPath).resize(360, 640, { fit: 'cover' }).webp({ quality: 80 }).toBuffer(),
};
const appleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${token('plate')}"/><path d="M45 21.5A16.5 16.5 0 1 0 45 42.5" fill="none" stroke="${token('readout')}" stroke-width="10" stroke-linecap="round"/></svg>`;
const apple = await sharp(Buffer.from(appleSvg)).resize(180, 180).flatten({ background: token('plate') }).png({ compressionLevel: 9 }).toBuffer();
const meta = await sharp(apple).metadata();
if (meta.hasAlpha) throw new Error('apple-icon.png precisa de fundo sólido (sem alpha)');
await writeFile('src/app/apple-icon.png', apple);

const sums = [];
for (const [name, buffer] of Object.entries(outputs)) { await writeFile(`${out}/${name}`, buffer); sums.push(`${sha(buffer)}  ${name}  ${buffer.length}B`); }
sums.push(`${sha(apple)}  ../../app/apple-icon.png  ${apple.length}B`);
await writeFile(`${out}/SHA256SUMS.txt`, `${sums.join('\n')}\n`);
await writeFile(`${out}/PROVENANCE.md`, `# Proveniência\n\nFonte: imagens do personagem Caio fornecidas por Bernardo (criadas fora deste repositório, com IA). Não regeradas aqui; só recortadas e reduzidas por \`scripts/fe-prepare-assets.mjs\`.\n\nSHA-256 das fontes:\n- ${sha(await readFile(photoPath))}  FOTODOCAIAO.jpeg\n- ${sha(await readFile(compressorPath))}  CAIAOCOMCOMPRESSOR.jpeg\n`);
console.log(sums.join('\n'));

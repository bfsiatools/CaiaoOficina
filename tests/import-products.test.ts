import { describe,it,expect } from 'vitest';
import { parseProductsTxt, makeSlug } from '../scripts/lib/parse-products';
import { buildImportPlan } from '../scripts/lib/import-plan';
import { prepareImage,prepareReportedImage } from '../scripts/lib/images';
import sharp from 'sharp';
it('validates report against original dimensions before shrinking large images',async()=>{const png=await sharp({create:{width:3000,height:2000,channels:3,background:'white'}}).png().toBuffer();const value=await prepareReportedImage(png,'12345678-1234-4234-8234-123456789012',{width:3000,height:2000});expect(value.width).toBe(1600);expect(value.height).toBe(1067);await expect(prepareReportedImage(png,'12345678-1234-4234-8234-123456789012',{width:100,height:100})).rejects.toThrow(/Dimensões/);});
describe('real input parser',()=>{
 it('reads BOM, CRLF, pipe or the supplied colon format without rewriting links',()=>{const p=parseProductsTxt('\ufeffFerramenta Á | https://meli.la/AbCd\r\n\r\n===\r\nFerramenta B:https://meli.la/Zyx\r\n');expect(p.rows.map(r=>[r.name,r.url])).toEqual([['Ferramenta Á','https://meli.la/AbCd'],['Ferramenta B','https://meli.la/Zyx']]);expect(p.errors).toEqual([]);});
 it('deduplicates identical rows and refuses divergent names on one URL',()=>{const p=parseProductsTxt('A | https://meli.la/AbC\nA | https://meli.la/AbC\nB | https://meli.la/AbC');expect(p.rows).toHaveLength(0);expect(p.duplicates).toBe(1);expect(p.errors.length).toBeGreaterThan(0);});
 it('reports malformed lines without contaminating valid products',()=>{const p=parseProductsTxt('Bom:https://meli.la/AbC\nRuim | https://evil.test/x\nSem link:');expect(p.rows).toHaveLength(1);expect(p.errors).toHaveLength(2);});
 it('makes short ASCII slugs while preserving meaningful accents in names',()=>{expect(makeSlug('Câmera Térmica', 'txt-sha256:'+'a'.repeat(64))).toBe('camera-termica');expect(makeSlug('Ferramenta '.repeat(30),'txt-sha256:'+'a'.repeat(64)).length).toBeLessThanOrEqual(100);});
});
describe('import preservation',()=>{
 const source={id:'12345678-1234-4234-8234-123456789012',import_key:'key',slug:'product',name:'Nome original',status:'active',short_description:'Descrição',image_path:null,image_alt:null,image_width:null,image_height:null,sort_order:0,featured_rank:null,daily_pick_date:null,daily_pick_rank:0};
 const link={id:'12345678-1234-4234-8234-123456789013',affiliate_url:'https://meli.la/AbC'};
 it('preserves a manual name, slug, inactive status and changed current URL on reimport',()=>{
  const manifest={rows:[{product:source,link,category_slugs:['automotivo'],appliedSource:{product:source,link,category_slugs:['automotivo']},appliedState:{product:source,link,category_slugs:['automotivo']}}]};
  const existing=[{product:{...source,name:'Nome editorial',slug:'edited',status:'inactive',updated_at:'2026-10-07T00:00:00Z'},link:{...link,affiliate_url:'https://meli.la/New'},category_slugs:['automotivo']}];
  const plan=buildImportPlan(manifest,existing);expect(plan.errors).toEqual([]);expect(plan.rows[0].action).toBe('ignored');expect(plan.rows[0].payload.name).toBe('Nome editorial');expect(plan.rows[0].payload.slug).toBe('edited');expect(plan.rows[0].payload.status).toBe('inactive');
 });
 it('flags source edit conflicting with a manual edit',()=>{const manifest={rows:[{product:{...source,name:'Novo nome'},link,category_slugs:[],appliedSource:{product:source,link,category_slugs:[]},appliedState:{product:source,link,category_slugs:[]}}]};expect(buildImportPlan(manifest,[{product:{...source,name:'Nome manual'},link,category_slugs:[]}]).errors).toHaveLength(1);});
});
it('encodes WebP without enlarging an image or keeping metadata',async()=>{const png=await sharp({create:{width:30,height:20,channels:3,background:'white'}}).png().toBuffer();const result=await prepareImage(png,'12345678-1234-4234-8234-123456789012');expect(result.width).toBe(30);expect(result.height).toBe(20);expect((await sharp(result.bytes).metadata()).format).toBe('webp');expect(result.path).toMatch(/^[0-9a-f-]{36}\/[0-9a-f]{64}\.webp$/);await expect(prepareImage(Buffer.from('invalid'),'12345678-1234-4234-8234-123456789012')).rejects.toThrow();});

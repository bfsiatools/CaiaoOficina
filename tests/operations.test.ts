import { it,expect } from 'vitest';
import { buildRollbackPlan,imagesToUpload } from '../scripts/lib/operations';
import { buildImportPlan,type ImportState,type ManifestRow } from '../scripts/lib/import-plan';
const state:ImportState={product:{id:'12345678-1234-4234-8234-123456789012',import_key:'key',slug:'test',name:'Original',status:'active',updated_at:'2026-10-07'},link:{id:'12345678-1234-4234-8234-123456789013',affiliate_url:'https://meli.la/AAA'},category_slugs:['automotivo']};
it('existing divergent editorial data cannot be overwritten when source baseline is missing',()=>{const source={...state,product:{...state.product,name:'Changed'}};expect(buildImportPlan({rows:[source]},[state]).errors).toHaveLength(1);});
it('rollback disables created rows, restores previous editorial state and refuses subsequent edits',()=>{
 const before={...state,product:{...state.product,name:'Before'}};
 const report={proofVersion:1,status:'committed',rows:[{action:'created',payload:state.product,before:null}],after:[state]};
 expect(buildRollbackPlan(report,[state]).rows[0]).toMatchObject({status:'inactive',expected_updated_at:'2026-10-07'});
 const restore=buildRollbackPlan({...report,rows:[{action:'updated',payload:state.product,before}]},[state]);expect(restore.rows[0].name).toBe('Before');
 const edited={...state,product:{...state.product,name:'Edited',updated_at:'new'}};expect(buildRollbackPlan(report,[edited]).errors).toHaveLength(1);
 expect(()=>buildRollbackPlan({...report,status:'prepared'},[state])).toThrow();
 expect(()=>buildRollbackPlan({...report,proofVersion:undefined},[state])).toThrow(/atômico/);
});
it('manual image survives reimport and is never overwritten with original prepared bytes',()=>{
 const source:ManifestRow={...state,product:{...state.product,image_path:'old.webp'},preparedFile:'prepared/old.webp',appliedSource:{...state,product:{...state.product,image_path:'old.webp'}},appliedState:{...state,product:{...state.product,image_path:'old.webp'}}};
 const current={...state,product:{...state.product,image_path:'manual.webp'}};
 source.product={...source.product,name:'Changed source'};const plan=buildImportPlan({rows:[source]},[current]);expect(plan.rows[0].payload.image_path).toBe('manual.webp');expect(imagesToUpload(plan.rows)).toHaveLength(0);
});

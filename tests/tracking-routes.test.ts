import { describe,it,expect,vi } from 'vitest';
import { redirectRequest } from '../src/lib/affiliate/redirect';
import { collectRequest } from '../src/lib/tracking/collect';
import { campaignContext } from '../src/lib/tracking/context';
const id='12345678-1234-4234-8234-123456789012',linkId='12345678-1234-4234-8234-123456789013';
const payload={eventId:id,eventType:'product_click',productId:id,affiliateLinkId:linkId,pagePath:'/',placement:'catalog_card',ctaId:'buy'};
describe('conversion routes',()=>{
 it('redirect uses only stored URL; HEAD/prefetch never track and analytics failure does not block',async()=>{
  const record=vi.fn().mockRejectedValue(Error('unavailable')),tasks:(()=>Promise<void>)[]=[];
  const deps={enabled:true,tracking:true,lookup:async()=>({id,offer:{id:linkId,affiliateUrl:'https://meli.la/ORIGINAL'}}),record,after:(f:()=>Promise<void>)=>tasks.push(f)};
  const response=await redirectRequest(new Request('http://localhost:3000/go/test?url=https://evil.test&content_id=v1'),'test',deps);
  expect(response.status).toBe(302);expect(response.headers.get('location')).toBe('https://meli.la/ORIGINAL');expect(response.headers.get('cache-control')).toContain('no-store');
  await expect(tasks[0]()).resolves.toBeUndefined();expect(record.mock.calls[0][0]).toMatchObject({placement:'redirect',contentId:'v1',affiliateLinkId:linkId});
  tasks.length=0;await redirectRequest(new Request('http://localhost:3000/go/test',{method:'HEAD'}),'test',deps);await redirectRequest(new Request('http://localhost:3000/go/test',{headers:{purpose:'prefetch'}}),'test',deps);expect(tasks).toHaveLength(0);
 });
 it('redirect returns 404 for missing product and 503 for unavailable/unsafe destination',async()=>{
  const deps={enabled:true,tracking:false,record:vi.fn(),after:vi.fn(),lookup:async()=>null};
  expect((await redirectRequest(new Request('http://localhost/go/missing'),'missing',deps)).status).toBe(404);
  expect((await redirectRequest(new Request('http://localhost/go/a'),'a',{...deps,lookup:async()=>{throw Error('DB');}})).status).toBe(503);
  expect((await redirectRequest(new Request('http://localhost/go/a'),'a',{...deps,lookup:async()=>({id,offer:{id:linkId,affiliateUrl:'https://evil.test'}})})).status).toBe(503);
  expect((await redirectRequest(new Request('http://localhost/go/a'),'a',{...deps,enabled:false})).status).toBe(503);
 });
 it('events enforce origin, content-type, byte limit, strict fields and server quality',async()=>{
  const record=vi.fn().mockResolvedValue('inserted');const deps={origin:'http://localhost:3000',enabled:true,appEnv:'preview' as const,allow:()=>true,record};
  const req=(body:unknown,origin='http://localhost:3000')=>new Request('http://localhost:3000/api/events',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
  expect((await collectRequest(req(payload),deps)).status).toBe(202);expect(record.mock.calls[0]).toEqual([expect.objectContaining(payload),'test']);
  expect((await collectRequest(req(payload,'https://evil.test'),deps)).status).toBe(403);
  expect((await collectRequest(req({...payload,eventQuality:'accepted'}),deps)).status).toBe(400);
  expect((await collectRequest(req({...payload,placement:'redirect'}),deps)).status).toBe(400);
  expect((await collectRequest(req({...payload,utmContent:'x'.repeat(5000)}),deps)).status).toBe(413);
  expect((await collectRequest(req(payload),{...deps,allow:()=>false})).status).toBe(429);
  expect((await collectRequest(req(payload),{...deps,record:async()=>{throw Error('DB');}})).status).toBe(503);
 });
 it('campaign data is bounded and referrer retains only hostname; content id has precedence',()=>{
  expect(campaignContext(new URL('http://local/?utm_source=yt&video_id=old&content_id=new'),'https://example.com/private?secret=1')).toMatchObject({utmSource:'yt',contentId:'new',referrerHost:'example.com',attributionMethod:'utm'});
  expect(campaignContext(new URL('http://local/?utm_campaign='+ 'a'.repeat(500)))).toMatchObject({utmCampaign:null,attributionMethod:'unknown'});
 });
});

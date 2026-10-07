import { it,expect,vi } from 'vitest';
import { trackClick } from '../src/lib/tracking/client';
it('client tracking keeps navigation independent and beacon fallback uses one event id',()=>{
 const fetcher=vi.fn().mockResolvedValue({}),beacon=vi.fn().mockReturnValue(false);
 const environment={url:new URL('http://localhost:3000/?utm_source=yt'),referrer:'https://youtube.com/watch?v=x',beacon,fetch:fetcher,eventId:()=> '12345678-1234-4234-8234-123456789012'};
 const result=trackClick({eventType:'whatsapp_click',placement:'whatsapp_cta',ctaId:'whatsapp'},environment);
 expect(result).toBeUndefined();expect(beacon).toHaveBeenCalledTimes(1);expect(fetcher).toHaveBeenCalledTimes(1);const input=JSON.parse(fetcher.mock.calls[0][1].body);expect(input).toMatchObject({eventId:'12345678-1234-4234-8234-123456789012',utmSource:'yt',pagePath:'/'});
 expect(()=>trackClick({eventType:'whatsapp_click',placement:'whatsapp_cta',ctaId:'whatsapp'},{...environment,beacon:()=>{throw Error('Browser restriction');}})).not.toThrow();
});

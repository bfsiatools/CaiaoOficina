import 'server-only';
export const PROJECT_REF = 'lyhybytsfbdiodtsytqc';
export interface ServerEnv { supabaseUrl: string; publishableKey: string; secretKey?: string; siteUrl?: string; revalidationSecret?: string; appEnv: 'preview' | 'production'; trackingEnabled: boolean; redirectEnabled: boolean }
export function readServerEnv(input: Record<string, string | undefined> = process.env): ServerEnv {
  if (input.SUPABASE_URL !== `https://${PROJECT_REF}.supabase.co` || !input.SUPABASE_PUBLISHABLE_KEY || !['preview', 'production'].includes(input.APP_ENV || 'preview')) throw new Error('Configuração de servidor inválida ou ausente');
  return { supabaseUrl: input.SUPABASE_URL, publishableKey: input.SUPABASE_PUBLISHABLE_KEY, secretKey: input.SUPABASE_SECRET_KEY || input.SUPABASE_SERVICE_ROLE_KEY || undefined, siteUrl: input.SITE_URL || undefined, revalidationSecret: input.CATALOG_REVALIDATION_SECRET || undefined, appEnv: (input.APP_ENV || 'preview') as ServerEnv['appEnv'], trackingEnabled: input.TRACKING_ENABLED === 'true', redirectEnabled: input.AFFILIATE_REDIRECT_ENABLED === 'true' };
}

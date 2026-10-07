import type { NextConfig } from 'next';
const config: NextConfig = {
  poweredByHeader: false,
  images: { remotePatterns: [{ protocol: 'https', hostname: 'lyhybytsfbdiodtsytqc.supabase.co', pathname: '/storage/v1/object/public/product-images/**' }], qualities: [85] },
};
export default config;

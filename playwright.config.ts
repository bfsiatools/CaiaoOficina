import { defineConfig } from '@playwright/test';
import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
export default defineConfig({testDir:'./tests/e2e',fullyParallel:false,workers:1,use:{baseURL:process.env.E2E_BASE_URL??process.env.SITE_URL??'http://localhost:3000'},reporter:'list'});

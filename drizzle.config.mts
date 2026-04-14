/// <reference types="node" />

import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env['DATABASE_URL'];

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run drizzle-kit commands.');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './packages/db/src/index.ts',
  out: './infra/migrations',
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
  strict: true,
});

import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/models',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.cjs',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});

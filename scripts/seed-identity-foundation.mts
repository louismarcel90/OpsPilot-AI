/// <reference types="node" />

import { createPostgresConnection, seedIdentityFoundation } from '../packages/db/src/index.js';

const databaseUrl = process.env['DATABASE_URL'];

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to seed the identity foundation data.');
}

const connection = createPostgresConnection({
  databaseUrl,
});

try {
  await seedIdentityFoundation(connection);
  console.log('Identity foundation seed completed successfully.');
} finally {
  await connection.close();
}

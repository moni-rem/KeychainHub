const { PrismaClient } = require('@prisma/client');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { PrismaNeon } = require('@prisma/adapter-neon');
const ws = require('ws');

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Create a connection pool
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

// Create Prisma Client with Neon adapter
const prisma = new PrismaClient({ adapter });

// Connection events
prisma.$connect()
  .then(() => {
    console.log('✅ Connected to Neon PostgreSQL');
  })
  .catch((error) => {
    console.error('❌ Failed to connect to Neon:', error.message);
  });

// Handle cleanup
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  await pool.end();
});

module.exports = prisma;

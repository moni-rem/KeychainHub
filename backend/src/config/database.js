const { PrismaClient } = require('@prisma/client');

// Check if we're using Neon
const isNeon = process.env.DATABASE_URL?.includes('neon.tech');

let prisma;

if (isNeon && process.env.NODE_ENV === 'production') {
  // Use Neon adapter for production
  try {
    const { Pool, neonConfig } = require('@neondatabase/serverless');
    const { PrismaNeon } = require('@prisma/adapter-neon');
    const ws = require('ws');
    
    neonConfig.webSocketConstructor = ws;
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaNeon(pool);
    prisma = new PrismaClient({ adapter });
    
    console.log('🚀 Using Neon PostgreSQL with WebSocket connection');
  } catch (error) {
    console.warn('⚠️ Neon adapter not available, using default Prisma Client');
    prisma = new PrismaClient();
  }
} else {
  // Use regular Prisma Client for development
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'info', 'warn', 'error'] 
      : ['error'],
  });
}

// Test connection on startup
prisma.$connect()
  .then(async () => {
    console.log('✅ Database connected successfully');
    
    // Log database info
    const dbInfo = await prisma.$queryRaw`
      SELECT 
        current_database() as database,
        version() as version,
        current_user as user
    `;
    
    console.log(`📊 Database: ${dbInfo[0].database}`);
    console.log(`👤 User: ${dbInfo[0].user}`);
    console.log(`🔧 Version: ${dbInfo[0].version.split(' ')[0]}`);
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
  });

// Handle cleanup
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;

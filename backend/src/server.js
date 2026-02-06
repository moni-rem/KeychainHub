const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Test database connection on startup
async function testDatabase() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Count records
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    
    console.log(`📊 Database has ${userCount} users and ${productCount} products`);
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Start server
async function startServer() {
  console.log('🔍 Testing database connection...');
  const dbConnected = await testDatabase();
  
  if (!dbConnected) {
    console.log('⚠️ Starting server without database connection...');
  }
  
  app.listen(PORT, () => {
    console.log(`
🚀 Server running on port ${PORT}
📁 Environment: ${process.env.NODE_ENV || 'development'}
🔗 Health check: http://localhost:${PORT}/api/health
🛍️ Products: http://localhost:${PORT}/api/products
🔐 Register: POST http://localhost:${PORT}/api/auth/register
🔐 Login: POST http://localhost:${PORT}/api/auth/login
    `);
  });
}

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

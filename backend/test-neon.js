require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

console.log('🔍 Testing Neon PostgreSQL Connection...\n');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testNeon() {
  try {
    console.log('1. Connecting to Neon PostgreSQL...');
    await prisma.$connect();
    console.log('✅ Connected to Neon successfully!');
    
    // Test database version
    console.log('\n2. Checking database version...');
    const version = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Database:', version[0].version.split(' ')[0]);
    
    // Check your DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    const host = dbUrl.match(/@([^/]+)/)?.[1];
    console.log('✅ Host:', host || 'Unknown');
    
    // Test schema
    console.log('\n3. Testing schema...');
    const userCount = await prisma.user.count();
    console.log(`✅ Users: ${userCount}`);
    
    const productCount = await prisma.product.count();
    console.log(`✅ Products: ${productCount}`);
    
    const orderCount = await prisma.order.count();
    console.log(`✅ Orders: ${orderCount}`);
    
    // Test a complex query
    console.log('\n4. Testing complex queries...');
    const featuredProducts = await prisma.product.findMany({
      where: { isFeatured: true },
      take: 3
    });
    console.log(`✅ Featured products: ${featuredProducts.length}`);
    
    console.log('\n🎉 Neon PostgreSQL is working perfectly!');
    
  } catch (error) {
    console.error('\n❌ Neon Connection Failed!');
    console.error('Error:', error.message);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your Neon DATABASE_URL in .env');
    console.log('2. Make sure Neon project is active');
    console.log('3. Check if IP is allowed in Neon settings');
    console.log('4. Try adding ?sslmode=require to URL');
    
  } finally {
    await prisma.$disconnect();
  }
}

testNeon();

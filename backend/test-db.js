require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  console.log('🔍 Testing Database Connection...\n');
  
  try {
    // 1. Test raw SQL connection
    console.log('1. Testing raw SQL connection...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Raw SQL query successful:', result);
    
    // 2. Test schema
    console.log('\n2. Testing database schema...');
    
    // Check if users table exists and count rows
    const userCount = await prisma.user.count();
    console.log(`✅ Users table accessible. Total users: ${userCount}`);
    
    // Check if products table exists
    const productCount = await prisma.product.count();
    console.log(`✅ Products table accessible. Total products: ${productCount}`);
    
    // 3. Test a sample query
    console.log('\n3. Testing sample queries...');
    
    const sampleUser = await prisma.user.findFirst();
    console.log('✅ Sample user query:', sampleUser ? `Found user: ${sampleUser.email}` : 'No users found');
    
    const sampleProduct = await prisma.product.findFirst();
    console.log('✅ Sample product query:', sampleProduct ? `Found product: ${sampleProduct.name}` : 'No products found');
    
    // 4. Test relationships
    console.log('\n4. Testing relationships...');
    
    if (sampleUser) {
      const userCart = await prisma.cart.findUnique({
        where: { userId: sampleUser.id },
        include: { items: true }
      });
      console.log(`✅ User cart relationship: ${userCart ? 'Cart exists' : 'No cart found'}`);
    }
    
    console.log('\n🎉 ALL DATABASE TESTS PASSED!');
    
  } catch (error) {
    console.error('\n❌ DATABASE CONNECTION FAILED!');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting steps:');
    console.log('1. Check if database is running');
    console.log('2. Verify DATABASE_URL in .env file');
    console.log('3. Run: npx prisma generate');
    console.log('4. Run: npx prisma db push');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

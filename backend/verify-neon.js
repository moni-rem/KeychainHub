const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function verifyNeonSetup() {
  console.log('🔍 Verifying Neon PostgreSQL Setup...\n');
  
  // 1. Check .env
  console.log('1. Checking environment...');
  require('dotenv').config();
  
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL not found in .env');
    return false;
  }
  
  const isNeon = process.env.DATABASE_URL.includes('neon.tech');
  console.log(`✅ DATABASE_URL found ${isNeon ? '(Neon)' : '(Not Neon)'}`);
  console.log(`   URL: ${process.env.DATABASE_URL.replace(/:[^:]*@/, ':***@')}`);
  
  // 2. Check Prisma
  console.log('\n2. Checking Prisma...');
  try {
    const { stdout: prismaVersion } = await execAsync('npx prisma --version');
    console.log(`✅ Prisma: ${prismaVersion.trim()}`);
  } catch (error) {
    console.log('❌ Prisma not found');
    return false;
  }
  
  // 3. Test database connection
  console.log('\n3. Testing database connection...');
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Get database info
    const [dbInfo, counts] = await Promise.all([
      prisma.$queryRaw`SELECT current_database() as name, version() as version`,
      Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.order.count()
      ])
    ]);
    
    console.log(`✅ Database: ${dbInfo[0].name}`);
    console.log(`✅ Version: ${dbInfo[0].version.split(' ')[0]}`);
    console.log(`✅ Records: ${counts[0]} users, ${counts[1]} products, ${counts[2]} orders`);
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return false;
  }
  
  // 4. Check Neon specific
  if (isNeon) {
    console.log('\n4. Checking Neon dependencies...');
    try {
      require('@neondatabase/serverless');
      require('@prisma/adapter-neon');
      console.log('✅ Neon dependencies installed');
    } catch (error) {
      console.log('⚠️ Neon dependencies not installed');
      console.log('   Run: npm install @neondatabase/serverless @prisma/adapter-neon ws');
    }
  }
  
  console.log('\n🎉 Verification complete!');
  console.log('\n📋 Summary:');
  console.log(`   Database: ${isNeon ? 'Neon PostgreSQL ✅' : 'Local PostgreSQL'}`);
  console.log(`   Connection: ${process.env.DATABASE_URL.includes('pooler') ? 'With connection pooler' : 'Direct'}`);
  console.log(`   SSL: ${process.env.DATABASE_URL.includes('sslmode=require') ? 'Enabled ✅' : 'Not enabled ⚠️'}`);
  
  return true;
}

verifyNeonSetup().then(success => {
  if (success) {
    console.log('\n🚀 Ready to use Neon PostgreSQL!');
    console.log('Start server with: npm run dev');
  } else {
    console.log('\n⚠️ Some issues found. Please check above.');
  }
});

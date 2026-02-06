#!/bin/bash
echo "🚀 Setting up Neon PostgreSQL for Keychain Shop..."
echo "==================================================="

# Load environment
if [ -f .env ]; then
  source .env
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not found in .env"
  echo "Please add your Neon connection string to .env"
  echo ""
  echo "Example:"
  echo "DATABASE_URL=\"postgresql://username:password@ep-xxx-neon.tech/dbname?sslmode=require\""
  exit 1
fi

echo "✅ DATABASE_URL found"
echo "🔗 Connecting to: $(echo $DATABASE_URL | sed 's/:[^:]*@/:***@/')"

# Extract database info for display
DB_HOST=$(echo $DATABASE_URL | grep -o '@[^/]*' | sed 's/@//')
DB_NAME=$(echo $DATABASE_URL | grep -o '/[^?]*' | sed 's/\///' | tail -1)
echo "🌐 Host: $DB_HOST"
echo "🗄️ Database: $DB_NAME"

echo "\n📦 Installing dependencies..."
npm install

echo "\n🔧 Generating Prisma Client..."
npx prisma generate

echo "\n🚀 Pushing schema to Neon..."
npx prisma db push --accept-data-loss

echo "\n🌱 Seeding database..."
node prisma/seed.js

echo "\n🎉 Neon PostgreSQL setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start server: npm run dev"
echo "2. Test API: curl http://localhost:5001/api/health"
echo "3. Open Prisma Studio: npx prisma studio"
echo ""
echo "🔗 Prisma Studio: http://localhost:5555"
echo "🌐 API: http://localhost:5001"

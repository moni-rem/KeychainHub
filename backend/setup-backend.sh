#!/bin/bash
echo "🚀 Setting up Keychain Shop Backend..."

echo "📦 Checking dependencies..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "📁 Creating necessary directories..."
mkdir -p uploads/products uploads/avatars logs

echo "🔧 Checking environment file..."
if [ ! -f .env ]; then
    echo "⚙️ Creating .env file from template..."
    cat > .env << 'ENVEOF'
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/keychain_shop?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-change-in-production"
JWT_EXPIRE="7d"
ADMIN_JWT_SECRET="admin-secret-key-change-this-too"

# App
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
ADMIN_URL="http://localhost:3001"

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH="./uploads"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
ENVEOF
    echo "✅ .env file created. Please edit it with your database credentials."
fi

echo "📦 Installing npm packages..."
npm install

echo "🗄️ Generating Prisma client..."
npx prisma generate

echo "🚀 Starting database setup..."
echo "Choose database setup option:"
echo "1. Use SQLite (easiest for testing)"
echo "2. Use PostgreSQL (requires running database)"
read -p "Enter choice (1 or 2): " db_choice

if [ "$db_choice" = "1" ]; then
    echo "🔧 Setting up SQLite..."
    sed -i '' 's/provider = "postgresql"/provider = "sqlite"/g' prisma/schema.prisma
    sed -i '' 's|url      = env("DATABASE_URL")|url      = "file:./dev.db"|g' prisma/schema.prisma
    echo "DATABASE_URL=\"file:./dev.db\"" > .env
    npx prisma db push --accept-data-loss
elif [ "$db_choice" = "2" ]; then
    echo "🔧 Setting up PostgreSQL..."
    echo "Please ensure PostgreSQL is running on localhost:5432"
    echo "Database: keychain_shop"
    echo "Username: postgres"
    echo "Password: password"
    npx prisma migrate dev --name init
else
    echo "❌ Invalid choice. Using SQLite by default."
    sed -i '' 's/provider = "postgresql"/provider = "sqlite"/g' prisma/schema.prisma
    sed -i '' 's|url      = env("DATABASE_URL")|url      = "file:./dev.db"|g' prisma/schema.prisma
    echo "DATABASE_URL=\"file:./dev.db\"" > .env
    npx prisma db push --accept-data-loss
fi

echo "🌱 Seeding database..."
node src/prisma/seed.js

echo "✅ Setup complete!"
echo ""
echo "🎉 To start the server:"
echo "   npm run dev"
echo ""
echo "📊 To test database connection:"
echo "   node test-db.js"
echo ""
echo "🌐 Server will run at: http://localhost:5000"

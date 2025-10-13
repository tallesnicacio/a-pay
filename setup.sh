#!/bin/bash

echo "🚀 A-Pay Setup Script"
echo "====================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker first."
  exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
  echo "❌ pnpm is not installed. Installing..."
  npm install -g pnpm
fi

echo "1️⃣  Creating .env files..."
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "✅ Root .env created"
else
  echo "⚠️  Root .env already exists, skipping"
fi

if [ ! -f "backend/.env" ]; then
  cp backend/.env.example backend/.env
  echo "✅ Backend .env created"
else
  echo "⚠️  Backend .env already exists, skipping"
fi

if [ ! -f "frontend/.env" ]; then
  cp frontend/.env.example frontend/.env
  echo "✅ Frontend .env created"
else
  echo "⚠️  Frontend .env already exists, skipping"
fi

echo ""
echo "2️⃣  Installing dependencies..."
pnpm install
cd backend && pnpm install
cd ../frontend && pnpm install
cd ..
echo "✅ Dependencies installed"

echo ""
echo "3️⃣  Starting Docker services..."
docker-compose up -d
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

echo ""
echo "4️⃣  Running database migrations..."
cd backend
pnpm prisma:generate
pnpm prisma:migrate
echo "✅ Migrations completed"

echo ""
echo "5️⃣  Seeding database..."
pnpm prisma:seed
echo "✅ Database seeded"

cd ..

echo ""
echo "✨ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "  1. Review and update .env files if needed"
echo "  2. Run 'pnpm dev' to start development servers"
echo "  3. Access:"
echo "     - Frontend: http://localhost:5173"
echo "     - Backend: http://localhost:3000"
echo "     - Health: http://localhost:3000/health"
echo ""
echo "📚 Credentials:"
echo "  - Admin: admin@apay.com"
echo "  - Garçom: garcom@churrasquinho.com"
echo ""
echo "Happy coding! 🎉"
